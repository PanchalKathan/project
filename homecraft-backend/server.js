import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import all your route handlers
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

// --- Middleware ---
app.use(cors());

// --- CRITICAL FIX: The "Special Entrance" for Payments ---
// This line MUST come BEFORE the global app.use(express.json()).
// It sends all /api/payment requests to their own router first.
app.use("/api/payment", paymentRoutes);
// ---------------------------------------------------------

// Now, the "Main Bouncer" handles all OTHER routes
app.use(express.json());


// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// --- API Route Registration ---
// Note: /api/payment is already registered above.
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/user", authRoutes);


// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});