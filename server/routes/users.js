const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const logActivity = require('../utils/logger');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const generateTempPassword = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(10);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
};

// [CREATE USER] Admin creates an account
router.post('/', auth, roles('admin'), async (req, res) => {
  try {
    const { email, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const tempPassword = generateTempPassword();

    // STEP 1: I-hash ang password bago i-save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // STEP 2: I-save sa DB (isVerified: true para maka-login agad)
    const user = new User({
      email,
      password: hashedPassword, 
      role,
      isVerified: true, 
      mustChangePassword: true
    });

    await user.save();

    // STEP 3: I-prepare ang Email Template
    const clientUrl = (process.env.CLIENT_URL || 'http://167.71.120.114').replace(/\/$/, '');
    const subject = 'Your New Account Credentials';
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">Welcome!</h2>
        <p>Your account has been created by the Admin.</p>
        <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          <strong>Email:</strong> ${email}<br>
          <strong>Temporary Password:</strong> <code style="font-size: 1.2em; color: #d9534f;">${tempPassword}</code>
        </div>
        <p>Please change your password immediately after logging in.</p>
        <a href="${clientUrl}/" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Login to Dashboard</a>
      </div>`;

    // STEP 4: I-send ang email (Plain text password ang sinesend sa user)
    await sendEmail(email, subject, `Credentials: ${email} / ${tempPassword}`, htmlBody);

    await logActivity(req.user.id, 'create_user', `Admin created user ${email}`);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// [GET ALL USERS]
router.get('/', auth, roles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// [DELETE USER]
router.delete('/:id', auth, roles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.user.id === req.params.id) return res.status(400).json({ message: 'Cannot delete yourself' });

    await User.findByIdAndDelete(req.params.id);
    await logActivity(req.user.id, 'delete_user', `Deleted user ${user.email}`);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
