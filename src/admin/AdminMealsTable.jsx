import React, { useMemo, useState } from 'react';
import { Clock3, Edit3, Flame, Save, Trash2 } from 'lucide-react';

const emptyMealForm = {
  name: '',
  mealType: 'breakfast',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  completed: false,
};

const AdminMealsTable = ({ mealPlans = [], loading, onUpdateMeal, onDeleteMeal }) => {
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [form, setForm] = useState(emptyMealForm);

  const latestMealPlan = useMemo(() => {
    if (!mealPlans.length) return null;
    return mealPlans[0];
  }, [mealPlans]);

  const handleEditClick = (planId, meal) => {
    setEditingMeal({ planId, mealId: meal._id });
    setForm({
      name: meal.name || '',
      mealType: meal.mealType || 'breakfast',
      calories: meal.calories || '',
      protein: meal.macronutrients?.protein || '',
      carbs: meal.macronutrients?.carbs || '',
      fats: meal.macronutrients?.fats || '',
      completed: Boolean(meal.completed),
    });
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editingMeal) return;
    await onUpdateMeal(editingMeal.planId, editingMeal.mealId, {
      name: form.name,
      mealType: form.mealType,
      calories: Number(form.calories),
      macronutrients: {
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fats: Number(form.fats),
      },
      completed: form.completed,
    });
    setEditingMeal(null);
    setForm(emptyMealForm);
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-gray-100 p-6 bg-white space-y-4">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!mealPlans.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 p-6 text-center text-gray-500 bg-white">
        Meal and nutrition data will appear here once this user generates plans.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {latestMealPlan && (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-[0.3em]">Latest plan</p>
              <h3 className="text-2xl font-semibold text-gray-900">
                {new Date(latestMealPlan.date).toLocaleDateString()}
              </h3>
              <p className="text-sm text-gray-500">
                {latestMealPlan.meals.length} meals · {latestMealPlan.summary?.totalCalories || 0} kcal target
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 text-emerald-700 px-6 py-3 flex items-center gap-2 font-semibold">
              <Flame size={18} />
              {latestMealPlan.targetDailyCalories} kcal goal
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {mealPlans.map((plan) => {
          const isExpanded = expandedPlanId === plan._id;
          return (
            <div key={plan._id} className="rounded-3xl border border-gray-100 bg-white overflow-hidden">
              <button
                onClick={() => setExpandedPlanId(isExpanded ? null : plan._id)}
                className={`w-full flex items-center justify-between px-6 py-4 text-left transition ${
                  isExpanded ? 'bg-emerald-50' : 'bg-white hover:bg-emerald-50/50'
                }`}
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-500">
                    {new Date(plan.date).toLocaleDateString()} · {plan.meals.length} meals
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {plan.summary?.totalCalories || 0} kcal · {plan.summary?.protein || 0}P /{' '}
                    {plan.summary?.carbs || 0}C / {plan.summary?.fats || 0}F
                  </p>
                </div>
                <Clock3 className={`text-emerald-500 transition ${isExpanded ? 'rotate-180' : ''}`} size={20} />
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 space-y-4 bg-white">
                  {plan.meals.map((meal) => (
                    <div
                      key={meal._id}
                      className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-gray-500 font-semibold">
                          {meal.mealType}
                        </p>
                        <h4 className="text-lg font-semibold text-gray-900">{meal.name}</h4>
                        <p className="text-sm text-gray-600">
                          {meal.calories} kcal · {meal.macronutrients?.protein || 0}P /{' '}
                          {meal.macronutrients?.carbs || 0}C / {meal.macronutrients?.fats || 0}F
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(plan._id, meal)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteMeal(plan._id, meal._id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingMeal && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-lg space-y-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <Edit3 size={16} />
            Edit meal entry
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Meal Type</label>
              <select
                name="mealType"
                value={form.mealType}
                onChange={handleFormChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snack">Snack</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Calories</label>
              <input
                type="number"
                name="calories"
                value={form.calories}
                onChange={handleFormChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Protein (g)</label>
              <input
                type="number"
                name="protein"
                value={form.protein}
                onChange={handleFormChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Carbs (g)</label>
              <input
                type="number"
                name="carbs"
                value={form.carbs}
                onChange={handleFormChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fats (g)</label>
              <input
                type="number"
                name="fats"
                value={form.fats}
                onChange={handleFormChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Meal Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="completed"
              checked={form.completed}
              onChange={handleFormChange}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            Mark as completed
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition"
            >
              <Save size={16} />
              Save meal
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingMeal(null);
                setForm(emptyMealForm);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminMealsTable;

