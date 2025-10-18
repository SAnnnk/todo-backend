const express = require("express");
const router = express.Router();
const supabase = require("../../bd"); // الاتصال بـ Supabase

// 🟢 GET all tasks for a user
router.get("/", async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: "user_id is required" });

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
