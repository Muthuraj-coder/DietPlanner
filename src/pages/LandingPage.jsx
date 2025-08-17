import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Target, 
  Calendar, 
  Scale, 
  Droplet, 
  Globe, 
  Newspaper,
  Star,
  Play
} from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {

  const features = [
    {
      icon: Target,
      title: "Personalized Meal Plans",
      description: "AI-generated meal plans based on your age, height, dietary preferences, and regional food styles."
    },
    {
      icon: Scale,
      title: "Health & Weight Tracking",
      description: "Monitor weight, track calories, and maintain healthy habits with our intuitive dashboard."
    },
    {
      icon: Calendar,
      title: "Daily Meal Scheduling",
      description: "Plan breakfast, lunch, and dinner with nutritional info and completion tracking."
    },
    {
      icon: Droplet,
      title: "Hydration Monitoring",
      description: "Track daily water intake and build healthy hydration habits with streak tracking."
    },
    {
      icon: Globe,
      title: "Regional Food Preferences",
      description: "Choose from North, South, East, or West regional food styles for authentic meals."
    },
    {
      icon: Newspaper,
      title: "Health News & Updates",
      description: "Stay informed with the latest nutrition tips, health trends, and wellness advice."
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Fitness Enthusiast",
      content: "NutriFlow transformed my eating habits. The personalized meal plans are exactly what I needed to stay on track with my fitness goals.",
      rating: 5
    },
    {
      name: "Raj K.",
      role: "Health Conscious",
      content: "Love the regional food options! Finally, a diet planner that understands my cultural food preferences while keeping me healthy.",
      rating: 5
    },
    {
      name: "Emily T.",
      role: "Busy Professional",
      content: "The meal planning feature saves me hours every week. I love how it tracks my progress and keeps me motivated.",
      rating: 5
    }
  ];



  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">NutriFlow</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors nav-link">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition-colors nav-link">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-emerald-600 transition-colors nav-link">Reviews</a>
              <Link to="/login" className="text-gray-600 hover:text-emerald-600 transition-colors nav-link">Login</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/signup"
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-20 hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 hero-title">
              Your Personal
              <span className="text-emerald-600 block">Nutrition Coach</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your health journey with personalized meal plans, 
              smart nutrition tracking, and regional food preferences. 
              Achieve your health goals with our comprehensive diet planner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="bg-emerald-600 text-white px-8 py-4 rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg flex items-center cta-button"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="flex items-center text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 section-title">
              Everything You Need for Healthy Living
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines smart technology with nutrition science 
              to deliver personalized health solutions that work for you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow feature-card">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6 feature-icon">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white how-it-works-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 section-title">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              Your journey to better health starts here
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 step-number">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Your Profile</h3>
              <p className="text-gray-600">
                Tell us about your age, height, dietary preferences, and regional food style. 
                We'll use this to create your perfect nutrition plan.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 step-number">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Your Plan</h3>
              <p className="text-gray-600">
                Receive personalized meal plans with detailed nutritional information, 
                cooking instructions, and shopping lists tailored to your preferences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 step-number">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Track & Improve</h3>
              <p className="text-gray-600">
                Monitor your progress, track your nutrition, and build healthy habits 
                with our intuitive dashboard and progress tracking tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 section-title">
              Loved by Health Enthusiasts Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about their transformation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 testimonial-card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Start your health journey today with NutriFlow's 
            personalized nutrition guidance and meal planning tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="bg-white text-emerald-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className="text-white border-2 border-white px-8 py-4 rounded-lg hover:bg-white hover:text-emerald-600 transition-colors font-semibold text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
                <span className="text-2xl font-bold">NutriFlow</span>
              </div>
              <p className="text-gray-400">
                Your personal nutrition coach powered by AI technology.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Personalized Meal Plans</li>
                <li>Nutrition Tracking</li>
                <li>Regional Preferences</li>
                <li>Health Monitoring</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Support</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Community</li>
                <li>Blog</li>
                <li>Newsletter</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NutriFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
