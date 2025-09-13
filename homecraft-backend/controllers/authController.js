import Customer from "../models/Customer.js";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

const generateToken = (id, isAdmin = false) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: isAdmin ? "1h" : "7d",
  });
};

// @desc    Register a new customer
// @route   POST /api/user/signup
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    
    const existingUser = await Customer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const customer = await Customer.create({ name, email, password, address, phone });

    res.status(201).json({
      message: "Signup successful",
      token: generateToken(customer._id),
      user: {
        id: customer._id, 
        name: customer.name, 
        email: customer.email ,
        address: customer.address,
        phone: customer.phone
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Login a customer
// @route   POST /api/user/login
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email });

    if (customer && (await customer.matchPassword(password))) {
      res.json({
        message: "Login successful",
        token: generateToken(customer._id),
        user: { id: customer._id, name: customer.name, email: customer.email,phone:customer.phone,address:customer.address },
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Login an admin
// @route   POST /api/admin/login
export const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (admin && (await admin.matchPassword(password))) {
            // FIX: This now returns the admin's user data, not just the token.
            res.json({ 
                token: generateToken(admin._id, true),
                user: {
                    id: admin._id,
                    name: admin.username, // Use username as name for consistency
                    isAdmin: true
                }
            });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};