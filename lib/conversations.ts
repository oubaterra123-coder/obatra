import { supabase } from "./supabase";

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export async function createConversation() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No authenticated user.", userError);
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

  if (error) {
    console.error("CREATE CONVERSATION ERROR:", error);
    return null;
  }

  return data;
}

export async function getConversations() {
  const token = await getAccessToken();

  if (!token) {
    console.error("No access token.");
    return [];
  }

  const res = await fetch("/api/conversations", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error("GET CONVERSATIONS ERROR:", error);
    return [];
  }

  return await res.json();
}
