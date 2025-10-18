const express = require("express");
const router = express.Router();
const supabase = require("../../bd"); // الاتصال بـ Supabase

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("task_id", id);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
