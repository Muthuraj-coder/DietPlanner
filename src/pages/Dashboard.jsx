import React, { useState, useEffect } from 'react';
import { Home, Calendar, CheckSquare, Newspaper, User, Scale, Target, Droplet, Zap, Clock, MapPin, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const NutriFlowDashboard = () => {
  const [currentWeight, setCurrentWeight] = useState(65);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);
  const [streakDays, setStreakDays] = useState(12);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [todayMealPlan, setTodayMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetCalories, setTargetCalories] = useState(2000);

  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's meal plan on component mount
  useEffect(() => {
    fetchTodayMealPlan();
  }, []);

  const fetchTodayMealPlan = async () => {
    try {
      setLoading(true);
      const response = await api.getTodayMealPlan();
      setTodayMealPlan(response.mealPlan);
      setCaloriesConsumed(response.consumedCalories || 0);
      setTargetCalories(response.mealPlan.targetDailyCalories || 2000);
    } catch (error) {
      console.error('Error fetching today\'s meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: Home, active: true, path: '/dashboard' },
    { name: 'Meal Plans', icon: Calendar, path: '/meal-plans' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Health News', icon: Newspaper, path: '/news' },
    { name: 'Profile', icon: User, path: '/profile' }
  ];

  const topNavItems = ['Dashboard', 'Meal Plans', 'Tasks', 'Health News'];

  // Get meals from today's meal plan or use default
  const meals = todayMealPlan ? todayMealPlan.meals.map(meal => ({
    type: meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1),
    name: meal.name,
    description: meal.ingredients.slice(0, 3).join(', '),
    time: getMealTime(meal.mealType),
    calories: meal.calories,
    image: meal.image || getDefaultMealImage(meal.mealType),
    completed: meal.completed || false,
    mealType: meal.mealType
  })) : [];

  function getMealTime(mealType) {
    const times = {
      breakfast: '8:00 AM',
      lunch: '1:00 PM',
      snack: '4:00 PM',
      dinner: '7:00 PM'
    };
    return times[mealType] || '12:00 PM';
  }

  function getDefaultMealImage(mealType) {
    const images = {
      breakfast: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=300&h=200&fit=crop',
      lunch: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
      snack: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
      dinner: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop'
    };
    return images[mealType] || images.lunch;
  }

  const handleMealComplete = async (meal) => {
    try {
      if (meal.completed) return; // Already completed
      
      const response = await api.completeMeal(meal.mealType);
      setCaloriesConsumed(response.consumedCalories);
      
      // Update the meal plan state
      setTodayMealPlan(prev => ({
        ...prev,
        meals: prev.meals.map(m => 
          m.mealType === meal.mealType 
            ? { ...m, completed: true, completedAt: new Date() }
            : m
        )
      }));
    } catch (error) {
      console.error('Error completing meal:', error);
    }
  };

  const handleWaterIntake = () => {
    if (waterIntake < 8) {
      setWaterIntake(prev => prev + 1);
    }
  };

  const handleNavClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
    setActiveTab(item.name);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const caloriePercentage = (caloriesConsumed / targetCalories) * 100;
  const waterPercentage = (waterIntake / 8) * 100;

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">NutriFlow</h1>
            </div>
            
                         {/* Top Navigation - Improved styling */}
             <nav className="hidden md:flex space-x-1">
               {topNavItems.map((item) => (
                 <button
                   key={item}
                   onClick={() => setActiveTab(item)}
                   className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                     activeTab === item 
                       ? 'bg-emerald-600 text-white shadow-md' 
                       : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700'
                   }`}
                 >
                   {item}
                 </button>
               ))}
             </nav>
            
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {getUserInitials(user?.name)}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Improved styling */}
          <div className="w-72 space-y-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {getUserInitials(user?.name)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{user?.name || 'Demo User'}</h3>
                <p className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full inline-block">
                  {user?.role || 'Health Enthusiast'}
                </p>
              </div>
            </div>

                         {/* Sidebar Navigation - Much better styling */}
             <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
               <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 px-2">
                 Navigation
               </h4>
               <nav className="space-y-2">
                 {navItems.map((item) => {
                   const Icon = item.icon;
                   return (
                     <button
                       key={item.name}
                       onClick={() => handleNavClick(item)}
                       className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                         activeTab === item.name
                           ? 'bg-emerald-600 text-white shadow-md transform scale-105'
                           : 'bg-gray-100 text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent'
                       }`}
                     >
                       <Icon className={`w-5 h-5 ${
                         activeTab === item.name ? 'text-white' : 'text-gray-600'
                       }`} />
                       <span className="font-semibold">{item.name}</span>
                     </button>
                   );
                 })}
               </nav>
             </div>

            {/* Quick Stats Sidebar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Today's Progress
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Calories</span>
                  <span className="text-sm font-semibold text-gray-900">{caloriesConsumed.toLocaleString()}/{targetCalories.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Water</span>
                  <span className="text-sm font-semibold text-gray-900">{waterIntake}/8 glasses</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${waterPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
              <h2 className="text-4xl font-bold mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'Demo'}! 👋
              </h2>
              <p className="text-emerald-100 text-lg">Here's your health journey overview for today</p>
            </div>

            {/* Stats Cards - Improved layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Weight Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Current Weight</p>
                    <p className="text-3xl font-bold text-gray-900">{currentWeight} kg</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Scale className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-emerald-600 font-semibold">↓ -0.5 kg this week</span>
                </div>
              </div>

              {/* Calories Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Calories Today</p>
                    <p className="text-3xl font-bold text-gray-900">{caloriesConsumed.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Goal: {targetCalories.toLocaleString()} cal</span>
                    <span className="font-semibold">{Math.round(caloriePercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Water Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Water Intake</p>
                    <p className="text-3xl font-bold text-gray-900">{waterIntake}/8</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Droplet className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-sm text-blue-600 mb-3 font-medium">
                    ● {8 - waterIntake} glasses remaining
                  </div>
                  <button
                    onClick={handleWaterIntake}
                    disabled={waterIntake >= 8}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 rounded-xl text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                  >
                    {waterIntake >= 8 ? 'Goal Reached! 🎉' : 'Add Glass'}
                  </button>
                </div>
              </div>

              {/* Streak Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Streak</p>
                    <p className="text-3xl font-bold text-gray-900">{streakDays} days</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="text-sm text-emerald-600 font-semibold">
                  🔥 Keep it up!
                </div>
              </div>
            </div>

            {/* Today's Meal Plan - Improved styling */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Today's Meal Plan</h3>
                  <p className="text-gray-600">Track your daily nutrition and stay on target</p>
                </div>
                <button 
                  onClick={() => navigate('/meal-plans')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md"
                >
                  View Full Plan
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : meals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {meals.map((meal, index) => (
                    <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow border border-gray-100">
                      <div className="relative mb-4">
                        <img
                          src={meal.image}
                          alt={meal.name}
                          className="w-full h-32 object-cover rounded-xl"
                          onError={(e) => {
                            e.target.src = getDefaultMealImage(meal.mealType);
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                          {meal.type}
                        </div>
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {meal.calories} cal
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{meal.name}</h4>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">{meal.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center bg-white px-2 py-1 rounded-lg">
                          <Clock className="w-3 h-3 mr-1 text-emerald-500" />
                          <span className="font-medium text-xs">{meal.time}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleMealComplete(meal)}
                        disabled={meal.completed}
                        className={`w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          meal.completed
                            ? 'bg-emerald-500 text-white shadow-lg cursor-default'
                            : 'bg-gray-200 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 hover:shadow-md'
                        }`}
                      >
                        {meal.completed ? '✓ Completed' : 'Mark Complete'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No meal plan available for today</p>
                  <button 
                    onClick={() => navigate('/meal-plans')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Generate Meal Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutriFlowDashboard;