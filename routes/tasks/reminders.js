// backend/routes/reminders.js
const express = require("express");
const router = express.Router();
const supabase = require("../../bd");
const axios = require("axios");

const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

async function sendPushNotification(fcm_token, title, body) {
  try {
    await axios.post(
      "https://fcm.googleapis.com/fcm/send",
      {
        to: fcm_token,
        notification: { title, body },
        priority: "high",
      },
      { headers: { "Content-Type": "application/json", Authorization: `key=${FCM_SERVER_KEY}` } }
    );
  } catch (err) {
    console.error("Error sending notification:", err.response?.data || err.message);
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
      const { data: task } = await supabase.from("tasks").select("*").eq("task_id", reminder.task_id).single();
      if (!task) {
        console.log(`Task not found for reminder ${reminder.reminder_id}`);
        continue;
      }

      const { data: user } = await supabase.from("users").select("*").eq("user_id", task.user_id).single();
      if (!user || !user.fcm_token) {
        console.log(`No FCM token for user ${task.user_id}, skipping...`);
        continue;
      }

      await sendPushNotification(user.fcm_token, "Task Reminder ⏰", reminder.title || "You have a task reminder!");

      await supabase.from("reminders").update({ is_sent: true }).eq("reminder_id", reminder.reminder_id);
    }

    res.json({ message: "Reminders processed", count: reminders.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
