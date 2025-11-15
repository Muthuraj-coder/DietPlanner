# NutriFlow - Intelligent Diet Planner 🥗

[![Live Demo](https://img.shields.io/badge/Live%20Demo-nutriflowin.netlify.app-brightgreen)](https://nutriflowin.netlify.app/)
[![Backend API](https://img.shields.io/badge/Backend%20API-nutriflow--backend--3v30.onrender.com-blue)](https://nutriflow-backend-3v30.onrender.com/api/health)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive, AI-powered diet planning application that generates personalized, region-specific meal plans based on your health goals, dietary preferences, and geographic location. Built with React, Node.js, and MongoDB.

## 📋 **Table of Contents**
- [🚀 Live Application](#-live-application)
- [🌟 Core Features](#-core-features)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [📊 Database Schema](#-database-schema)
- [🔧 Technology Stack](#-technology-stack)
- [🚀 Installation & Setup](#-installation--setup)
- [📡 API Documentation](#-api-documentation)
- [⚙️ Configuration](#️-configuration)
- [🔄 Scheduled Tasks](#-scheduled-tasks)
- [📧 Email System](#-email-system)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🚀 **Live Application**
- **Frontend**: [https://nutriflowin.netlify.app/](https://nutriflowin.netlify.app/)
- **Backend API**: [https://nutriflow-backend-3v30.onrender.com](https://nutriflow-backend-3v30.onrender.com)
- **Health Check**: [API Status](https://nutriflow-backend-3v30.onrender.com/api/health)

## 🌟 **Core Features**

### 🔐 **User Authentication & Profile Management**
- **Secure JWT-based authentication** with bcrypt password hashing (12 salt rounds)
- **Comprehensive user profiles** with health metrics (age, height, weight, gender)
- **Password reset functionality** with email verification and crypto tokens
- **Profile customization** for dietary preferences and health goals
- **Real-time dashboard** with personalized metrics and live data
- **Water intake tracking** with automatic daily reset functionality
- **Streak tracking** and goal progress monitoring

### 🍽️ **AI-Powered Meal Plan Generation**
- **Gender-specific calorie calculation** using Mifflin-St Jeor BMR equation:
  - Male: BMR = 10×weight + 6.25×height - 5×age + 5
  - Female: BMR = 10×weight + 6.25×height - 5×age - 161
- **Regional cuisine intelligence** with authentic local dishes
- **Smart dietary filtering** (vegetarian/non-vegetarian preferences)
- **3-tier fallback system** ensuring meal plans are always generated
- **Daily generation limits** (3 meal plans per day) to prevent API abuse
- **Automatic daily meal generation** at 12:00 AM IST with backup schedules
- **Edamam Recipe API v2 integration** for 2M+ recipes
- **Optimal meal distribution**: Breakfast 25%, Lunch 35%, Snack 10%, Dinner 30%

### 📊 **Advanced Nutrition Tracking**
- **Real-time calorie consumption** monitoring from completed meals
- **Detailed macronutrient breakdown** (protein, carbs, fats) per meal
- **Water intake tracking** with daily reset (0-20 glasses limit)
- **Progress visualization** with interactive charts and statistics
- **Meal completion tracking** with timestamps and calorie counting
- **Streak tracking** and goal progress monitoring
- **Dashboard statistics** API for real-time data fetching

### 🌍 **Regional Cuisine Intelligence**
Specialized support for authentic regional cuisines:
- **India**: North, South, East, West regions with traditional dishes
  - South: Dosa, Idli, Sambar, Chicken Chettinad, Rasam
  - North: Paratha, Dal Makhani, Butter Chicken, Rajma
  - East: Fish Curry, Khichdi, Luchi, Mishti Doi
  - West: Dhokla, Undhiyu, Pav Bhaji, Vada Pav
- **International**: Support for USA, UK, Canada, Australia, Germany, France, Japan, China, Brazil, Mexico
- **Cultural dietary preferences** integration with fallback meals

### 📧 **Email Notification System**
- **Automatic meal plan emails** sent upon generation
- **Rich HTML formatting** with emojis and nutritional information
- **Meal time reminders** at 8 AM, 1 PM, 4 PM, 8 PM IST
- **Gmail SMTP integration** with timeout handling
- **Graceful fallback** when email fails (doesn't break meal generation)
- **User preference controls** for email notifications

### ⏰ **Automated Scheduling**
- **Cron-based scheduler** running in Asia/Kolkata timezone
- **Multiple generation schedules** for reliability:
  - 12:00 AM IST (Primary)
  - 6:00 AM IST (Backup)
  - 12:00 PM IST (Backup)
- **Meal time notifications**:
  - Breakfast: 8:00 AM IST
  - Lunch: 1:00 PM IST
  - Snack: 4:00 PM IST
  - Dinner: 8:00 PM IST

## 🏗️ **Architecture Overview**

### **System Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│◄──►│   Node.js API   │◄──►│   MongoDB       │
│   (Vite +       │    │   (Express)     │    │   (Mongoose)    │
│    TailwindCSS) │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Material-UI   │    │   JWT Auth      │    │   User Data     │
│   Lucide Icons  │    │   bcryptjs      │    │   Meal Plans    │
│   React Router  │    │   Nodemailer    │    │   Schedules     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow**
1. **User Registration/Login** → JWT Token Generation
2. **Profile Setup** → Health Metrics Storage
3. **Meal Plan Request** → BMR Calculation → API Integration → Recipe Selection
4. **Email Notification** → SMTP Delivery
5. **Daily Schedule** → Cron Jobs → Auto-Generation
6. **Progress Tracking** → Meal Completion → Calorie Counting

## 📊 **Database Schema**

### **User Collection**
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, bcrypt hashed),
  age: Number (1-120),
  height: Number (100-250 cm),
  weight: Number (20-300 kg),
  gender: String (enum: ['male', 'female']),
  foodStyle: String (enum: ['veg', 'nonveg'], default: 'veg'),
  country: String (enum: ['india', 'usa', 'uk', 'canada', ...]),
  region: String (enum: ['north', 'south', 'east', 'west', ...]),
  role: String (default: 'Health Enthusiast'),
  joinDate: Date (default: Date.now),
  avatar: String (default: 'DU'),
  notifications: {
    email: Boolean (default: true)
  },
  privacy: {
    profileVisible: Boolean (default: false)
  },
  healthGoals: String (enum: ['weight-loss', 'muscle-gain', 'maintenance', 'general-health']),
  stats: {
    streak: Number (default: 0),
    goalProgress: Number (default: 0)
  },
  dailyTracking: {
    waterIntake: Number (default: 0, min: 0, max: 20),
    lastWaterReset: Date (default: Date.now),
    lastStreakUpdate: Date (default: Date.now)
  },
  timestamps: true
}
```

### **MealPlan Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  date: Date (required),
  targetDailyCalories: Number (required),
  meals: [{
    mealType: String (enum: ['breakfast', 'lunch', 'snack', 'dinner']),
    name: String (required),
    ingredients: [String],
    calories: Number (required),
    macronutrients: {
      protein: Number (default: 0),
      carbs: Number (default: 0),
      fats: Number (default: 0)
    },
    source: String,
    url: String,
    image: String,
    completed: Boolean (default: false),
    completedAt: Date
  }],
  summary: {
    totalCalories: Number (default: 0),
    protein: Number (default: 0),
    carbs: Number (default: 0),
    fats: Number (default: 0)
  },
  consumedCalories: Number (default: 0),
  generatedAt: Date (default: Date.now),
  dailyGenerationCount: Number (default: 1),
  lastGenerationDate: Date (default: Date.now),
  isAutoGenerated: Boolean (default: false),
  manualGenerationCount: Number (default: 0),
  lastAutoGeneration: Date,
  timestamps: true
}
```

### **Database Indexes**
- **User Collection**: Unique index on `email`
- **MealPlan Collection**: Compound index on `{ userId: 1, date: 1 }` (unique)

## 🔧 **Technology Stack**

### **Frontend Technologies**
- **React 19.1.0** - Modern UI library with hooks
- **Vite 7.0.4** - Fast build tool and dev server
- **React Router DOM 7.7.0** - Client-side routing
- **Material-UI 7.2.0** - React component library
- **Lucide React 0.525.0** - Beautiful icon library
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **Emotion** - CSS-in-JS styling for Material-UI

### **Backend Technologies**
- **Node.js** - JavaScript runtime environment
- **Express 4.18.2** - Web application framework
- **MongoDB** - NoSQL document database
- **Mongoose 8.0.3** - MongoDB object modeling
- **JWT 9.0.2** - JSON Web Token authentication
- **bcryptjs 2.4.3** - Password hashing
- **node-cron 4.2.1** - Task scheduling
- **node-fetch 2.7.0** - HTTP client for API calls
- **nodemailer 7.0.6** - Email sending
- **dotenv 16.3.1** - Environment variable management
- **cors 2.8.5** - Cross-origin resource sharing

### **External APIs**
- **Edamam Recipe API v2** - Recipe database and nutritional information
- **Gmail SMTP** - Email delivery service

### **Development Tools**
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **Netlify** - Frontend hosting
- **Render** - Backend hosting

## � **Installation & Setup**

### **Prerequisites**
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Gmail account with 2FA enabled (for email notifications)
- Git

### **Installation Steps**

#### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/nutriflow.git
cd nutriflow
```

#### **2. Backend Setup**
```bash
cd backend
npm install
```

#### **3. Frontend Setup**
```bash
cd ../
npm install
```

#### **4. Environment Configuration**
Create a `config.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutriflow
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
EDAMAM_APP_ID=your-edamam-app-id
EDAMAM_APP_KEY=your-edamam-app-key
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:5173
```

#### **5. Gmail Setup for Email Notifications**
1. Enable 2FA on your Gmail account
2. Generate an App Password at [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the 16-character App Password in `EMAIL_PASS`

#### **6. Start the Application**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 📡 **API Documentation**

### **Authentication Endpoints**
```
POST /api/auth/register          - User registration
POST /api/auth/login             - User login
POST /api/auth/forgot-password   - Request password reset
POST /api/auth/reset-password    - Reset password with token
GET  /api/auth/profile           - Get user profile
PUT  /api/auth/profile           - Update user profile
POST /api/auth/update-water      - Update water intake
GET  /api/auth/dashboard-stats   - Get dashboard statistics
```

### **Meal Plan Endpoints**
```
POST /api/mealplan/generate      - Generate new meal plan
GET  /api/mealplan/today         - Get today's meal plan
POST /api/mealplan/complete-meal - Mark meal as completed
GET  /api/mealplan/generation-status - Check generation limit
GET  /api/mealplan/history       - Get meal plan history
```

### **Scheduler Endpoints**
```
POST /api/scheduler/generate-all - Manual trigger for all users
GET  /api/scheduler/status      - Get scheduler status
```

### **API Response Format**
```javascript
// Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## ⚙️ **Configuration**

### **Environment Variables**
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `EDAMAM_APP_ID` | Edamam API application ID | Yes |
| `EDAMAM_APP_KEY` | Edamam API application key | Yes |
| `EMAIL_USER` | Gmail address for notifications | Optional |
| `EMAIL_PASS` | Gmail app password | Optional |
| `FRONTEND_URL` | Frontend application URL | Yes |

### **Edamam API Setup**
1. Register at [Edamam Developer Portal](https://developer.edamam.com/)
2. Create a new application
3. Get your `APP_ID` and `APP_KEY`
4. Add them to your environment variables

## 🔄 **Scheduled Tasks**

### **Automatic Meal Plan Generation**
The system runs multiple scheduled tasks using node-cron in Asia/Kolkata timezone:

#### **Primary Generation Schedule**
- **12:00 AM IST** - Main daily generation for all users
- **6:00 AM IST** - Backup generation for missed users
- **12:00 PM IST** - Secondary backup generation

#### **Meal Time Notifications**
- **8:00 AM IST** - Breakfast reminders
- **1:00 PM IST** - Lunch reminders
- **4:00 PM IST** - Snack reminders
- **8:00 PM IST** - Dinner reminders

### **Generation Logic**
- Each user gets **one auto-generated meal plan per day**
- Users can manually generate **up to 3 additional plans per day**
- Generation limits reset at midnight
- Fallback meals ensure 100% generation success rate

## 📧 **Email System**

### **Email Features**
- **Rich HTML formatting** with emojis and nutritional information
- **Personalized content** with user's name and preferences
- **Automatic meal plan delivery** upon generation
- **Meal time reminders** with schedule information
- **Graceful fallback** when email fails

### **Email Templates**
#### **Meal Plan Email**
```
🍽️ Your Personalized Daily Meal Plan

Hello [User Name]!

Here's your customized meal plan for today:
📊 Daily Target: [calories] calories
🎯 Health Goal: [goal]
🌍 Region: [region] cuisine

═══════════════════════════════════════

🌅 BREAKFAST
[Meal Name]
Calories: [amount]
Protein: [amount]g | Carbs: [amount]g | Fats: [amount]g
Ingredients: [list]
Recipe: [URL]

[Similar format for lunch, snack, dinner]

📈 Daily Nutrition Summary
Total Calories: [amount]
Protein: [amount]g | Carbs: [amount]g | Fats: [amount]g

💡 Health Tips & Motivation
```

#### **Meal Reminder Email**
```
⏰ Meal Time Reminder!

It's time for [meal type]!

Today's [meal type]:
[Meal Name]
Calories: [amount]

Don't forget to mark it as completed in your app!

Stay healthy,
NutriFlow Team
```

## 🚀 **Deployment**

### **Frontend Deployment (Netlify)**
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables:
   - `VITE_API_URL=https://your-backend-url.com/api`

### **Backend Deployment (Render)**
1. Connect your repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add all environment variables from config.env
5. Set health check path: `/api/health`

### **Production Considerations**
- Use production MongoDB cluster
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper CORS origins
- Monitor API rate limits
- Set up logging and monitoring

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### **Code Guidelines**
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Test API endpoints manually
- Ensure responsive design for frontend

### **Bug Reports**
Please report bugs through GitHub Issues with:
- Detailed description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Edamam** for the amazing Recipe API
- **Material-UI** for beautiful React components
- **TailwindCSS** for utility-first CSS framework
- **Netlify** for frontend hosting
- **Render** for backend hosting
- **MongoDB Atlas** for database services

---

## 📞 **Support & Contact**

Created with ❤️ by [Your Name]

- **Email**: your-email@example.com
- **GitHub**: https://github.com/your-username
- **Live Demo**: https://nutriflowin.netlify.app

---

⭐ If you find this project helpful, please give it a star!
