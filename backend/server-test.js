const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock user data for testing
let users = [
  {
    _id: '1',
    name: 'Demo User',
    email: 'demo@nutriflow.com',
    age: 28,
    height: 175,
    foodStyle: 'veg',
    country: 'india',
    region: 'south',
    role: 'Health Enthusiast',
    joinDate: new Date(),
    notifications: { email: true },
    privacy: { profileVisible: false },
    healthGoals: 'general-health',
    stats: { streak: 12, goalProgress: 85 }
  }
];

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  // For testing, accept any token
  req.user = users[0];
  next();
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, age, height, foodStyle, country, region } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const newUser = {
      _id: Date.now().toString(),
      name,
      email,
      age: age || undefined,
      height: height || undefined,
      foodStyle: foodStyle || 'veg',
      country: country || undefined,
      region: region || undefined,
      role: 'Health Enthusiast',
      joinDate: new Date(),
      notifications: { email: true },
      privacy: { profileVisible: false },
      healthGoals: 'general-health',
      stats: { streak: 0, goalProgress: 0 }
    };

    users.push(newUser);

    // Generate mock JWT token
    const token = 'mock-jwt-token-' + Date.now();

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { ...newUser, password: undefined }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // For testing, accept any password
    if (!password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate mock JWT token
    const token = 'mock-jwt-token-' + Date.now();

    res.json({
      message: 'Login successful',
      token,
      user: { ...user, password: undefined }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/auth/profile', mockAuth, async (req, res) => {
  try {
    res.json({
      user: { ...req.user, password: undefined }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

app.put('/api/auth/profile', mockAuth, async (req, res) => {
  try {
    const { name, email, age, height, foodStyle, country, region, notifications, privacy, healthGoals } = req.body;

    // Update user fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (age !== undefined) updateData.age = age;
    if (height !== undefined) updateData.height = height;
    if (foodStyle) updateData.foodStyle = foodStyle;
    if (country) updateData.country = country;
    if (region) updateData.region = region;
    if (notifications) updateData.notifications = notifications;
    if (privacy) updateData.privacy = privacy;
    if (healthGoals) updateData.healthGoals = healthGoals;

    // Update the user in our mock array
    const userIndex = users.findIndex(u => u._id === req.user._id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updateData };
    }

    res.json({
      message: 'Profile updated successfully',
      user: { ...users[userIndex], password: undefined }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

app.get('/api/auth/verify', mockAuth, async (req, res) => {
  try {
    res.json({
      valid: true,
      user: { ...req.user, password: undefined }
    });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'NutriFlow API is running (Test Mode)' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Test Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log('⚠️  Running in TEST MODE - No MongoDB required');
});

