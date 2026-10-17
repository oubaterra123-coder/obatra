import { supabase } from "./supabase";

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export async function createConversation() {
  try {
    console.info("OBATRA CHAT: checking authenticated user");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("OBATRA AUTH ERROR:", userError.message);
      return null;
    }

    if (!user) {
      console.warn("OBATRA CHAT: no authenticated user");
      return null;
    }

    console.info("OBATRA CHAT: creating conversation");

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: "New Chat",
      })
      .select()
      .single();

    if (error) {
      console.error("OBATRA CREATE CONVERSATION ERROR:", error.message);
      return null;
    }

    console.info("OBATRA CHAT: conversation created");
    return data;
  } catch (error) {
    console.error(
      "OBATRA CREATE CONVERSATION FETCH ERROR:",
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
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

