const express = require("express");
const router = express.Router();
const supabase = require("../../bd");

router.delete("/:id", async (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  if (!taskId) return res.status(400).json({ error: "Invalid task ID" });

  try {
    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("task_id", taskId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ success: true, task_id: taskId });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
