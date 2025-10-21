// backend/routes/reminders.js
const express = require("express");
const router = express.Router();
const supabase = require("../../bd");
const axios = require("axios");

const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

async function sendPushNotification(fcm_token, title, body) {
  try {
    const response = await axios.post(
      "https://fcm.googleapis.com/fcm/send",
      {
        to: fcm_token,
        notification: {
          title,
          body,
        },
        priority: "high",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${FCM_SERVER_KEY}`,
        },
      }
    );
    console.log("Notification sent:", response.data);
  } catch (error) {
    console.error("Error sending notification:", error.response?.data || error.message);
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
      if (reminder.fcm_token) {
        await sendPushNotification(
          reminder.fcm_token,
          "Task Reminder ⏰",
          reminder.title || "You have a task reminder!"
        );

        await supabase
          .from("reminders")
          .update({ is_sent: true })
          .eq("reminder_id", reminder.reminder_id);
      } else {
        console.log(`No FCM token for user ${reminder.user_id}, skipping...`);
      }
    }

    res.json({ message: "Reminders processed", count: reminders.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
