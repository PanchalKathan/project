import express from "express";
import { registerCustomer, loginCustomer } from "../controllers/authController.js";

const router = express.Router();

// Routes for customer signup and login
router.post("/signup", registerCustomer);
router.post("/login", loginCustomer);

export default router;