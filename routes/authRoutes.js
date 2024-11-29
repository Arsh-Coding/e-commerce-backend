const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET =
  "6d17c82c9eba859aeede6c3ddaebb29a54108235e02f82bd48d624505bef637a";

// Render Signup Page
router.get("/auth/signup", (req, res) => {
  res.render("auth/signup");
});

// Render Login Page
router.get("/auth/login", (req, res) => {
  res.render("auth/login");
});

// Register
router.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    const user = { name, email, password: hashedPassword };

    const userExists = await req.db.collection("users").findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    await req.db.collection("users").insertOne(user);
    res.redirect("/auth/login");
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await req.db.collection("users").findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    if (hashedPassword !== user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
