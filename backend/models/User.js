const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  age: {
    type: Number,
    min: 1,
    max: 120
  },
  height: {
    type: Number,
    min: 100,
    max: 250
  },
  foodStyle: {
    type: String,
    enum: ['veg', 'nonveg'],
    default: 'veg'
  },
  country: {
    type: String,
    enum: ['india', 'usa', 'uk', 'canada', 'australia', 'germany', 'france', 'japan', 'china', 'brazil', 'mexico', 'other']
  },
  region: {
    type: String,
    enum: ['north', 'south', 'east', 'west', 'central', 'northeast', 'northwest', 'southeast', 'southwest', 'no-preference']
  },
  role: {
    type: String,
    default: 'Health Enthusiast'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: 'DU'
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    }
  },
  privacy: {
    profileVisible: {
      type: Boolean,
      default: false
    }
  },
  healthGoals: {
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'maintenance', 'general-health'],
    default: 'general-health'
  },
  stats: {
    streak: {
      type: Number,
      default: 0
    },
    goalProgress: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user profile (without password)
userSchema.methods.getProfile = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
