import express from "express";
import {
  getCustomers,
  getCustomerById,
  getCustomerProfile, // Add this import
  updateCustomerProfile,
  updateCustomerPassword,
  deleteCustomer
} from "../controllers/customerController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// === PROTECTED USER ROUTES ===
// NEW: Secure route for the currently logged-in customer to get their profile
router.get("/profile", protect, getCustomerProfile);
router.put("/profile/:id", protect, updateCustomerProfile);
router.put("/password", protect, updateCustomerPassword);

// === ADMIN ONLY ROUTES ===
router.route("/")
    .get(protect, admin, getCustomers);

router.route("/:id")
    .get(protect, admin, getCustomerById)
    .delete(protect, admin, deleteCustomer);

export default router;