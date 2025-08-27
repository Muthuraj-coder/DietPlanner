import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ChefHat, UtensilsCrossed, Flame, Apple, Loader2, Clock, Calendar } from 'lucide-react';

const MealPlans = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);
  const [todayMealPlan, setTodayMealPlan] = useState(null);
  const [canGenerate, setCanGenerate] = useState(true);
  const [timeUntilNextGeneration, setTimeUntilNextGeneration] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  // Check for existing meal plan and generation eligibility on mount
  useEffect(() => {
    checkTodayMealPlan();
    const interval = setInterval(updateTimeUntilNext, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const checkTodayMealPlan = async () => {
    try {
      setInitialLoading(true);
      const response = await api.getTodayMealPlan();
      setTodayMealPlan(response.mealPlan);
      setPlan(response.mealPlan);
      
      // Check if meal plan was generated today
      const today = new Date().toDateString();
      const generatedDate = new Date(response.mealPlan.generatedAt).toDateString();
      const wasGeneratedToday = today === generatedDate;
      
      setCanGenerate(!wasGeneratedToday);
      updateTimeUntilNext();
    } catch (error) {
      console.error('Error checking today\'s meal plan:', error);
      setCanGenerate(true);
    } finally {
      setInitialLoading(false);
    }
  };

  const updateTimeUntilNext = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeLeft = tomorrow - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    setTimeUntilNextGeneration(`${hours}h ${minutes}m`);
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    
    setLoading(true);
    setError('');
    try {
      const profile = {
        name: user?.name,
        email: user?.email,
        age: user?.age,
        height: user?.height,
        weight: user?.weight,
        foodStyle: user?.foodStyle,
        country: user?.country,
        region: user?.region,
        healthGoals: user?.healthGoals,
      };

      // You can move these to env/server in production
      const edamam = {
        app_id: 'e4fffceb',
        app_key: 'aa80b8e41bd1f2f3e800b74b9da1596c'
      };

      const result = await api.generateMealPlan(profile, edamam);
      setPlan(result);
      setTodayMealPlan(result);
      setCanGenerate(false);
      updateTimeUntilNext();
    } catch (e) {
      setError(e.message || 'Failed to generate meal plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-emerald-600" />
            Personalized Meal Plan
          </h1>
          {todayMealPlan && (
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Generated: {new Date(todayMealPlan.generatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="text-right">
          <button
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
            className={`px-5 py-2 rounded-lg font-semibold transition-colors ${
              canGenerate && !loading
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </span>
            ) : canGenerate ? (
              'Generate Plan'
            ) : (
              'Plan Generated'
            )}
          </button>
          {!canGenerate && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Next generation in: {timeUntilNextGeneration}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {initialLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : plan ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-2">Daily Nutrition Summary</h2>
            <p className="text-gray-600 mb-2">Target Calories: {plan.targetDailyCalories} kcal</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50 rounded-lg text-emerald-700">
                <div className="text-sm">Calories</div>
                <div className="text-2xl font-bold">{plan.summary.totalCalories}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-blue-700">
                <div className="text-sm">Protein</div>
                <div className="text-2xl font-bold">{plan.summary.protein} g</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-yellow-700">
                <div className="text-sm">Carbs</div>
                <div className="text-2xl font-bold">{plan.summary.carbs} g</div>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg text-pink-700">
                <div className="text-sm">Fats</div>
                <div className="text-2xl font-bold">{plan.summary.fats} g</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {plan.meals.map((m, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{m.mealType.charAt(0).toUpperCase() + m.mealType.slice(1)}</h3>
                  <span className="text-sm font-semibold text-emerald-700">{m.calories} kcal</span>
                </div>
                <div className="text-xl font-semibold mb-2">{m.name}</div>
                {m.image && (
                  <img src={m.image} alt={m.name} className="w-full h-40 object-cover rounded-lg mb-3" />
                )}
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Ingredients</div>
                  <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                    {(m.ingredients || []).slice(0, 8).map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">Protein: {m.macronutrients.protein} g</span>
                  <span className="px-2 py-1 rounded bg-yellow-50 text-yellow-700">Carbs: {m.macronutrients.carbs} g</span>
                  <span className="px-2 py-1 rounded bg-pink-50 text-pink-700">Fats: {m.macronutrients.fats} g</span>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Source: <a className="underline" href={m.url} target="_blank" rel="noreferrer">{m.source}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Meal Plan Yet</h3>
          <p className="text-gray-500 mb-4">Generate your personalized daily meal plan to get started</p>
          {canGenerate && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Your First Plan'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MealPlans;


