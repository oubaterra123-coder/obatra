import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.replace("Bearer ", "").trim();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseKey);

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const message = String(body.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from("planner_tasks")
      .select(
        "id, title, description, task_date, start_time, end_time, priority, status, location"
      )
      .eq("user_id", user.id)
      .gte("task_date", today)
      .order("task_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (tasksError) {
      console.error("PLANNER AI LOAD ERROR:", tasksError);

      return NextResponse.json(
        { error: "Could not load planner tasks" },
        { status: 500 }
      );
    }

    const prompt = `
You are Obatra AI Planner.

Today's date is ${today}.

The user says:
${message}

Current planner tasks:
${JSON.stringify(tasks || [], null, 2)}

Your job is to understand whether the user wants to ADD a task.

Return ONLY valid JSON with this exact structure:

{
  "action": "add_task" | "edit_task" | "cancel_task" | "complete_task" | "set_reminder" | "chat",
  "title": string | null,
  "task_date": "YYYY-MM-DD" | null,
  "start_time": "HH:MM" | null,
  "task_id": "existing-task-id" | null,
  "reminder_minutes": number | null,
  "reply": string
}

Rules:
- If the user clearly asks to add/create/schedule a new task, use action "add_task".
- Extract a short task title.
- If the user says "today", use ${today}.
- If the user says "tomorrow" or "غدا", calculate tomorrow's date.
- Extract the time when provided.
- If no time is provided, use null.
- If the user asks for a reminder before an existing task, use action "set_reminder", select its exact task_id from Current planner tasks, and set reminder_minutes to the requested number of minutes. Never invent a task or task time.
- For requests such as "شنو عندي دابا؟", "شنو عندي حاليا؟", "شنو باقي ليا؟", or "what do I have now?", use action "chat" and answer using the Current planner tasks provided above. Mention the relevant pending tasks and their times. Do not ask the user a follow-up question if the tasks are already available.
- For requests such as "نظم ليا نهاري", "رتب ليا نهاري", "organize my day", or "plan my day", use action "chat" and create a clear, practical daily plan using the Current planner tasks.
- Preserve every existing task date and time exactly. Never claim a task has a time when start_time is null.
- Prioritize tasks using their actual priority, status, scheduled times, and user-stated deadlines. Never invent deadlines or task details.
- Keep completed tasks separate from pending tasks. Never suggest doing a task that is already completed.
- For tasks without times, recommend a sensible order without assigning fixed times unless the user asks for a proposed timetable.
- If the user asks for a proposed timetable, clearly label suggested times as proposals, avoid overlaps, and do not present them as saved task times.
- Planning requests must use action "chat". Do not add, edit, delete, complete, or reschedule tasks unless explicitly requested.
- If there are no tasks, say so and offer to help add the first task.
- Do not invent tasks, times, dates, priorities, or deadlines.
- Do not invent a time.
- Detect the language of the actual user message, not the interface language. Keep the reply in that language.
- For Moroccan Darija, including Latin transliteration, reply naturally in Moroccan Darija. If the user writes Arabic, reply in Arabic. Do not switch to French because the interface is French.
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const raw = result.text?.trim() || "";

    let parsed: {
      action?: string;
      title?: string | null;
      task_date?: string | null;
      start_time?: string | null;
      reply?: string;
      task_id?: string | null;
      reminder_minutes?: number | null;
    };

    try {
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("PLANNER AI JSON ERROR:", raw);

      return NextResponse.json({
        success: true,
        reply: raw || "سمح ليا، ما قدرتش نفهم الطلب ديالك.",
      });
    }

    if (parsed.action === "set_reminder" && typeof parsed.reminder_minutes !== "number") {
      const reminderMatch = message.match(/(\d+)\s*(?:دقيقة|دقايق|دقائق|min(?:ute)?s?)/i);

      if (reminderMatch) {
        parsed.reminder_minutes = Number(reminderMatch[1]);
      } else if (/ربع ساعة/i.test(message)) {
        parsed.reminder_minutes = 15;
      } else if (/نصف ساعة|نص ساعة/i.test(message)) {
        parsed.reminder_minutes = 30;
      } else if (/(?:ساعة|ساعه)/i.test(message)) {
        parsed.reminder_minutes = 60;
      }
    }
    console.log("PLANNER AI REMINDER PARSED:", parsed.action, parsed.task_id, parsed.reminder_minutes);
    if (
      parsed.action === "set_reminder" &&
      parsed.task_id &&
      typeof parsed.reminder_minutes === "number" &&
      parsed.reminder_minutes >= 0
    ) {
      const { data: reminderTask, error: reminderTaskError } =
        await supabaseAdmin
          .from("planner_tasks")
          .select("id, title, task_date, start_time")
          .eq("id", parsed.task_id)
          .eq("user_id", user.id)
          .single();

      if (reminderTaskError || !reminderTask) {
        console.error("PLANNER AI REMINDER TASK ERROR:", reminderTaskError);

        return NextResponse.json(
          { error: "Could not find planner task for reminder" },
          { status: 500 }
        );
      }

      if (!reminderTask.start_time) {
        return NextResponse.json(
          { error: "This task needs a start time before a reminder can be set" },
          { status: 400 }
        );
      }

      const localStart = `${reminderTask.task_date}T${reminderTask.start_time.slice(0, 5)}:00`;

      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Casablanca",
        timeZoneName: "longOffset",
      }).formatToParts(new Date(`${localStart}Z`));

      const offsetText =
        parts.find((part) => part.type === "timeZoneName")?.value || "GMT";

      const offsetMatch = offsetText.match(
        /GMT([+-])(\d{2})(?::?(\d{2}))?/
      );

      const offsetMinutes = offsetMatch
        ? (offsetMatch[1] === "-" ? -1 : 1) *
          (Number(offsetMatch[2]) * 60 + Number(offsetMatch[3] || 0))
        : 0;

      const taskUtcMs =
        Date.parse(`${localStart}Z`) - offsetMinutes * 60 * 1000;

      const reminderAt = new Date(
        taskUtcMs - parsed.reminder_minutes * 60 * 1000
      ).toISOString();

      const { data: updatedReminderTask, error: reminderUpdateError } =
        await supabaseAdmin
          .from("planner_tasks")
          .update({
            reminder_at: reminderAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", reminderTask.id)
          .eq("user_id", user.id)
          .select(
            "id, title, task_date, start_time, reminder_at, priority, status"
          )
          .single();

      if (reminderUpdateError) {
        console.error("PLANNER AI REMINDER UPDATE ERROR:", reminderUpdateError);

        return NextResponse.json(
          { error: "Could not save planner reminder" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: "set_reminder",
        task: updatedReminderTask,
        reply:
          parsed.reply ||
          `صافي، غادي نفكرك قبل "${updatedReminderTask.title}" بـ ${parsed.reminder_minutes} دقيقة.`,
      });
    }
    if (parsed.action === "complete_task" && parsed.task_id) {
      const { data: completedTask, error: completeError } = await supabaseAdmin
        .from("planner_tasks")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", parsed.task_id)
        .eq("user_id", user.id)
        .select(
          "id, title, task_date, start_time, end_time, priority, status"
        )
        .single();

      if (completeError) {
        console.error("PLANNER AI COMPLETE ERROR:", completeError);

        return NextResponse.json(
          { error: "Could not complete planner task" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: "complete_task",
        task: completedTask,
        reply:
          parsed.reply ||
          `صافي، تسالات المهمة "${completedTask.title}".`,
      });
    }

    if (parsed.action === "cancel_task" && parsed.task_id) {
      const { data: deletedTask, error: deleteError } = await supabaseAdmin
        .from("planner_tasks")
        .delete()
        .eq("id", parsed.task_id)
        .eq("user_id", user.id)
        .select(
          "id, title, task_date, start_time, end_time, priority, status"
        )
        .single();

      if (deleteError) {
        console.error("PLANNER AI DELETE ERROR:", deleteError);

        return NextResponse.json(
          { error: "Could not cancel planner task" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: "cancel_task",
        task: deletedTask,
        reply:
          parsed.reply ||
          `تم إلغاء المهمة "${deletedTask.title}".`,
      });
    }

    if (parsed.action === "edit_task" && parsed.task_id) {
      const updateData: {
        title?: string;
        task_date?: string;
        start_time?: string | null;
        updated_at: string;
      } = {
        updated_at: new Date().toISOString(),
      };

      if (parsed.title) {
        updateData.title = parsed.title.trim();
      }

      if (parsed.task_date) {
        updateData.task_date = parsed.task_date;
      }

      if (parsed.start_time !== undefined) {
        updateData.start_time = parsed.start_time || null;
      }

      const { data: updatedTask, error: updateError } = await supabaseAdmin
        .from("planner_tasks")
        .update(updateData)
        .eq("id", parsed.task_id)
        .eq("user_id", user.id)
        .select(
          "id, title, task_date, start_time, end_time, priority, status"
        )
        .single();

      if (updateError) {
        console.error("PLANNER AI EDIT ERROR:", updateError);

        return NextResponse.json(
          { error: "Could not edit planner task" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: "edit_task",
        task: updatedTask,
        reply:
          parsed.reply ||
          `تم تعديل المهمة "${updatedTask.title}".`,
      });
    }

    if (parsed.action === "add_task" && parsed.title) {
      const { data: newTask, error: insertError } = await supabaseAdmin
        .from("planner_tasks")
        .insert({
          user_id: user.id,
          title: parsed.title.trim(),
          task_date: parsed.task_date || today,
          start_time: parsed.start_time || null,
          priority: "medium",
          status: "pending",
        })
        .select(
          "id, title, task_date, start_time, end_time, priority, status"
        )
        .single();

      if (insertError) {
        console.error("PLANNER AI ADD ERROR:", insertError);

        return NextResponse.json(
          { error: "Could not add planner task" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: "add_task",
        task: newTask,
        reply:
          parsed.reply ||
          `تمت إضافة المهمة "${newTask.title}".`,
      });
    }

    return NextResponse.json({
      success: true,
      action: "chat",
      reply:
        parsed.reply ||
        "سمح ليا، ما قدرتش نفهم الطلب ديالك.",
    });
  } catch (error) {
    console.error("PLANNER AI ERROR:", error);

    return NextResponse.json(
      { error: "Planner AI failed" },
      { status: 500 }
    );
  }
}











