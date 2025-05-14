import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Users } from "./models/User.js";
import { auth } from "./middleware/auth.js";

router.post("/SignUp", async (req, res) => {
    try {
      const { firstName, lastName, email, password, phoneNum } = req.body;
      if (!firstName || !lastName || !email || !password || !phoneNum) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new Users({
        firstName,
        lastName,
        email,
        phoneNum,
        password: hashedPassword,
      });
  
      await newUser.save();
      const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, {
        expiresIn: "1h", // token expiration
      });
  
      res.status(201).json({
        message: "User signed up successfully",
        token,
        user: {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email
        }
      });
    } catch (error) {
      console.error("SignUp Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Login Route
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
  
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
  
      res.status(200).json({ 
        message: "Login successful", 
        token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user info
  router.get("/me", auth, async (req, res) => {
    try {
      const user = await Users.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

export default router;