import React from 'react';
import { CalendarClock, Trash2, UserCircle2 } from 'lucide-react';

const AdminUserTable = ({ users = [], loading, selectedUserId, onSelectUser, onDeleteUser }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-2xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
        No users found. Adjust your search or try refreshing the list.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => {
        const isActive = selectedUserId === user._id;
        return (
          <div
            key={user._id}
            className={`rounded-3xl border p-5 transition hover:border-emerald-400 ${
              isActive ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-100 bg-white'
            }`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                  {user.name?.charAt(0) || 'N'}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs font-medium text-gray-500">
                    {user.age && <span>Age: {user.age}</span>}
                    {user.gender && <span className="capitalize">{user.gender}</span>}
                    {user.foodStyle && <span>{user.foodStyle} diet</span>}
                    {user.healthGoals && <span>Goal: {user.healthGoals.replace('-', ' ')}</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                {user.latestMealPlan ? (
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600 flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-semibold text-gray-800">
                      <CalendarClock size={16} />
                      Latest plan
                    </div>
                    <div>
                      <p>{new Date(user.latestMealPlan.date).toLocaleDateString()}</p>
                      <p>{user.latestMealPlan.mealsCompleted}/{user.latestMealPlan.mealsScheduled} meals completed</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    No meal plans yet
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectUser(user._id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold transition ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <UserCircle2 size={16} />
                    View
                  </button>
                  <button
                    onClick={() => onDeleteUser(user._id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminUserTable;

