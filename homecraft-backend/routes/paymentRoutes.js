import express from "express";
import { 
  createCheckoutSession, 
  handleStripeWebhook, 
  getSessionDetails 
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// This route receives JSON data from the frontend and therefore needs the express.json() middleware.
router.post("/create-checkout-session", express.json(), protect, createCheckoutSession);

// This route MUST receive the raw request body for Stripe's signature verification.
// It uses express.raw() and must NOT use express.json().
router.post("/webhook", express.raw({ type: 'application/json' }), handleStripeWebhook);

// This route does not have a body, so it needs neither.
router.get("/session/:id", protect, getSessionDetails);

export default router;
