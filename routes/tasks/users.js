const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const supabase = require("../../bd"); // الاتصال بـ Supabase

// ---------------- GET ALL USERS ----------------
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- SIGNUP ----------------
router.post("/", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([{ username, email, password_hash: hashedPassword }])
      .select("user_id")
      .single();

    if (error) {
      if (error.message.includes("duplicate")) {
        return res.status(400).json({ error: "Username or email already exists!" });
      }
      throw error;
    }

    console.log("User created:", username, email);
    res.json({ id: data.user_id, username, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, data.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    res.json({
      user_id: data.user_id,
      username: data.username,
      email: data.email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
