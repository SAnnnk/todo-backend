const express = require("express");
const router = express.Router();
const supabase = require("../../bd"); 
router.get("/:user_id", async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const stats = {
      tasksCompleted: 0,
      tasksOverdue: 0,
      avgCompletion: 0,
      completion30Days: 0,
      completed_prev_30: 0,
      categories: [],
      totalTasks: 0,
    };

    console.log("📥 Dashboard request for user_id:", user_id);

 
    const { count: completedCount, error: completedError } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user_id)
      .ilike("status", "completed");

    if (completedError) throw completedError;
    stats.tasksCompleted = completedCount || 0;

   
    const { count: overdueCount, error: overdueError } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user_id)
      .not("status", "ilike", "completed");

    if (overdueError) throw overdueError;
    stats.tasksOverdue = overdueCount || 0;

   
    const { data: completedTime, error: timeError } = await supabase
      .from("tasks")
      .select("created_at, completed_at")
      .eq("user_id", user_id)
      .ilike("status", "completed");

    if (timeError) throw timeError;

    const durations = completedTime
      .filter(t => t.completed_at && t.created_at)
      .map(t => (new Date(t.completed_at) - new Date(t.created_at)) / (1000 * 60 * 60 * 24));

    const avg = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    stats.avgCompletion = avg.toFixed(1);

   
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: last30Count, error: last30Error } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user_id)
      .ilike("status", "completed")
      .gte("completed_at", thirtyDaysAgo);

    if (last30Error) throw last30Error;
    stats.completion30Days = last30Count || 0;

   
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const { count: prev30Count, error: prev30Error } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user_id)
      .ilike("status", "completed")
      .gte("completed_at", sixtyDaysAgo)
      .lte("completed_at", thirtyDaysAgo);

    if (prev30Error) throw prev30Error;
    stats.completed_prev_30 = prev30Count || 0;

   
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("category_id, name");

    if (categoriesError) throw categoriesError;

    const categoryStats = await Promise.all(
      categoriesData.map(async (category) => {
        const { count: taskCount, error: taskError } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user_id)
          .eq("category_id", category.category_id);

        if (taskError) throw taskError;

        return {
          name: category.name,
          total: taskCount || 0
        };
      })
    );

    stats.categories = categoryStats;
    stats.totalTasks = categoryStats.reduce((sum, c) => sum + c.total, 0);

    console.log("📊 Dashboard stats:", stats);
    res.json(stats);
  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).json({ error: err.message || "Unknown dashboard error" });
  }
});

module.exports = router;
