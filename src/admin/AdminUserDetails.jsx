import React, { useEffect, useState } from 'react';
import { RefreshCcw, Edit3, Trash2 } from 'lucide-react';

const defaultForm = {
  name: '',
  email: '',
  age: '',
  height: '',
  weight: '',
  gender: '',
  foodStyle: '',
  healthGoals: '',
  country: '',
  region: '',
};

const AdminUserDetails = ({ user, loading, onUpdate, onRefresh, onDelete }) => {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
        gender: user.gender || '',
        foodStyle: user.foodStyle || '',
        healthGoals: user.healthGoals || '',
        country: user.country || '',
        region: user.region || '',
      });
    } else {
      setForm(defaultForm);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
        Select a user to view full details.
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdate(form);
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-emerald-50 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-[0.3em] font-semibold">User Profile</p>
          <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition"
            disabled={loading}
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 transition"
            disabled={loading}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-gray-500">Role</p>
          <p className="font-semibold text-gray-900">{user.role || 'Health Enthusiast'}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-gray-500">Joined</p>
          <p className="font-semibold text-gray-900">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-gray-500">Country</p>
          <p className="font-semibold text-gray-900">{user.country || '—'}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-gray-500">Region</p>
          <p className="font-semibold text-gray-900">{user.region || '—'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Edit3 size={16} />
          Edit details
        </div>
        {[
          { label: 'Name', name: 'name', type: 'text' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Age', name: 'age', type: 'number' },
          { label: 'Height (cm)', name: 'height', type: 'number' },
          { label: 'Weight (kg)', name: 'weight', type: 'number' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Food Style</label>
            <select
              name="foodStyle"
              value={form.foodStyle}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            >
              <option value="">Select preference</option>
              <option value="veg">Vegetarian</option>
              <option value="nonveg">Non-Vegetarian</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Health Goal</label>
            <select
              name="healthGoals"
              value={form.healthGoals}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            >
              <option value="">Select goal</option>
              <option value="weight-loss">Weight loss</option>
              <option value="muscle-gain">Muscle gain</option>
              <option value="maintenance">Maintenance</option>
              <option value="general-health">General health</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Region</label>
            <input
              type="text"
              name="region"
              value={form.region}
              onChange={handleChange}
              className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              placeholder="e.g., south, north"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition disabled:opacity-50"
        >
          Save changes
        </button>
      </form>
    </div>
  );
};

export default AdminUserDetails;

