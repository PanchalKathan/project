import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: "IN" },
    },
    phone: { type: String },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// This function runs right before the customer is saved
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Add a method to the model to compare passwords
customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
