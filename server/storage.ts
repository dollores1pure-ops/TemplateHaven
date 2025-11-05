import {
  type AdminStats,
  type Cart,
  type CartItem,
  type InsertCartItem,
  type InsertTemplate,
  type InsertUser,
  type Order,
  type Template,
  type TemplateCategory,
  type TemplateStatus,
  type TemplateSummary,
  type UpdateTemplate,
  type User,
  templateStatusSchema,
} from "@shared/schema";
import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { EventEmitter } from "node:events";

const DEFAULT_TEMPLATE_IMAGE =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80";

const PERSISTENCE_VERSION = 1;

interface PersistedData {
  version: number;
  users: User[];
  templates: Template[];
  carts: Cart[];
  orders: Order[];
}

export type TemplateSort =
  | "newest"
  | "oldest"
  | "priceAsc"
  | "priceDesc"
  | "title";

export interface TemplateFilters {
  search?: string;
  category?: TemplateCategory | "all";
  status?: TemplateStatus | "all";
  minPrice?: number;
  maxPrice?: number;
  sort?: TemplateSort;
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUserCredentials(
    username: string,
    password: string,
  ): Promise<User | undefined>;

  // Templates
  listTemplates(filters?: TemplateFilters): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  getTemplateBySlug(slug: string): Promise<Template | undefined>;
  createTemplate(data: InsertTemplate): Promise<Template>;
  updateTemplate(
    id: string,
    updates: UpdateTemplate,
  ): Promise<Template | undefined>;
  deleteTemplate(id: string): Promise<boolean>;

  // Cart
  getOrCreateCart(cartId?: string): Promise<Cart>;
  addCartItem(cartId: string, item: InsertCartItem): Promise<Cart>;
  updateCartItem(
    cartId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<Cart>;
  removeCartItem(cartId: string, cartItemId: string): Promise<Cart>;
  clearCart(cartId: string): Promise<Cart>;

  // Orders & stats
  createOrderFromCart(cartId: string): Promise<Order>;
  listOrders(): Promise<Order[]>;
  getAdminStats(): Promise<AdminStats>;

  // Events
  onAdminStatsChange(listener: (stats: AdminStats) => void): () => void;
}

export class MemStorage implements IStorage {
  private readonly users = new Map<string, User>();
  private readonly templates = new Map<string, Template>();
  private readonly carts = new Map<string, Cart>();
  private readonly orders = new Map<string, Order>();

  private readonly dataDir: string;
  private readonly dataFile: string;

  private readonly events = new EventEmitter();

  private isBootstrapping = true;
  private bootstrapDirty = false;
  private persistQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.dataDir = path.resolve(
      process.cwd(),
      process.env.DATA_DIR ?? "data",
    );
    this.dataFile = path.join(this.dataDir, "storage.json");
    mkdirSync(this.dataDir, { recursive: true });

    this.events.setMaxListeners(50);

    this.loadFromDisk();
    this.ensureAdminUser();

    if (this.templates.size === 0) {
      this.seedTemplates();
    }

    if (this.orders.size === 0) {
      this.seedOrders();
    }

    this.isBootstrapping = false;

    if (this.bootstrapDirty) {
      void this.persist();
      this.bootstrapDirty = false;
    }

    this.notifyAdminStatsChanged();
  }

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const normalized = username.toLowerCase();
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === normalized,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const existing = await this.getUserByUsername(insertUser.username);
    if (existing) {
      throw new Error("Username already exists");
    }

    const user = this.createUserRecord(insertUser);
    this.users.set(user.id, user);
    this.markDirty();
    await this.persist();
    return { ...user };
  }

  async verifyUserCredentials(
    username: string,
    password: string,
  ): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return undefined;
    }

    const isValid = this.verifyPassword(password, user.password);
    return isValid ? { ...user } : undefined;
  }

  private createUserRecord(insertUser: InsertUser): User {
    const id = randomUUID();
    return {
      id,
      username: insertUser.username,
      password: this.hashPassword(insertUser.password),
    };
  }

  private hashPassword(password: string): string {
    const salt = randomUUID().replace(/-/g, "");
    const hashedBuffer = scryptSync(password, salt, 64);
    return `${salt}:${hashedBuffer.toString("hex")}`;
  }

  private verifyPassword(password: string, stored: string): boolean {
    const [salt, key] = stored.split(":");
    if (!salt || !key) {
      return false;
    }

    const hashedBuffer = scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, "hex");

    if (hashedBuffer.length !== keyBuffer.length) {
      return false;
    }

    return timingSafeEqual(hashedBuffer, keyBuffer);
  }

  // ---------------------------------------------------------------------------
  // Templates
  // ---------------------------------------------------------------------------

  async listTemplates(filters?: TemplateFilters): Promise<Template[]> {
    const templates = Array.from(this.templates.values()).filter((template) =>
      this.matchesTemplateFilters(template, filters),
    );

    const sorted = this.sortTemplates(templates, filters?.sort);
    return sorted.map((template) => this.cloneTemplate(template));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const template = this.templates.get(id);
    return template ? this.cloneTemplate(template) : undefined;
  }

  async getTemplateBySlug(slug: string): Promise<Template | undefined> {
    const normalized = slug.toLowerCase();
    const template = Array.from(this.templates.values()).find(
      (item) => item.slug === normalized,
    );
    return template ? this.cloneTemplate(template) : undefined;
  }

  async createTemplate(data: InsertTemplate): Promise<Template> {
    const template = this.insertTemplate(data);
    await this.persist();
    this.notifyAdminStatsChanged();
    return this.cloneTemplate(template);
  }

  async updateTemplate(
    id: string,
    updates: UpdateTemplate,
  ): Promise<Template | undefined> {
    const existing = this.templates.get(id);
    if (!existing) {
      return undefined;
    }

    const merged: Template = {
      ...existing,
      title: updates.title ?? existing.title,
      category: updates.category ?? existing.category,
      price:
        updates.price !== undefined
          ? this.normalizePrice(updates.price)
          : existing.price,
      status:
        updates.status !== undefined
          ? this.normalizeTemplateStatus(updates.status)
          : existing.status,
      description: updates.description ?? existing.description,
      videoUrl: updates.videoUrl ?? existing.videoUrl ?? null,
      liveDemoUrl: updates.liveDemoUrl ?? existing.liveDemoUrl ?? null,
      figmaUrl: updates.figmaUrl ?? existing.figmaUrl ?? null,
      updatedAt: new Date().toISOString(),
      tags:
        updates.tags !== undefined
          ? this.sanitizeStringArray(updates.tags)
          : [...existing.tags],
      features:
        updates.features !== undefined
          ? this.sanitizeStringArray(updates.features)
          : [...existing.features],
    };

    if (
      updates.galleryImages !== undefined ||
      updates.heroImage !== undefined
    ) {
      const galleryImages =
        updates.galleryImages !== undefined
          ? this.sanitizeStringArray(updates.galleryImages)
          : [...existing.galleryImages];

      const heroImage =
        updates.heroImage ?? galleryImages[0] ?? existing.heroImage;

      merged.heroImage = heroImage || DEFAULT_TEMPLATE_IMAGE;
      merged.galleryImages = galleryImages.length
        ? galleryImages
        : [merged.heroImage];
    }

    if (updates.slug !== undefined || updates.title !== undefined) {
      const baseSlug = this.slugify(updates.slug ?? merged.title);
      merged.slug = this.ensureUniqueSlug(baseSlug, id);
    }

    this.templates.set(id, merged);
    this.markDirty();
    await this.persist();
    this.notifyAdminStatsChanged();
    return this.cloneTemplate(merged);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const deleted = this.templates.delete(id);
    if (deleted) {
      this.markDirty();
      await this.persist();
      this.notifyAdminStatsChanged();
    }
    return deleted;
  }

  private insertTemplate(data: InsertTemplate): Template {
    const now = new Date().toISOString();
    const baseSlug = this.slugify(data.slug ?? data.title);
    const slug = this.ensureUniqueSlug(baseSlug);

    const galleryImages = this.sanitizeStringArray(data.galleryImages);
    const heroImage =
      data.heroImage ?? galleryImages[0] ?? DEFAULT_TEMPLATE_IMAGE;

    const template: Template = {
      id: randomUUID(),
      slug,
      title: data.title,
      category: data.category,
      price: this.normalizePrice(data.price),
      status: this.normalizeTemplateStatus(data.status),
      description: data.description,
      heroImage,
      galleryImages: galleryImages.length ? galleryImages : [heroImage],
      videoUrl: data.videoUrl ?? null,
      liveDemoUrl: data.liveDemoUrl ?? null,
      figmaUrl: data.figmaUrl ?? null,
      tags: this.sanitizeStringArray(data.tags),
      features: this.sanitizeStringArray(data.features),
      createdAt: now,
      updatedAt: now,
    };

    this.templates.set(template.id, template);
    this.markDirty();
    return template;
  }

  private matchesTemplateFilters(
    template: Template,
    filters?: TemplateFilters,
  ): boolean {
    if (!filters) {
      return true;
    }

    if (
      filters.category &&
      filters.category !== "all" &&
      template.category !== filters.category
    ) {
      return false;
    }

    if (
      filters.status &&
      filters.status !== "all" &&
      template.status !== filters.status
    ) {
      return false;
    }

    if (filters.minPrice !== undefined && template.price < filters.minPrice) {
      return false;
    }

    if (filters.maxPrice !== undefined && template.price > filters.maxPrice) {
      return false;
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      const haystacks = [
        template.title,
        template.description,
        ...template.tags,
        ...template.features,
      ].map((value) => value.toLowerCase());

      const matches = haystacks.some((value) => value.includes(query));
      if (!matches) {
        return false;
      }
    }

    return true;
  }

  private sortTemplates(
    templates: Template[],
    sort: TemplateSort | undefined,
  ): Template[] {
    const sorted = [...templates];

    switch (sort) {
      case "priceAsc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "oldest":
        sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      case "newest":
      default:
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
    }

    return sorted;
  }

  private normalizePrice(price: number): number {
    const normalized = Number(price);
    if (Number.isNaN(normalized) || normalized < 0) {
      return 0;
    }

    return Math.round(normalized * 100) / 100;
  }

  private normalizeTemplateStatus(status?: TemplateStatus): TemplateStatus {
    if (!status) {
      return "draft";
    }

    const parseResult = templateStatusSchema.safeParse(status);
    return parseResult.success ? parseResult.data : "draft";
  }

  private sanitizeStringArray(values?: string[] | null): string[] {
    if (!values) {
      return [];
    }

    return values
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }

  private slugify(value: string): string {
    return (
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-")
        .slice(0, 80) || "template"
    );
  }

  private ensureUniqueSlug(baseSlug: string, ignoreId?: string): string {
    const normalized = baseSlug.toLowerCase();
    let slug = normalized;
    let counter = 1;

    const isSlugTaken = (candidate: string) =>
      Array.from(this.templates.values()).some(
        (template) => template.slug === candidate && template.id !== ignoreId,
      );

    while (isSlugTaken(slug)) {
      slug = `${normalized}-${counter++}`;
    }

    return slug;
  }

  private toTemplateSummary(template: Template): TemplateSummary {
    return {
      id: template.id,
      slug: template.slug,
      title: template.title,
      category: template.category,
      price: template.price,
      status: template.status,
      heroImage: template.heroImage,
    };
  }

  private cloneTemplate(template: Template): Template {
    return {
      ...template,
      galleryImages: [...template.galleryImages],
      tags: [...template.tags],
      features: [...template.features],
      videoUrl: template.videoUrl ?? null,
      liveDemoUrl: template.liveDemoUrl ?? null,
      figmaUrl: template.figmaUrl ?? null,
    };
  }

  // ---------------------------------------------------------------------------
  // Cart
  // ---------------------------------------------------------------------------

  async getOrCreateCart(cartId?: string): Promise<Cart> {
    if (cartId) {
      const existing = this.carts.get(cartId);
      if (existing) {
        return this.cloneCart(existing);
      }
    }

    const cart: Cart = {
      id: cartId ?? randomUUID(),
      items: [],
      subtotal: 0,
    };

    this.carts.set(cart.id, cart);
    this.markDirty();
    await this.persist();
    return this.cloneCart(cart);
  }

  async addCartItem(cartId: string, item: InsertCartItem): Promise<Cart> {
    const cart = await this.getCartRecord(cartId);
    const template = this.templates.get(item.templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    const quantity = item.quantity ?? 1;
    const existingItem = cart.items.find(
      (cartItem) => cartItem.templateId === item.templateId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.unitPrice = template.price;
      existingItem.template = this.toTemplateSummary(template);
    } else {
      cart.items.push({
        id: randomUUID(),
        templateId: item.templateId,
        quantity,
        unitPrice: template.price,
        addedAt: new Date().toISOString(),
        template: this.toTemplateSummary(template),
      });
    }

    this.recalculateCart(cart);
    this.markDirty();
    await this.persist();
    return this.cloneCart(cart);
  }

  async updateCartItem(
    cartId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<Cart> {
    const cart = await this.getCartRecord(cartId);
    const item = cart.items.find((cartItem) => cartItem.id === cartItemId);

    if (!item) {
      throw new Error("Cart item not found");
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((cartItem) => cartItem.id !== cartItemId);
    } else {
      item.quantity = quantity;
    }

    this.recalculateCart(cart);
    this.markDirty();
    await this.persist();
    return this.cloneCart(cart);
  }

  async removeCartItem(cartId: string, cartItemId: string): Promise<Cart> {
    const cart = await this.getCartRecord(cartId);
    cart.items = cart.items.filter((item) => item.id !== cartItemId);
    this.recalculateCart(cart);
    this.markDirty();
    await this.persist();
    return this.cloneCart(cart);
  }

  async clearCart(cartId: string): Promise<Cart> {
    const cart = await this.getCartRecord(cartId);
    cart.items = [];
    cart.subtotal = 0;
    this.markDirty();
    await this.persist();
    return this.cloneCart(cart);
  }

  private async getCartRecord(cartId: string): Promise<Cart> {
    let cart = this.carts.get(cartId);
    if (!cart) {
      cart = {
        id: cartId,
        items: [],
        subtotal: 0,
      };
      this.carts.set(cartId, cart);
      this.markDirty();
    }

    return cart;
  }

  private recalculateCart(cart: Cart): void {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    cart.subtotal = Math.round(subtotal * 100) / 100;
  }

  private cloneCart(cart: Cart): Cart {
    return {
      id: cart.id,
      subtotal: cart.subtotal,
      items: cart.items.map((item) => ({
        ...item,
        template: { ...item.template },
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // Orders & stats
  // ---------------------------------------------------------------------------

  async createOrderFromCart(cartId: string): Promise<Order> {
    const cart = await this.getCartRecord(cartId);

    if (cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    const now = new Date().toISOString();
    const orderItems = cart.items.map((item) => ({
      ...item,
      template: { ...item.template },
    }));

    const order: Order = {
      id: randomUUID(),
      cartId,
      items: orderItems,
      total: cart.subtotal,
      status: "paid",
      createdAt: now,
    };

    this.orders.set(order.id, order);

    cart.items = [];
    cart.subtotal = 0;

    this.markDirty();
    await this.persist();
    this.notifyAdminStatsChanged();
    return this.cloneOrder(order);
  }

  async listOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((order) => this.cloneOrder(order));
  }

  async getAdminStats(): Promise<AdminStats> {
    const orders = Array.from(this.orders.values());
    const totalRevenue = orders
      .filter((order) => order.status === "paid")
      .reduce((sum, order) => sum + order.total, 0);

    const recentOrders = orders
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      }));

    return {
      totalTemplates: this.templates.size,
      publishedTemplates: Array.from(this.templates.values()).filter(
        (template) => template.status === "published",
      ).length,
      totalOrders: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      recentOrders,
    };
  }

  onAdminStatsChange(listener: (stats: AdminStats) => void): () => void {
    this.events.on("adminStats", listener);
    return () => {
      this.events.off("adminStats", listener);
    };
  }

  private cloneOrder(order: Order): Order {
    return {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        template: { ...item.template },
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // Persistence helpers
  // ---------------------------------------------------------------------------

  private async persist(): Promise<void> {
    if (this.isBootstrapping) {
      this.bootstrapDirty = true;
      return;
    }

    const snapshot = this.serialize();
    const payload = JSON.stringify(snapshot, null, 2);

    this.persistQueue = this.persistQueue
      .catch(() => undefined)
      .then(() => writeFile(this.dataFile, payload, "utf-8"));

    await this.persistQueue;
  }

  private serialize(): PersistedData {
    return {
      version: PERSISTENCE_VERSION,
      users: Array.from(this.users.values()).map((user) => ({ ...user })),
      templates: Array.from(this.templates.values()).map((template) =>
        this.cloneTemplate(template),
      ),
      carts: Array.from(this.carts.values()).map((cart) => this.cloneCart(cart)),
      orders: Array.from(this.orders.values()).map((order) =>
        this.cloneOrder(order),
      ),
    };
  }

  private loadFromDisk(): void {
    if (!existsSync(this.dataFile)) {
      return;
    }

    try {
      const raw = readFileSync(this.dataFile, "utf-8");
      if (!raw.trim()) {
        return;
      }

      const parsed = JSON.parse(raw) as Partial<PersistedData>;

      if (
        parsed.version !== undefined &&
        parsed.version !== PERSISTENCE_VERSION
      ) {
        console.warn(
          `[storage] Ignoring persisted data due to version mismatch (found ${parsed.version}, expected ${PERSISTENCE_VERSION})`,
        );
        return;
      }

      if (Array.isArray(parsed.users)) {
        parsed.users.forEach((user) => {
          if (user.id) {
            this.users.set(user.id, user);
          }
        });
      }

      if (Array.isArray(parsed.templates)) {
        parsed.templates.forEach((template) => {
          if (template.id) {
            this.templates.set(template.id, {
              ...template,
              galleryImages: [...template.galleryImages],
              tags: [...template.tags],
              features: [...template.features],
              videoUrl: template.videoUrl ?? null,
              liveDemoUrl: template.liveDemoUrl ?? null,
              figmaUrl: template.figmaUrl ?? null,
            });
          }
        });
      }

      if (Array.isArray(parsed.carts)) {
        parsed.carts.forEach((cart) => {
          if (cart.id) {
            this.carts.set(cart.id, {
              id: cart.id,
              subtotal: cart.subtotal,
              items: cart.items.map((item) => ({
                ...item,
                template: { ...item.template },
              })),
            });
          }
        });
      }

      if (Array.isArray(parsed.orders)) {
        parsed.orders.forEach((order) => {
          if (order.id) {
            this.orders.set(order.id, {
              ...order,
              items: order.items.map((item) => ({
                ...item,
                template: { ...item.template },
              })),
            });
          }
        });
      }
    } catch (error) {
      console.error("[storage] Failed to load persisted data:", error);
    }
  }

  private markDirty(): void {
    if (this.isBootstrapping) {
      this.bootstrapDirty = true;
    }
  }

  // ---------------------------------------------------------------------------
  // Seeding helpers
  // ---------------------------------------------------------------------------

  private ensureAdminUser(): void {
    const hasAdmin = Array.from(this.users.values()).some(
      (user) => user.username.toLowerCase() === "admin",
    );

    if (!hasAdmin) {
      const admin = this.createUserRecord({
        username: "admin",
        password: "admin123",
      });
      this.users.set(admin.id, admin);
      this.markDirty();
    }
  }

  private seedTemplates(): void {
    const templates: InsertTemplate[] = [
      {
        title: "Modern E-Commerce",
        category: "ecommerce",
        price: 79,
        status: "published",
        description:
          "A high-converting online store template with advanced product filtering, cart, and checkout experiences.",
        heroImage:
          "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=1600&q=80",
        galleryImages: [
          "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1600&q=80",
        ],
        tags: ["shop", "commerce", "responsive"],
        features: [
          "Advanced product filtering",
          "Integrated shopping cart",
          "Customizable hero sections",
        ],
      },
      {
        title: "Creative Portfolio",
        category: "portfolio",
        price: 59,
        status: "published",
        description:
          "Showcase your creative work with immersive galleries, case studies, and client testimonials.",
        heroImage:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
        galleryImages: [
          "https://images.unsplash.com/photo-1526481280695-3c46917b3cfa?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
        ],
        tags: ["design", "portfolio", "agency"],
        features: [
          "Interactive project galleries",
          "Testimonials carousel",
          "Case study templates",
        ],
      },
      {
        title: "SaaS Landing Pro",
        category: "saas",
        price: 89,
        status: "published",
        description:
          "A conversion-focused SaaS landing page with pricing tables, feature highlights, and integrations sections.",
        heroImage:
          "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80",
        galleryImages: [
          "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1531498860502-7c67cf02f77b?auto=format&fit=crop&w=1600&q=80",
        ],
        tags: ["startup", "landing", "pricing"],
        features: [
          "Dynamic pricing tables",
          "Customer logos grid",
          "Integrations showcase",
        ],
      },
      {
        title: "Restaurant Deluxe",
        category: "restaurant",
        price: 69,
        status: "published",
        description:
          "A culinary experience template with interactive menus, online reservation integration, and chef highlights.",
        heroImage:
          "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1600&q=80",
        galleryImages: [
          "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
        ],
        tags: ["food", "hospitality", "menu"],
        features: [
          "Interactive menu layout",
          "Reservations widget",
          "Chef spotlight section",
        ],
      },
      {
        title: "Corporate Suite",
        category: "corporate",
        price: 99,
        status: "published",
        description:
          "A polished corporate website template with services overview, leadership bios, and case studies.",
        heroImage:
          "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
        galleryImages: [
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
        ],
        tags: ["business", "consulting", "enterprise"],
        features: [
          "Services overview sections",
          "Leadership profiles",
          "Detailed case studies",
        ],
      },
      {
        title: "Fitness Hub",
        category: "fitness",
        price: 74,
        status: "published",
        description:
          "An energetic fitness studio template with class schedules, coach profiles, and membership plans.",
        heroImage:
          "https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=1600&q=80",
        galleryImages: [
          "https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=1600&q=80",
          "https://images.unsplash.com/photo-1584467735871-1394f54ccbec?auto=format&fit=crop&w=1600&q=80",
        ],
        tags: ["fitness", "studio", "schedule"],
        features: [
          "Class schedule management",
          "Coach biographies",
          "Membership pricing plans",
        ],
      },
    ];

    templates.forEach((template) => {
      this.insertTemplate(template);
    });

    this.notifyAdminStatsChanged();
  }

  private seedOrders(): void {
    const templates = Array.from(this.templates.values());
    if (templates.length === 0) {
      return;
    }

    const pickTemplate = (index: number): Template =>
      templates[index % templates.length];

    const buildItem = (template: Template, quantity: number): CartItem => ({
      id: randomUUID(),
      templateId: template.id,
      quantity,
      unitPrice: template.price,
      addedAt: new Date().toISOString(),
      template: this.toTemplateSummary(template),
    });

    const orderOneItems = [
      buildItem(pickTemplate(0), 1),
      buildItem(pickTemplate(2), 1),
    ];

    const orderTwoItems = [
      buildItem(pickTemplate(1), 1),
      buildItem(pickTemplate(4), 1),
    ];

    const orderOne: Order = {
      id: randomUUID(),
      cartId: randomUUID(),
      items: orderOneItems,
      total:
        Math.round(
          orderOneItems.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0,
          ) * 100,
        ) / 100,
      status: "paid",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    };

    const orderTwo: Order = {
      id: randomUUID(),
      cartId: randomUUID(),
      items: orderTwoItems,
      total:
        Math.round(
          orderTwoItems.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0,
          ) * 100,
        ) / 100,
      status: "paid",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    };

    this.orders.set(orderOne.id, orderOne);
    this.orders.set(orderTwo.id, orderTwo);
    this.markDirty();

    this.notifyAdminStatsChanged();
  }

  private notifyAdminStatsChanged(): void {
    void this.getAdminStats()
      .then((stats) => {
        this.events.emit("adminStats", stats);
      })
      .catch((error) => {
        console.error("[storage] Failed to emit admin stats update:", error);
      });
  }
}

export const storage = new MemStorage();
