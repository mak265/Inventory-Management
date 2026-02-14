const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const logActivity = require('../utils/logger');
const sendEmail = require('../utils/email');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const generateTempPassword = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = crypto.randomBytes(12);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
};

// Get all users (Admin only)
router.get('/', auth, roles('admin'), async (req, res) => {
  try {
    const query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query).select('-password -otp -otpExpires').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create user (Admin only)
router.post('/', auth, roles('admin'), async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    if (role && !['admin', 'warehouse_staff', 'site_engineer', 'client', 'delivery'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const tempPassword = generateTempPassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);
    const user = new User({
      email,
      password: hashedPassword,
      role: role || 'warehouse_staff',
      isVerified: true,
      mustChangePassword: true
    });
    await user.save();
    
    // Send Email
    try {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const loginUrl = `${clientUrl.replace(/\/$/, '')}/login`;
      await sendEmail(
        email,
        'Welcome - Your Account Credentials',
        `Your account has been created.\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nLogin here: ${loginUrl}\nAfter login, you will be asked to change your password immediately.\n\nIf you did not request this account, you can ignore this email.`
      );
    } catch (emailErr) {
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ message: 'Failed to send credentials email. Please try again later.' });
    }

    await logActivity(req.user.id, 'create_user', `Created user ${user.email} (${user.role}) - Must change password`);
    res.status(201).json({ _id: user._id, email: user.email, role: user.role, createdAt: user.createdAt, message: 'User created. Credentials were emailed to the user.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user role (Admin only)
router.put('/:id/role', auth, roles('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'warehouse_staff', 'site_engineer', 'client', 'delivery'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent changing own role to lose admin access (optional safety check)
    if (req.user.id === user.id && role !== 'admin') {
      return res.status(400).json({ message: 'Cannot remove your own admin privileges' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logActivity(req.user.id, 'update_user_role', `Changed role for ${user.email} from ${oldRole} to ${role}`);
    
    res.json({ message: 'User role updated', user: { _id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', auth, roles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.user.id === user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await user.deleteOne();
    await logActivity(req.user.id, 'delete_user', `Deleted user ${user.email}`);

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
