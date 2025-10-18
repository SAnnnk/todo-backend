const express = require("express");
const router = express.Router();
const supabase = require("../../bd"); 

// ---------------- UPDATE TASK ----------------
router.put("/:task_id", async (req, res) => {
  const { task_id } = req.params;
  const { title, description, status, priority, category_id, due_date } = req.body;

  try {
    let completed_at = null;

    if (status === "Completed") {
      const { data: existingTask, error: fetchError } = await supabase
        .from("tasks")
        .select("completed_at")
        .eq("task_id", task_id)
        .single();

      if (fetchError) throw fetchError;
      completed_at = existingTask?.completed_at || new Date().toISOString();
    }

  
    const { data, error } = await supabase
      .from("tasks")
      .update({
        title,
        description,
        status,
        priority,
        category_id,
        due_date,
        completed_at,
        updated_at: new Date().toISOString()
      })
      .eq("task_id", task_id);

    if (error) throw error;

    res.json({ message: "Task updated successfully" });
  } catch (err) {
    console.error("❌ Task update error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
