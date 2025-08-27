import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Edit2, Trash2, Check, X, Calendar, Clock } from 'lucide-react';

const Tasks = () => {
  // Task/Notes state
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Load tasks from localStorage
  const loadTasks = () => {
    try {
      const savedTasks = localStorage.getItem('nutriflow_tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Save tasks to localStorage
  const saveTasks = (tasksToSave) => {
    try {
      localStorage.setItem('nutriflow_tasks', JSON.stringify(tasksToSave));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  // Task management functions
  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      const updatedTasks = [...tasks, task];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setNewTask('');
    }
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const toggleTask = (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditText(task.text);
  };

  const saveEdit = () => {
    if (editText.trim()) {
      const updatedTasks = tasks.map(task => 
        task.id === editingTask ? { ...task, text: editText.trim() } : task
      );
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    }
    setEditingTask(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditText('');
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <CheckSquare className="w-8 h-8 text-emerald-600" />
          My Tasks & Notes
        </h1>
        <p className="text-gray-600">Organize your daily tasks and keep track of important notes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
              <p className="text-3xl font-bold text-emerald-600">{completedTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
              <p className="text-3xl font-bold text-orange-600">{pendingTasks.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Section */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Task</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, addTask)}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
          />
          <button
            onClick={addTask}
            disabled={!newTask.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-6">
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Pending Tasks ({pendingTasks.length})
            </h2>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-emerald-500 flex items-center justify-center transition-colors"
                  >
                  </button>
                  
                  {editingTask === task.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        className="text-emerald-600 hover:text-emerald-700 p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{task.text}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created {formatDate(task.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(task)}
                          className="text-gray-400 hover:text-emerald-600 p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              Completed Tasks ({completedTasks.length})
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-500 text-white flex items-center justify-center transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  
                  <div className="flex-1">
                    <p className="text-gray-600 line-through font-medium">{task.text}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Created {formatDate(task.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first task above to get organized!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
