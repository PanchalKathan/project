import express from "express";
import {
  getOrders,
  getMyOrders, // Import the new controller
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// === CUSTOMER ROUTE ===
// NEW: Secure route for a user to get their own orders
router.route("/myorders").get(protect, getMyOrders);

// === ADMIN ROUTES ===
router.route("/").get(protect, admin, getOrders);

router.route("/:id")
    .get(protect, getOrderById) // Accessible by Admin or Order Owner
    .put(protect, admin, updateOrderStatus)
    .delete(protect, admin, deleteOrder);

export default router;
