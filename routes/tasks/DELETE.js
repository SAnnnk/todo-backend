const express = require("express");
const router = express.Router();
const supabase = require("../../bd");
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("task_id", id);

    if (error) throw error;

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("❌ Delete error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
