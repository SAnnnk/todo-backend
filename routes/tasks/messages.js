const express = require("express");
const router = express.Router();
const supabase = require("../../bd"); // الاتصال بـ Supabase

// ---------------- GET MESSAGES FOR A USER ----------------
router.get("/", async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: "user_id is required" });

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("message_id, user_id, title, description, is_read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- CREATE A NEW MESSAGE ----------------
router.post("/", async (req, res) => {
  const { user_id, title, description, is_read } = req.body;
  if (!user_id || !title) return res.status(400).json({ error: "Missing required fields" });

  try {
    const { data, error } = await supabase
      .from("messages")
      .insert([{ user_id, title, description: description || "", is_read: is_read ?? false }])
      .select("message_id")
      .single();

    if (error) throw error;
    res.json({ message_id: data.message_id, user_id, title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- UPDATE A MESSAGE ----------------
router.put("/:id", async (req, res) => {
  const { title, description, is_read } = req.body;
  const messageId = req.params.id;

  try {
    const { data, error } = await supabase
      .from("messages")
      .update({ title, description, is_read })
      .eq("message_id", messageId);

    if (error) throw error;
    res.json({ updated: data.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- DELETE A MESSAGE ----------------
router.delete("/:id", async (req, res) => {
  const messageId = req.params.id;

  try {
    const { data, error } = await supabase
      .from("messages")
      .delete()
      .eq("message_id", messageId);

    if (error) throw error;
    res.json({ deleted: data.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
