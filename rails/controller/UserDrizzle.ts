import db from "@/drizzle";
import { user_wallet } from "@/drizzle/migrations/schema";
import { eq } from "drizzle-orm";

export async function getAllUsers() {
  try {
    if (process.env.DEBUG) console.log("(dev:drizzle:server) getting table name: Users");
    const users = await db
      .select({
        id: user_wallet.id,
        role: user_wallet.role,
        email: user_wallet.email,
        sk: user_wallet.sk,
        pk: user_wallet.pk,
        balance: user_wallet.balance,
        created_at: user_wallet.created_at,
        updated_at: user_wallet.updated_at,
      })
      .from(user_wallet);

    if (process.env.DEBUG) console.log("(dev:drizzle:server) parse completed: Users");
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getUserById(id: string) {
  try {
    const user = await db
      .select()
      .from(user_wallet)
      .where(eq(user_wallet.id, id))
      .limit(1);

    return user[0] || null;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await db
      .select()
      .from(user_wallet)
      .where(eq(user_wallet.email, email))
      .limit(1);

    return user[0] || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
}
