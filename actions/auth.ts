"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function quickLogin(
  email: string,
  password: string,
  redirectTo: string
) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error.message);
    return { error: error.message };
  }

  console.log("Login successful");
  revalidatePath("/", "layout");
  return { success: true, redirectTo };
}
