// routes/tasks/notifications.js
const express = require("express");
const router = express.Router();
const supabase = require("../../bd");

// Save Web Push subscription
router.post("/save-subscription", async (req, res) => {
  try {
    const { userId, subscription } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({ error: "Missing userId or subscription data" });
    }

    console.log("✅ Received subscription for user:", userId);
    console.log(subscription);

    const { data, error } = await supabase
      .from("subscriptions")
      .upsert({ user_id: userId, subscription });

    if (error) throw error;

    console.log("✅ Subscription saved successfully:", data);
    res.json({ message: "Subscription saved!" });
  } catch (err) {
    console.error("❌ Error saving subscription:", err.message || err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

module.exports = router;
