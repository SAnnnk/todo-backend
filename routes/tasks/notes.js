const express = require("express");
const router = express.Router();
const supabase = require("../../bd"); // الاتصال بـ Supabase

// ---------------- GET ALL NOTES ----------------
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- CREATE A NOTE ----------------
router.post("/", async (req, res) => {
  const { task_id, content } = req.body;
  if (!task_id || !content) return res.status(400).json({ error: "Missing fields" });

  try {
    const { data, error } = await supabase
      .from("notes")
      .insert([{ task_id, content }])
      .select("note_id")
      .single();

    if (error) throw error;
    res.json({ id: data.note_id, task_id, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- UPDATE A NOTE ----------------
router.put("/:id", async (req, res) => {
  const { content } = req.body;
  const note_id = req.params.id;

  try {
    const { data, error } = await supabase
      .from("notes")
      .update({ content })
      .eq("note_id", note_id);

    if (error) throw error;
    res.json({ updated: data.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- DELETE A NOTE ----------------
router.delete("/:id", async (req, res) => {
  const note_id = req.params.id;

  try {
    const { data, error } = await supabase
      .from("notes")
      .delete()
      .eq("note_id", note_id);

    if (error) throw error;
    res.json({ deleted: data.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
