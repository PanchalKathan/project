import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Chain routes for better organization and readability.
// This handles requests to the base /api/products URL.
router.route("/")
  .get(getProducts) // Anyone can view all products.
  .post(protect, admin, createProduct); // Only admins can create a new product.

// This handles requests for a specific product, e.g., /api/products/:id
router.route("/:id")
  .get(getProductById) // Anyone can view a single product.
  .put(protect, admin, updateProduct) // Only admins can update a product.
  .delete(protect, admin, deleteProduct); // Only admins can delete a product.

export default router;

