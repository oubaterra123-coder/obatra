import { supabase } from "./supabase";

export async function createConversation() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("USER:", user);
  console.log("AUTH ERROR:", userError);

  if (!user) {
    console.error("No authenticated user.");
    return null;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      title: "New Chat",
    })
    .select()
    .single();

  console.log("CONVERSATION:", data);
  console.log("INSERT ERROR:", error);

  if (error) {
    return null;
  }

  return data;
}

export async function getConversations() {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];

  return data;
}