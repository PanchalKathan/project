import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, default: 1 },
        // highlight-start
        // Price of the product at the time of purchase
        price: { type: Number, required: true },
        // highlight-end
      },
    ],
    totalAmount: { type: Number, required: true },
    // highlight-start
    // Shipping address for this specific order
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    // Reference to the payment transaction
    paymentDetails: {
      sessionId: { type: String, required: true },
      paymentStatus: { type: String, required: true, default: "Paid" },
    },
    // highlight-end
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;