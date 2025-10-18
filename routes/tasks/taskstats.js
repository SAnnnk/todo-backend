const express = require("express");
const router = express.Router();
const supabase = require("../../bd"); 

// ---------------- GET ALL STATS ----------------
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("taskstats")
      .select("*")
      .order("last_updated", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- CREATE STAT ----------------
router.post("/", async (req, res) => {
  const { user_id, total_tasks, completed_tasks, overdue_tasks } = req.body;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  try {
    const { data, error } = await supabase
      .from("taskstats")
      .insert([{
        user_id,
        total_tasks: total_tasks || 0,
        completed_tasks: completed_tasks || 0,
        overdue_tasks: overdue_tasks || 0
      }])
      .select("stat_id")
      .single();

    if (error) throw error;

    res.json({
      id: data.stat_id,
      user_id,
      total_tasks,
      completed_tasks,
      overdue_tasks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- UPDATE STAT ----------------
router.put("/:id", async (req, res) => {
  const { total_tasks, completed_tasks, overdue_tasks } = req.body;
  const stat_id = req.params.id;

  try {
    const { data, error } = await supabase
      .from("taskstats")
      .update({
        total_tasks,
        completed_tasks,
        overdue_tasks,
        last_updated: new Date().toISOString()
      })
      .eq("stat_id", stat_id);

    if (error) throw error;
    res.json({ updated: data.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- DELETE STAT ----------------
router.delete("/:id", async (req, res) => {
  const stat_id = req.params.id;

  try {
    const { data, error } = await supabase
      .from("taskstats")
      .delete()
      .eq("stat_id", stat_id);

    if (error) throw error;
    res.json({ deleted: data.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
