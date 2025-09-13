import express from "express";
import { loginAdmin } from "../controllers/authController.js";
// prettier-ignore
import { registerAdmin, getAdmins, deleteAdmin, getAdminProfile } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route for an admin to log in
router.post("/login", loginAdmin);

// NEW: Secure route to get the currently logged-in admin's profile
router.get("/profile", protect, admin, getAdminProfile);

// === Protected Admin Management Routes ===

// Get all admins & Register a new admin
router.route("/")
    .get(protect, admin, getAdmins)
    .post(protect, admin, registerAdmin);

// Delete an admin
router.route("/:id")
    .delete(protect, admin, deleteAdmin);

export default router;