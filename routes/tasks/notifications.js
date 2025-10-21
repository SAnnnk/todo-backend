const express = require("express");
const router = express.Router();
const supabase = require("../../bd"); // import Supabase client
const axios = require("axios");

// --------------------
// Send push notification
// --------------------
async function sendPushNotification(user, title, body) {
  try {
    if (!user.fcm_token) return;

    const fcmUrl = "https://fcm.googleapis.com/fcm/send";
    const payload = {
      to: user.fcm_token,
      notification: {
        title: title,
        body: body,
        click_action: "https://your-app-url.com", // رابط التطبيق
      },
    };

    await axios.post(fcmUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${process.env.FCM_SERVER_KEY}`, // Server key من Firebase
      },
    });

    console.log(`Notification sent to ${user.email}`);
  } catch (err) {
    console.error("Error sending notification:", err.message);
  }
}

// --------------------
// Save FCM token for user
// --------------------
router.post("/save-token", async (req, res) => {
  const { user_id, fcm_token } = req.body;
  if (!user_id || !fcm_token) return res.status(400).json({ error: "Missing parameters" });

  try {
    const { data, error } = await supabase
      .from("users")
      .update({ fcm_token })
      .eq("user_id", user_id);

    if (error) throw error;

    res.json({ message: "Token saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Example route: send notification to all users
// --------------------
router.post("/send-to-all", async (req, res) => {
  const { title, body } = req.body;
  try {
    const { data: users, error } = await supabase.from("users").select("*").not("fcm_token", "is", null);
    if (error) throw error;

    for (const user of users) {
      await sendPushNotification(user, title, body);
    }

    res.json({ message: "Notifications sent", count: users.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
