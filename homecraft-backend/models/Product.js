import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String }, // URL of image
    category: { type: String },
    // highlight-start
    stock: { type: Number, required: true, default: 0, min: 0 },
    // highlight-end
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;