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
        notification: { title, body },
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
    
    const { data: reminders, error: remindersError } = await supabase
      .from("reminders")
      .select("*")
      .lte("remind_at", new Date().toISOString())
      .eq("is_sent", false);

    if (remindersError) throw remindersError;

    for (const reminder of reminders) {
      
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("user_id, fcm_token")
        .eq("user_id", reminder.user_id)
        .single();

      if (userError) {
        console.log(`User not found for reminder ${reminder.reminder_id}`);
        continue;
      }

      if (users?.fcm_token) {
        await sendPushNotification(
          users.fcm_token,
          "Task Reminder ⏰",
          reminder.title || "You have a task reminder!"
        );

        await supabase
          .from("reminders")
          .update({ is_sent: true })
          .eq("reminder_id", reminder.reminder_id);
      } else {
        console.log(`No FCM token for user ${users.user_id}, skipping...`);
      }
    }

    res.json({ message: "Reminders processed", count: reminders.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
