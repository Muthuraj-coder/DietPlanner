const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Store reset tokens temporarily (in production, use Redis or database)
const resetTokens = new Map();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, height, weight, foodStyle, country, region } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      age: age || undefined,
      height: height || undefined,
      weight: weight || undefined,
      foodStyle: foodStyle || 'veg',
      country: country || undefined,
      region: region || undefined
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.getProfile()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: user.getProfile()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Forgot password - send reset token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Store reset token (in production, save to database)
    resetTokens.set(resetToken, {
      userId: user._id,
      email: user.email,
      expiry: resetTokenExpiry
    });

    // In production, send email here
    // For now, we'll return the token in response (remove this in production)
    res.json({
      message: 'Password reset link sent to your email',
      resetToken: resetToken, // Remove this in production
      resetTokenExpiry: resetTokenExpiry
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error processing password reset request' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find reset token
    const tokenData = resetTokens.get(resetToken);
    if (!tokenData) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    if (Date.now() > tokenData.expiry) {
      resetTokens.delete(resetToken);
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Find user
    const user = await User.findById(tokenData.userId);
    if (!user) {
      resetTokens.delete(resetToken);
      return res.status(400).json({ message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Remove used token
    resetTokens.delete(resetToken);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

// Verify reset token
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { resetToken } = req.body;

    const tokenData = resetTokens.get(resetToken);
    if (!tokenData) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    if (Date.now() > tokenData.expiry) {
      resetTokens.delete(resetToken);
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    res.json({ message: 'Token is valid', email: tokenData.email });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Server error verifying reset token' });
  }
});

// Get user profile (protected route)
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.getProfile()
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile (protected route)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, age, height, weight, foodStyle, country, region, notifications, privacy, healthGoals } = req.body;

    // Update user fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (age !== undefined) updateData.age = age;
    if (height !== undefined) updateData.height = height;
    if (req.body.weight !== undefined) updateData.weight = req.body.weight;
    if (foodStyle) updateData.foodStyle = foodStyle;
    if (country) updateData.country = country;
    if (region) updateData.region = region;
    if (notifications) updateData.notifications = notifications;
    if (privacy) updateData.privacy = privacy;
    if (healthGoals) updateData.healthGoals = healthGoals;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.getProfile()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Verify token (for frontend auth check)
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({
      valid: true,
      user: req.user.getProfile()
    });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

module.exports = router;
