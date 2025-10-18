const express = require("express");
const router = express.Router();
const supabase = require("../../bd"); // الاتصال بـ Supabase

// 🟢 Get all public categories
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("category_id, name, description");

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch categories" });
  }
});

// 🟡 Create a new category (admin only - optional)
router.post("/", async (req, res) => {
  const { name, description = "" } = req.body;

  // تحقق اختياري من صلاحية المستخدم (مثلاً عبر رمز إداري)
  const isAdmin = req.headers["x-admin-token"] === process.env.ADMIN_TOKEN;
  if (!isAdmin) return res.status(403).json({ error: "Only admin can create categories" });

  if (!name) return res.status(400).json({ error: "Category name is required" });

  try {
    const { data, error } = await supabase
      .from("categories")
      .insert([{ name, description }])
      .select("category_id")
      .single();

    if (error) throw error;
    res.json({ id: data.category_id, name, description });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create category" });
  }
});

// 🔵 Block category update
router.put("/:id", async (req, res) => {
  return res.status(403).json({ error: "Editing categories is not allowed" });
});

// 🔴 Block category deletion
router.delete("/:id", async (req, res) => {
  return res.status(403).json({ error: "Deleting categories is not allowed" });
});

module.exports = router;
