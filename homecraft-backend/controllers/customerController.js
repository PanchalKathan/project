import Customer from "../models/Customer.js";

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select("-password");
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get a single customer by ID
// @route   GET /api/customers/:id
// @access  Private/Admin
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-password");
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get current customer's profile by token
// @route   GET /api/customers/profile
// @access  Private
export const getCustomerProfile = async (req, res) => {
  // The 'protect' middleware already finds the user and attaches it to req.user.
  const customer = await Customer.findById(req.user._id).select("-password");
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }
  res.json(customer);
};


// @desc    Update a customer's profile
// @route   PUT /api/customers/profile/:id
// @access  Private (Owner or Admin)
export const updateCustomerProfile = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ error: "Access Denied. You can only update your own profile." });
    }
    
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update customer password
// @route   PUT /api/customers/password
// @access  Private (Owner only)
export const updateCustomerPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        error: "Please provide a valid current password and a new password of at least 6 characters." 
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer || !(await customer.matchPassword(currentPassword))) {
      return res.status(400).json({ error: "Invalid current password" });
    }

    customer.password = newPassword;
    await customer.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};