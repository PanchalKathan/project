import Order from "../models/Order.js";

// @desc    Get all orders (for admins)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// NEW FUNCTION: Added for customers to fetch their own orders
// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private (Owner or Admin)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email");
    
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (req.user.isAdmin || order.customer._id.toString() === req.user._id.toString()) {
      res.json(order);
    } else {
      res.status(403).json({ error: "Access Denied." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order removed" });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
