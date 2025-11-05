import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const templateCategories = [
  "ecommerce",
  "portfolio",
  "saas",
  "restaurant",
  "corporate",
  "fitness",
] as const;

export const templateStatuses = ["draft", "published", "archived"] as const;

export type TemplateCategory = (typeof templateCategories)[number];
export type TemplateStatus = (typeof templateStatuses)[number];

export const templateCategorySchema = z.enum(templateCategories);
export const templateStatusSchema = z.enum(templateStatuses);

const urlOrPathSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      if (!value) {
        return false;
      }

      if (value.startsWith("/")) {
        return true;
      }

      try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Invalid url" },
  );

export const templateSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(3),
  category: templateCategorySchema,
  price: z.number().min(0),
  status: templateStatusSchema,
  heroImage: urlOrPathSchema,
});

export const templateSchema = templateSummarySchema.extend({
  description: z.string().min(10),
  galleryImages: z.array(urlOrPathSchema).default([]),
  videoUrl: urlOrPathSchema.nullable().optional(),
  liveDemoUrl: z.string().url().nullable().optional(),
  figmaUrl: z.string().url().nullable().optional(),
  tags: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertTemplateSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(1).optional(),
  category: templateCategorySchema,
  price: z.number().min(0),
  status: templateStatusSchema.optional(),
  description: z.string().min(10),
  heroImage: urlOrPathSchema.optional(),
  galleryImages: z.array(urlOrPathSchema).optional(),
  videoUrl: urlOrPathSchema.nullable().optional(),
  liveDemoUrl: z.string().url().nullable().optional(),
  figmaUrl: z.string().url().nullable().optional(),
  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});

export const updateTemplateSchema = insertTemplateSchema.partial().extend({
  id: z.string().uuid(),
});

export type Template = z.infer<typeof templateSchema>;
export type TemplateSummary = z.infer<typeof templateSummarySchema>;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type UpdateTemplate = z.infer<typeof updateTemplateSchema>;

export const cartItemSchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  addedAt: z.string(),
  template: templateSummarySchema,
});

export const cartSchema = z.object({
  id: z.string().uuid(),
  items: z.array(cartItemSchema),
  subtotal: z.number().min(0),
});

export const insertCartItemSchema = z.object({
  templateId: z.string().uuid(),
  quantity: z.number().int().min(1).optional(),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export const orderStatuses = ["pending", "paid", "failed", "refunded"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const orderSchema = z.object({
  id: z.string().uuid(),
  cartId: z.string().uuid(),
  items: z.array(cartItemSchema),
  total: z.number().min(0),
  status: z.enum(orderStatuses),
  createdAt: z.string(),
});

export type Order = z.infer<typeof orderSchema>;

export const adminStatsSchema = z.object({
  totalTemplates: z.number().int().min(0),
  publishedTemplates: z.number().int().min(0),
  totalOrders: z.number().int().min(0),
  totalRevenue: z.number().min(0),
  recentOrders: z
    .array(
      orderSchema.pick({
        id: true,
        total: true,
        status: true,
        createdAt: true,
      }),
    )
    .default([]),
});

export type AdminStats = z.infer<typeof adminStatsSchema>;
