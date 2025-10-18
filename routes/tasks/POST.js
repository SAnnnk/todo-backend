const express = require("express");
const router = express.Router();
const supabase = require("../../bd"); 

router.post("/", async (req, res) => {
  const {
    title,
    description = "",
    user_id,
    category_id = null,
    priority = "Medium",
    status = "Pending",
    due_date = null
  } = req.body;

  if (!title) return res.status(400).json({ error: "Title is required" });
  if (!user_id) return res.status(400).json({ error: "user_id is required" });

  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert([{
        title,
        description,
        user_id,
        category_id,
        priority,
        status,
        due_date
      }])
      .select("task_id")
      .single();

    if (error) throw error;

    res.json({
      task_id: data.task_id,
      title,
      description,
      user_id,
      category_id,
      priority,
      status,
      due_date
    });
  } catch (err) {
    console.error("❌ Task creation error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
