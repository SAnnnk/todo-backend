const express = require("express");
const router = express.Router();
const supabase = require("../../bd");
const { sendWebPush } = require("../../webpush");

router.post("/save-subscription", async (req, res) => {
  const subscription = req.body;
  const userId = req.body.userId; 

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert({ user_id: userId, subscription })
    .eq("user_id", userId);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Subscription saved!" });
});

module.exports = router;
