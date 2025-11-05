import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  type InsertUser,
  type NewUser,
  type User,
  users,
} from "@shared/schema";
import { db } from "../db";

export type PublicUser = Omit<User, "password">;

function hashPassword(password: string): string {
  const salt = randomUUID().replace(/-/g, "");
  const hashedBuffer = scryptSync(password, salt, 64);
  return `${salt}:${hashedBuffer.toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
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

function normalizeUser(record: User | undefined): PublicUser | undefined {
  if (!record) {
    return undefined;
  }

  const { password: _password, ...rest } = record;
  return rest;
}

export async function getUserById(id: string): Promise<PublicUser | undefined> {
  if (!id) {
    return undefined;
  }

  const record = await getUserRecordById(id);
  return normalizeUser(record);
}

export async function getUserByUsername(
  username: string,
): Promise<User | undefined> {
  if (!username) {
    return undefined;
  }

  const [record] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return record;
}

async function getUserRecordById(id: string): Promise<User | undefined> {
  const [record] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return record;
}

export async function registerUser(
  payload: InsertUser,
  options?: Partial<Pick<NewUser, "role" | "isPremium" | "premiumUntil">>,
): Promise<PublicUser> {
  const existing = await getUserByUsername(payload.username);
  if (existing) {
    throw new Error("Username already exists");
  }

  const hashedPassword = hashPassword(payload.password);

  const insertPayload: NewUser = {
    username: payload.username,
    password: hashedPassword,
    role: options?.role ?? "user",
    isPremium: options?.isPremium ?? false,
    premiumUntil: options?.premiumUntil ?? null,
  } as NewUser;

  await db.insert(users).values(insertPayload);

  const created = await getUserByUsername(payload.username);
  if (!created) {
    throw new Error("Failed to create user");
  }

  const normalized = normalizeUser(created);
  if (!normalized) {
    throw new Error("Failed to normalize user");
  }

  return normalized;
}

export async function verifyUserCredentials(
  username: string,
  password: string,
): Promise<PublicUser | undefined> {
  const record = await getUserByUsername(username);
  if (!record) {
    return undefined;
  }

  const isValid = verifyPassword(password, record.password);
  if (!isValid) {
    return undefined;
  }

  const { password: _password, ...rest } = record;
  return rest;
}

export async function listUsers(): Promise<PublicUser[]> {
  const records = await db.select().from(users).orderBy(users.createdAt);
  return records.map(({ password: _password, ...rest }) => rest);
}

export interface UpdatePremiumOptions {
  isPremium: boolean;
  premiumUntil?: Date | null;
}

export async function updateUserPremium(
  userId: string,
  { isPremium, premiumUntil }: UpdatePremiumOptions,
): Promise<PublicUser> {
  const normalizedPremiumUntil =
    premiumUntil && !Number.isNaN(premiumUntil.getTime())
      ? premiumUntil
      : null;

  const result = await db
    .update(users)
    .set({
      isPremium,
      premiumUntil: normalizedPremiumUntil,
    })
    .where(eq(users.id, userId));

  if (result.rowsAffected === 0) {
    throw new Error("User not found");
  }

  const updated = await getUserRecordById(userId);
  if (!updated) {
    throw new Error("User not found");
  }

  const normalized = normalizeUser(updated);
  if (!normalized) {
    throw new Error("Failed to load user");
  }

  return normalized;
}

export async function ensureAdminUser(): Promise<void> {
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  const existing = await getUserByUsername(adminUsername);
  if (existing) {
    return;
  }

  await registerUser(
    { username: adminUsername, password: adminPassword },
    { role: "admin" },
  );
}
