import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  Newspaper, 
  User, 
  Edit3, 
  Save, 
  X, 
  Mail, 
  Calendar as CalendarIcon, 
  Ruler, 
  Utensils, 
  MapPin, 
  Bell,
  Eye,
  Target,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editData, setEditData] = useState({});
  
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', icon: Home, active: true, path: '/dashboard' },
    { name: 'Meal Plans', icon: Calendar, path: '/meal-plans' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Health News', icon: Newspaper, path: '/news' },
    { name: 'Profile', icon: User, path: '/profile' }
  ];

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
        gender: user.gender || '',
        foodStyle: user.foodStyle || 'veg',
        country: user.country || '',
        region: user.region || '',
        notifications: user.notifications || { email: true },
        privacy: user.privacy || { profileVisible: false },
        healthGoals: user.healthGoals || 'general-health'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setEditData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: checked
          }
        }));
      } else {
        setEditData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setEditData(prev => ({ ...prev, [name]: value }));
    }
    setError("");
    setSuccess("");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: user.name || '',
      email: user.email || '',
      age: user.age || '',
      height: user.height || '',
      weight: user.weight || '',
      gender: user.gender || '',
      foodStyle: user.foodStyle || 'veg',
      country: user.country || '',
      region: user.region || '',
      notifications: user.notifications || { email: true },
      privacy: user.privacy || { profileVisible: false },
      healthGoals: user.healthGoals || 'general-health'
    });
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateProfile(editData);
      
      if (result.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCountryName = (countryCode) => {
    const countries = {
      'india': 'India',
      'usa': 'United States',
      'uk': 'United Kingdom',
      'canada': 'Canada',
      'australia': 'Australia',
      'germany': 'Germany',
      'france': 'France',
      'japan': 'Japan',
      'china': 'China',
      'brazil': 'Brazil',
      'mexico': 'Mexico',
      'other': 'Other'
    };
    return countries[countryCode] || countryCode;
  };

  const getRegionName = (regionCode) => {
    const regions = {
      'north': 'North',
      'south': 'South',
      'east': 'East',
      'west': 'West',
      'central': 'Central',
      'northeast': 'Northeast',
      'northwest': 'Northwest',
      'southeast': 'Southeast',
      'southwest': 'Southwest',
      'no-preference': 'No specific preference'
    };
    return regions[regionCode] || regionCode;
  };

  const getHealthGoalName = (goalCode) => {
    const goals = {
      'weight-loss': 'Weight Loss',
      'muscle-gain': 'Muscle Gain',
      'maintenance': 'Maintenance',
      'general-health': 'General Health'
    };
    return goals[goalCode] || goalCode;
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
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/meal-plans')}
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700"
              >
                Meal Plans
              </button>
              <button 
                onClick={() => navigate('/tasks')}
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700"
              >
                Tasks
              </button>
              <button 
                onClick={() => navigate('/news')}
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700"
              >
                Health News
              </button>
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
                        item.name === 'Profile'
                          ? 'bg-emerald-600 text-white shadow-md transform scale-105'
                          : 'bg-gray-100 text-gray-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${
                        item.name === 'Profile' ? 'text-white' : 'text-gray-600'
                      }`} />
                      <span className="font-semibold">{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h2>
                  <p className="text-gray-600">Manage your personal information and preferences</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-1" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900">{user?.name || 'Not specified'}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-1" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900">{user?.email || 'Not specified'}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="inline w-4 h-4 mr-1" />
                    Age
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="age"
                      value={editData.age}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      min="1"
                      max="120"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900">{user?.age ? `${user.age} years` : 'Not specified'}</p>
                  )}
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Ruler className="inline w-4 h-4 mr-1" />
                    Height
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="height"
                      value={editData.height}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      min="100"
                      max="250"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900">{user?.height ? `${user.height} cm` : 'Not specified'}</p>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Ruler className="inline w-4 h-4 mr-1" />
                    Weight
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="weight"
                      value={editData.weight}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      min="20"
                      max="300"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900">{user?.weight ? `${user.weight} kg` : 'Not specified'}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-1" />
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={editData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      disabled={loading}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{user?.gender ? (user.gender === 'male' ? 'Male' : 'Female') : 'Not specified'}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Country
                  </label>
                  {isEditing ? (
                    <select
                      name="country"
                      value={editData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      disabled={loading}
                    >
                      <option value="">Select your country</option>
                      <option value="india">India</option>
                      <option value="usa">United States</option>
                      <option value="uk">United Kingdom</option>
                      <option value="canada">Canada</option>
                      <option value="australia">Australia</option>
                      <option value="germany">Germany</option>
                      <option value="france">France</option>
                      <option value="japan">Japan</option>
                      <option value="china">China</option>
                      <option value="brazil">Brazil</option>
                      <option value="mexico">Mexico</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{user?.country ? getCountryName(user.country) : 'Not specified'}</p>
                  )}
                </div>

                {/* Region */}
                {user?.country && user.country !== 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Regional Preference
                    </label>
                    {isEditing ? (
                      <select
                        name="region"
                        value={editData.region}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={loading}
                      >
                        <option value="">Select your regional preference</option>
                        <option value="north">North</option>
                        <option value="south">South</option>
                        <option value="east">East</option>
                        <option value="west">West</option>
                        <option value="central">Central</option>
                        <option value="northeast">Northeast</option>
                        <option value="northwest">Northwest</option>
                        <option value="southeast">Southeast</option>
                        <option value="southwest">Southwest</option>
                        <option value="no-preference">No specific preference</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{user?.region ? getRegionName(user.region) : 'Not specified'}</p>
                    )}
                  </div>
                )}

                {/* Health Goals */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="inline w-4 h-4 mr-1" />
                    Health Goals
                  </label>
                  {isEditing ? (
                    <select
                      name="healthGoals"
                      value={editData.healthGoals}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      disabled={loading}
                    >
                      <option value="weight-loss">Weight Loss</option>
                      <option value="muscle-gain">Muscle Gain</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="general-health">General Health</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{user?.healthGoals ? getHealthGoalName(user.healthGoals) : 'Not specified'}</p>
                  )}
                </div>

                {/* Join Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="inline w-4 h-4 mr-1" />
                    Member Since
                  </label>
                  <p className="text-gray-900">{formatDate(user?.joinDate)}</p>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h3>
              
              <div className="space-y-4">
                {/* Notifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Bell className="inline w-4 h-4 mr-1" />
                    Email Notifications
                  </label>
                  {isEditing ? (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="notifications.email"
                        checked={editData.notifications?.email || false}
                        onChange={handleChange}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        disabled={loading}
                      />
                      <span className="ml-2 text-sm text-gray-700">Receive email notifications</span>
                    </label>
                  ) : (
                    <p className="text-gray-900">{user?.notifications?.email ? 'Enabled' : 'Disabled'}</p>
                  )}
                </div>

                {/* Privacy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Eye className="inline w-4 h-4 mr-1" />
                    Profile Visibility
                  </label>
                  {isEditing ? (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="privacy.profileVisible"
                        checked={editData.privacy?.profileVisible || false}
                        onChange={handleChange}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        disabled={loading}
                      />
                      <span className="ml-2 text-sm text-gray-700">Make profile visible to other users</span>
                    </label>
                  ) : (
                    <p className="text-gray-900">{user?.privacy?.profileVisible ? 'Public' : 'Private'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 