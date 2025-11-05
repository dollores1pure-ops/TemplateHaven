import type {
  AdminStats,
  Cart,
  InsertTemplate,
  Order,
  Template,
  TemplateCategory,
  TemplateStatus,
  UpdateTemplate,
} from "@shared/schema";
import { apiRequest } from "./queryClient";

export interface TemplateListParams {
  search?: string;
  category?: TemplateCategory | "all";
  status?: TemplateStatus | "all";
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "oldest" | "priceAsc" | "priceDesc" | "title";
}

export interface UserAccount {
  id: string;
  username: string;
  role: string;
  isPremium: boolean;
  premiumUntil: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UploadedFile {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: "image" | "video" | "other";
}

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchTemplates(params: TemplateListParams = {}) {
  const query = buildQueryString({
    search: params.search,
    category: params.category,
    status: params.status,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sort: params.sort,
  });

  const res = await fetch(`/api/templates${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch templates (${res.status})`);
  }

  return (await res.json()) as { data: Template[]; meta: { total: number } };
}

export async function fetchTemplate(idOrSlug: string): Promise<Template> {
  const res = await fetch(`/api/templates/${idOrSlug}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Template not found (${res.status})`);
  }

  return (await res.json()) as Template;
}

export async function createTemplate(
  payload: InsertTemplate,
): Promise<Template> {
  const res = await apiRequest("POST", "/api/templates", payload);
  return (await res.json()) as Template;
}

export async function updateTemplate(
  id: string,
  payload: UpdateTemplate,
): Promise<Template> {
  const res = await apiRequest("PUT", `/api/templates/${id}`, payload);
  return (await res.json()) as Template;
}

export async function deleteTemplate(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/templates/${id}`);
}

export async function login(username: string, password: string) {
  const res = await apiRequest("POST", "/api/auth/login", {
    username,
    password,
  });
  return (await res.json()) as UserAccount;
}

export async function register(username: string, password: string) {
  const res = await apiRequest("POST", "/api/auth/register", {
    username,
    password,
  });
  return (await res.json()) as UserAccount;
}

export async function logout() {
  await apiRequest("POST", "/api/auth/logout");
}

export async function fetchCurrentUser() {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch current user (${res.status})`);
  }

  return (await res.json()) as UserAccount;
}

export async function fetchCart(): Promise<Cart> {
  const res = await fetch("/api/cart", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch cart (${res.status})`);
  }

  return (await res.json()) as Cart;
}

export async function addCartItem(
  templateId: string,
  quantity = 1,
): Promise<Cart> {
  const res = await apiRequest("POST", "/api/cart/items", {
    templateId,
    quantity,
  });

  return (await res.json()) as Cart;
}

export async function updateCartItem(
  itemId: string,
  quantity: number,
): Promise<Cart> {
  const res = await apiRequest("PATCH", `/api/cart/items/${itemId}`, {
    quantity,
  });

  return (await res.json()) as Cart;
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const res = await apiRequest("DELETE", `/api/cart/items/${itemId}`);
  return (await res.json()) as Cart;
}

export async function checkoutCart(): Promise<{
  url: string;
  sessionId: string;
}> {
  const res = await apiRequest("POST", "/api/cart/checkout");
  return (await res.json()) as { url: string; sessionId: string };
}

export async function completeCheckout(sessionId: string): Promise<{
  order: Order;
  cart: Cart;
}> {
  const res = await apiRequest("POST", "/api/cart/checkout/complete", {
    sessionId,
  });
  return (await res.json()) as { order: Order; cart: Cart };
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch("/api/admin/stats", {
    credentials: "include",
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (res.status === 403) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch admin stats (${res.status})`);
  }

  return (await res.json()) as AdminStats;
}

export async function fetchOrders(): Promise<{
  data: Order[];
  meta: { total: number };
}> {
  const res = await fetch("/api/admin/orders", {
    credentials: "include",
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch orders (${res.status})`);
  }

  return (await res.json()) as { data: Order[]; meta: { total: number } };
}

export async function fetchAdminUsers(): Promise<UserAccount[]> {
  const res = await fetch("/api/admin/users", {
    credentials: "include",
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch users (${res.status})`);
  }

  const payload = (await res.json()) as { data: UserAccount[] };
  return payload.data ?? [];
}

export async function updateAdminUserPremium(
  userId: string,
  body: { isPremium: boolean; premiumUntil?: string | null },
): Promise<UserAccount> {
  const res = await apiRequest(
    "PATCH",
    `/api/admin/users/${userId}/premium`,
    body,
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const errorPayload = await res.json().catch(() => null);
    const message =
      errorPayload && typeof errorPayload === "object" && errorPayload !== null
        ? (errorPayload as { message?: string }).message
        : undefined;
    throw new Error(message ?? `Failed to update premium (${res.status})`);
  }

  return (await res.json()) as UserAccount;
}

export async function uploadMedia(files: File[]): Promise<UploadedFile[]> {
  if (!files.length) {
    return [];
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file, file.name);
  });

  const res = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message =
      payload && typeof (payload as { message?: unknown }).message === "string"
        ? ((payload as { message?: string }).message as string)
        : `Failed to upload files (${res.status})`;
    throw new Error(message);
  }

  const filesPayload =
    payload && typeof payload === "object" && payload !== null
      ? (payload as { files?: UploadedFile[] }).files
      : undefined;

  return Array.isArray(filesPayload) ? filesPayload : [];
}
