import Admin from "../models/Admin.js";

// @desc    Register a new admin
// @route   POST /api/admin/register
// @access  Private/Admin
export const registerAdmin = async (req, res) => {
  const { username, password, secret } = req.body;

  if (secret !== process.env.ADMIN_REGISTRATION_SECRET) {
    return res.status(403).json({ error: "Not authorized to create an admin." });
  }
  
  if (!username || !password) {
    return res.status(400).json({ error: "Please provide username and password" });
  }

  const adminExists = await Admin.findOne({ username });

  if (adminExists) {
    return res.status(400).json({ error: "Admin with that username already exists" });
  }

  try {
    const admin = await Admin.create({ username, password });
    res.status(201).json({
      _id: admin._id,
      username: admin.username,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during admin creation" });
  }
};

// @desc    Get all admins
// @route   GET /api/admin
// @access  Private/Admin
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}).select("-password");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// NEW FUNCTION: Added to allow session verification on page refresh.
// @desc    Get current admin's profile by token
// @route   GET /api/admin/profile
// @access  Private/Admin
export const getAdminProfile = async (req, res) => {
  // The 'protect' middleware already finds the admin and attaches it to req.user.
  // We just need to send it back.
  const admin = await Admin.findById(req.user._id).select("-password");
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
    }
  res.json(admin);
};

// @desc    Delete an admin
// @route   DELETE /api/admin/:id
// @access  Private/Admin
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    if (admin._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ error: "You cannot delete your own account." });
    }

    await admin.deleteOne();
    res.json({ message: "Admin removed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};