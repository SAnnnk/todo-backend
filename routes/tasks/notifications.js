const express = require("express");
const router = express.Router();
const supabase = require("../../bd");
const { sendWebPush } = require("../../webpush");
router.post("/save-subscription", async (req, res) => {
  try {
    const { userId, ...subscriptionData } = req.body; 

    if (!userId || !subscriptionData) {
      return res.status(400).json({ error: "Missing userId or subscription data" });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .upsert({ user_id: userId, subscription: subscriptionData });

    if (error) throw error;

    res.json({ message: "Subscription saved!" });
  } catch (err) {
    console.error("❌ Error saving subscription:", err.message || err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});


module.exports = router;
