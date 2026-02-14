const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/email');

const getJwtSecret = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('Server misconfiguration: JWT_SECRET is not set');
  }
  return process.env.JWT_SECRET || 'secret';
};

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({
            email,
            password: hashedPassword,
            isVerified: true,
            mustChangePassword: false
        });

        await user.save();

        await ActivityLog.create({ user: user._id, action: 'register', details: user.email });

        res.status(201).json({ message: 'Registration successful. You can now login.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        // Generate new OTP
        const previousOtp = user.otp;
        const previousOtpExpires = user.otpExpires;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        try {
            await sendEmail(email, 'Verify your Account (Resend)', `Your new verification OTP is: ${otp}`);
        } catch (emailErr) {
            user.otp = previousOtp;
            user.otpExpires = previousOtpExpires;
            await user.save();
            return res.status(500).json({ message: 'Failed to send verification code. Please try again later.' });
        }

        res.json({ message: 'OTP Resent successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Verify OTP and Set Password (Optional)
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(200).json({ message: 'User already verified' }); // Allow if already verified to avoid blocking
        
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        // If newPassword is provided (for admin-created users or first-time setup)
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        res.json({ message: 'Account verified successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/activate', async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Email, current password, and new password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.isVerified = true;
        user.mustChangePassword = false;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        await ActivityLog.create({ user: user._id, action: 'activate_account', details: user.email });

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };
        const jwtSecret = getJwtSecret();
        jwt.sign(payload, jwtSecret, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Forgot Password Request
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate OTP
        const previousOtp = user.otp;
        const previousOtpExpires = user.otpExpires;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        try {
            await sendEmail(email, 'Password Reset OTP', `Your password reset OTP is: ${otp}`);
        } catch (emailErr) {
            user.otp = previousOtp;
            user.otpExpires = previousOtpExpires;
            await user.save();
            return res.status(500).json({ message: 'Failed to send password reset code. Please try again later.' });
        }
        
        res.json({ message: 'OTP sent to your email' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isVerified || user.mustChangePassword) {
            return res.json({ requiresPasswordChange: true, email: user.email });
        }

        const payload = { 
            user: { 
                id: user.id,
                role: user.role 
            } 
        };
        const jwtSecret = getJwtSecret();
        jwt.sign(payload, jwtSecret, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            ActivityLog.create({ user: user._id, action: 'login', details: user.email });
            res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email role isVerified');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
