// backend/routes/reminders.js
const express = require("express");
const router = express.Router();
const supabase = require("../../bd");
const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:your-email@example.com", // عوّض بالبريد ديالك
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendWebPush(subscription, title, body) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
    console.log("✅ Web push sent!");
  } catch (err) {
    console.error("❌ Error sending web push:", err);
  }
}

router.get("/send-reminders", async (req, res) => {
  try {

    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("*")
      .lte("remind_at", new Date().toISOString())
      .eq("is_sent", false);

    if (error) throw error;

    for (const reminder of reminders) {

      const { data: task } = await supabase
        .from("tasks")
        .select("*")
        .eq("task_id", reminder.task_id)
        .single();

      if (!task) {
        console.log(`Task not found for reminder ${reminder.reminder_id}`);
        continue;
      }

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("subscription")
        .eq("user_id", task.user_id)
        .single();

      if (!sub || !sub.subscription) {
        console.log(`No subscription for user ${task.user_id}, skipping...`);
        continue;
      }

      await sendWebPush(sub.subscription, "Task Reminder ⏰", reminder.title || "You have a task reminder!");

      await supabase
        .from("reminders")
        .update({ is_sent: true })
        .eq("reminder_id", reminder.reminder_id);
    }

    res.json({ message: "Reminders processed", count: reminders.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
