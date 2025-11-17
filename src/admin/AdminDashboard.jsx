import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogOut, RefreshCcw, ShieldCheck, UsersRound } from 'lucide-react';
import adminApi from '../services/adminApi';
import AdminUserTable from './AdminUserTable';
import AdminUserDetails from './AdminUserDetails';
import AdminMealsTable from './AdminMealsTable';

const AdminDashboard = () => {
  const isAdminAuthenticated =
    typeof window !== 'undefined' && window.localStorage.getItem('isAdminAuthenticated') === 'true';

  const [users, setUsers] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = async (term = '') => {
    if (!isAdminAuthenticated) return;
    setListLoading(true);
    setError('');
    try {
      const response = await adminApi.getUsers(term);
      setUsers(response.users || []);

      if (selectedUserId && !(response.users || []).some((user) => user._id === selectedUserId)) {
        setSelectedUserId(null);
        setSelectedUserDetails(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load users');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      fetchUsers('');
      return;
    }

    const timeout = setTimeout(() => {
      fetchUsers(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleSelectUser = async (userId) => {
    if (!userId) return;
    if (userId === selectedUserId && selectedUserDetails) return;
    setSelectedUserId(userId);
    setDetailsLoading(true);
    setError('');

    try {
      const data = await adminApi.getUserDetails(userId);
      setSelectedUserDetails(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load user details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRefreshDetails = async () => {
    if (!selectedUserId) return;
    setDetailsLoading(true);
    try {
      const data = await adminApi.getUserDetails(selectedUserId);
      setSelectedUserDetails(data);
      setNotification('User details refreshed');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to refresh details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUpdateUser = async (updates) => {
    if (!selectedUserId || !updates) return;
    setDetailsLoading(true);
    setError('');
    try {
      const { user } = await adminApi.updateUser(selectedUserId, updates);
      setUsers((prev) => prev.map((item) => (item._id === user._id ? { ...item, ...user } : item)));
      setSelectedUserDetails((prev) => (prev ? { ...prev, user } : prev));
      setNotification('User information updated');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update user');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) return;
    const confirmation = window.confirm('Delete this user and all associated meal data?');
    if (!confirmation) return;

    setDetailsLoading(true);
    setError('');
    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      if (selectedUserId === userId) {
        setSelectedUserId(null);
        setSelectedUserDetails(null);
      }
      setNotification('User deleted successfully');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete user');
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateMealPlanState = (updatedPlan) => {
    setSelectedUserDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        mealPlans: prev.mealPlans.map((plan) => (plan._id === updatedPlan._id ? updatedPlan : plan)),
      };
    });
  };

  const handleUpdateMeal = async (mealPlanId, mealId, payload) => {
    if (!selectedUserId) return;
    setDetailsLoading(true);
    setError('');
    try {
      const { mealPlan } = await adminApi.updateMealEntry(selectedUserId, mealPlanId, mealId, payload);
      updateMealPlanState(mealPlan);
      setNotification('Meal entry updated');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update meal');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteMeal = async (mealPlanId, mealId) => {
    if (!selectedUserId) return;
    const confirmation = window.confirm('Delete this meal entry?');
    if (!confirmation) return;

    setDetailsLoading(true);
    setError('');
    try {
      const { mealPlan } = await adminApi.deleteMealEntry(selectedUserId, mealPlanId, mealId);
      updateMealPlanState(mealPlan);
      setNotification('Meal entry deleted');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete meal');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleLogout = () => {
    adminApi.clearAdminSession();
    window.location.replace('/adminlogin');
  };

  const activeUser = useMemo(() => selectedUserDetails?.user || null, [selectedUserDetails]);

  if (!isAdminAuthenticated) {
    return <Navigate to="/adminlogin" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold">
              <ShieldCheck size={16} />
              Admin Control Panel
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nutrition Admin Dashboard</h1>
              <p className="text-gray-600">
                Monitor users, adjust their profiles, and curate meal plans without impacting member experience.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchUsers(searchTerm)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-600 transition"
            >
              <RefreshCcw size={16} />
              Refresh list
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-900 text-white font-semibold shadow-lg hover:bg-gray-800 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-6">
          {(notification || error) && (
            <div
              className={`rounded-3xl border px-6 py-3 text-sm font-medium ${
                error
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {error || notification}
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg shadow-emerald-100/50">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-[0.3em]">Overview</p>
                <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full lg:w-72">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name or email"
                    className="w-full rounded-2xl border border-gray-200 pl-5 pr-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                  />
                </div>
                <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-2xl">
                  <UsersRound size={16} />
                  <span>{users.length} users</span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <AdminUserTable
                users={users}
                loading={listLoading}
                selectedUserId={selectedUserId}
                onSelectUser={handleSelectUser}
                onDeleteUser={handleDeleteUser}
              />
            </div>
          </div>

          {selectedUserId && (
            <div className="grid lg:grid-cols-3 gap-6">
              <AdminUserDetails
                user={activeUser}
                loading={detailsLoading}
                onUpdate={handleUpdateUser}
                onRefresh={handleRefreshDetails}
                onDelete={() => handleDeleteUser(selectedUserId)}
              />
              <div className="lg:col-span-2">
                <AdminMealsTable
                  mealPlans={selectedUserDetails?.mealPlans || []}
                  loading={detailsLoading}
                  onUpdateMeal={handleUpdateMeal}
                  onDeleteMeal={handleDeleteMeal}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

