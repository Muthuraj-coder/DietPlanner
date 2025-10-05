# NutriFlow - Intelligent Diet Planner 🥗

A comprehensive, personalized diet planning application that generates region-specific meal plans based on your health goals, dietary preferences, and geographic location.

## 🌟 Features

### 🔐 User Authentication & Profile Management
- Comprehensive user profiles with health metrics
- Password reset functionality with email verification
- Profile customization for dietary preferences and health goals

### 🍽️ Intelligent Meal Plan Generation
 - **Personalized, gender-specific calorie calculation** using Mifflin-St Jeor equation (male/female BMR formulas)
 - **Regional cuisine support** with authentic local dishes
 - **Smart dietary filtering** (vegetarian/non-vegetarian)
 - **3-tier fallback system** ensuring meal plans are always generated
 - Integration with Edamam Recipe API for diverse meal options
 - **Meal distribution**: Breakfast 25%, Lunch 35%, Snack 10%, Dinner 30%

### 📊 Daily Nutrition Tracking
- Real-time calorie consumption monitoring
- Detailed macronutrient breakdown (protein, carbs, fats)
- Water intake tracking with goal setting
- Progress visualization with interactive charts
- Meal completion tracking with timestamps

### 🌍 Regional Cuisine Intelligence
Specialized support for authentic regional cuisines:
- **India**: North, South, East, West regions with traditional dishes
- **International**: Support for multiple countries and cuisines
- **Cultural dietary preferences** integration

### 📱 Modern Dashboard
- Personalized health metrics overview
- Today's meal plan preview with completion tracking
- Streak tracking and goal progress monitoring
- Responsive design for all devices

## 🆕 Recent Enhancements

- **Gender-specific BMR**: Updated maintenance calorie estimation to use Mifflin-St Jeor with male/female formulas for higher accuracy.
- **Real recipes in `/today`**: The `GET /api/mealplan/today` endpoint now uses the same full Edamam integration and fallback logic as `/generate`, eliminating placeholders.
- **Resilient fallbacks**: Strengthened 3-level query system and regional filtering for India (South, North, East, West).
- **Meal portioning**: Fixed distribution across the day for more consistent nutrition planning.

## 🏗️ Tech Stack

### Frontend
- **React 19** with **Vite** for fast development
- **TailwindCSS** for modern, responsive styling
- **Material-UI Icons** for consistent iconography
- **React Router** for seamless navigation
- **Context API** for efficient state management

### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** authentication system
- **bcrypt** for secure password hashing
- **Edamam Recipe API** integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Edamam API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dietplanner
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   ```

3. **Environment Setup**
   Create `backend/config.env` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EDAMAM_APP_ID=your_edamam_app_id
   EDAMAM_APP_KEY=your_edamam_app_key
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Start backend server (from backend directory)
   npm start
   
   # Start frontend development server (from root directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 📁 Project Structure

```
dietplanner/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages/routes
│   ├── context/           # React Context providers
│   ├── services/          # API service layer
│   └── assets/            # Static assets
├── backend/               # Backend Node.js application
│   ├── models/            # MongoDB data models
│   ├── routes/            # API route handlers
│   ├── middleware/        # Custom middleware
│   └── config.env         # Environment configuration
├── public/                # Public static files
└── package.json           # Project dependencies
```

## 🔌 API Endpoints

### Authentication (`/api/auth/`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /verify` - Token verification
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset confirmation

### Meal Plans (`/api/mealplan/`)
- Both `/generate` and `/today` use full Edamam API integration with regional filtering and fallbacks.
- `POST /generate` - Generate personalized meal plan
- `GET /today` - Get today's meal plan
- `POST /complete-meal` - Mark meal as completed

## 🎯 Usage Example

### User Profile Setup
```javascript
{
  "name": "Muthuraj D",
  "gender": "male",
  "age": 19,
  "height": 175,
  "weight": 65,
  "country": "india",
  "region": "south",
  "foodStyle": "nonveg",
  "healthGoals": "muscle-gain"
}
```

### Generated Meal Plan
```javascript
{
  "targetDailyCalories": 2803,
  "meals": [
    {
      "mealType": "breakfast",
      "name": "Egg Dosa with Coconut Chutney",
      "calories": 701,
      "macronutrients": {
        "protein": 35,
        "carbs": 88,
        "fats": 16
      }
    }
    // ... more meals
  ]
}
```

## 🌟 Key Features in Detail

### Regional Cuisine Intelligence
- **South India**: Dosa, Idli, Sambar, Chicken Chettinad
- **North India**: Paratha, Dal Makhani, Butter Chicken
- **East India**: Fish Curry, Khichdi, Luchi
- **West India**: Dhokla, Undhiyu, Pav Bhaji

### Smart Calorie Calculation
- Uses Mifflin-St Jeor equation for accurate BMR calculation
- Adjusts calories based on health goals:
  - Weight Loss: 85% of maintenance
  - Muscle Gain: 115% of maintenance
  - Maintenance: 100% of maintenance

### Robust Error Handling
- 3-tier fallback system for recipe fetching
- Graceful degradation when external APIs fail
- Comprehensive error logging and user feedback

## 🛠️ Troubleshooting

- **Seeing placeholder meal names?** Clear any old placeholder data and restart the backend:
  ```bash
  # from the backend directory
  node clear-meal-plans.js
  npm start
  ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Edamam API](https://developer.edamam.com/) for recipe data
- [TailwindCSS](https://tailwindcss.com/) for styling framework
- [React](https://reactjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework

---

**NutriFlow** - Your personalized journey to better nutrition starts here! 🌱
