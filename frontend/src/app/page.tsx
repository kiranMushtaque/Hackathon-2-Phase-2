'use client';

import { useState, useEffect, useMemo } from 'react';
import { authService } from '@/lib/auth';
import { apiClient, type Task, type User } from '@/lib/api';
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  LogOut,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  CheckCircle2,
  Circle,
  ListTodo,
  BarChart3,
  User as UserIcon,
  Loader2,
} from 'lucide-react';

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'newest' | 'oldest' | 'title';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Edit state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Filter, search, sort state
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authService.getAuthSession();
        if (session) {
          setUser(session);
          await fetchTasks(session.id);
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    checkSession();
  }, []);

  const fetchTasks = async (userId: number) => {
    setLoading(true);
    try {
      setError(null);
      const data = await apiClient.getTasks(userId);
      setTasks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filter === 'active') {
      result = result.filter(task => !task.completed);
    } else if (filter === 'completed') {
      result = result.filter(task => task.completed);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, searchQuery, filter, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, completionRate };
  }, [tasks]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      await fetchTasks(loggedInUser.id);
      setEmail('');
      setPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const registeredUser = await authService.register(email, password, name);
      setUser(registeredUser);
      await fetchTasks(registeredUser.id);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setTasks([]);
    setError(null);
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading || !user) return;

    setLoading(true);
    try {
      setError(null);
      const newTask = await apiClient.createTask(user.id, { title, description: description || undefined });
      setTasks([...tasks, newTask]);
      setTitle('');
      setDescription('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add task';
      setError(message);
      console.error('Error adding task:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (loading || !user) return;

    setLoading(true);
    try {
      setError(null);
      await apiClient.deleteTask(user.id, taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      setError(message);
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (taskId: number, completed: boolean) => {
    if (loading || !user) return;

    setLoading(true);
    try {
      setError(null);
      const updatedTask = await apiClient.updateTaskCompletion(user.id, taskId, !completed);
      setTasks(tasks.map(task => (task.id === taskId ? updatedTask : task)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit task functions
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const saveEdit = async (taskId: number) => {
    if (!editTitle.trim() || loading || !user) return;

    setLoading(true);
    try {
      setError(null);
      const updatedTask = await apiClient.updateTask(user.id, taskId, {
        title: editTitle,
        description: editDescription || undefined,
      });
      setTasks(tasks.map(task => (task.id === taskId ? updatedTask : task)));
      cancelEditing();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      setError(message);
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <Loader2 className="w-5 h-5 animate-spin" />
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <span className="text-white text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl">
              <ListTodo className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-center text-gray-500 mb-6">
            {isRegistering ? 'Sign up to start managing your tasks' : 'Sign in to your account'}
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2">
              <X className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>
            )}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>{isRegistering ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-200"
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl">
              <ListTodo className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Task Manager
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-2 rounded-xl">
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span className="text-slate-700 text-sm font-medium">{user.name || user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl font-medium transition-all duration-200"
              disabled={loading}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2">
            <X className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4 hover:text-red-900" />
            </button>
          </div>
        )}

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                <p className="text-xs text-slate-500">Total Tasks</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Circle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.active}</p>
                <p className="text-xs text-slate-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.completed}</p>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.completionRate}%</p>
                <p className="text-xs text-slate-500">Complete Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Task Form */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
            <Plus className="w-5 h-5 text-indigo-500" />
            <span>Add New Task</span>
          </h2>
          <form onSubmit={addTask} className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              maxLength={255}
              required
              disabled={loading}
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={2}
              maxLength={1000}
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading || !title.trim()}
            >
              {loading ? <LoadingSpinner /> : <Plus className="w-5 h-5" />}
              <span>Add Task</span>
            </button>
          </form>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-500">Status:</span>
                <div className="flex space-x-1">
                  {(['all', 'active', 'completed'] as FilterType[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filter === f
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-500">Sort:</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSortBy('newest')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      sortBy === 'newest' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <SortDesc className="w-4 h-4" />
                    <span>Newest</span>
                  </button>
                  <button
                    onClick={() => setSortBy('oldest')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      sortBy === 'oldest' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <SortAsc className="w-4 h-4" />
                    <span>Oldest</span>
                  </button>
                  <button
                    onClick={() => setSortBy('title')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      sortBy === 'title' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    A-Z
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {filter === 'all' ? 'All Tasks' : filter === 'active' ? 'Active Tasks' : 'Completed Tasks'}
              <span className="ml-2 text-sm font-normal text-slate-500">({filteredTasks.length})</span>
            </h2>
          </div>

          {loading && tasks.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-100 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ListTodo className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">No tasks found</h3>
              <p className="text-slate-500">
                {searchQuery ? 'Try a different search term' : 'Add a new task to get started!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`bg-white rounded-xl p-4 shadow-sm border border-slate-100 transition-all duration-200 hover:shadow-md ${
                    task.completed ? 'opacity-75' : ''
                  }`}
                >
                  {editingTaskId === task.id ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        maxLength={255}
                        autoFocus
                      />
                      <textarea
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows={2}
                        maxLength={1000}
                        placeholder="Description (optional)"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveEdit(task.id)}
                          disabled={loading || !editTitle.trim()}
                          className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                        >
                          {loading ? <LoadingSpinner /> : <Check className="w-4 h-4" />}
                          <span>Save</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleComplete(task.id, task.completed)}
                        disabled={loading}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          task.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-slate-300 hover:border-indigo-400'
                        } disabled:opacity-50`}
                      >
                        {task.completed && <Check className="w-4 h-4" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-lg font-medium ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`mt-1 text-sm ${task.completed ? 'text-slate-400' : 'text-slate-500'}`}>
                            {task.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-slate-400">
                          Created {new Date(task.created_at).toLocaleDateString()} at{' '}
                          {new Date(task.created_at).toLocaleTimeString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startEditing(task)}
                          disabled={loading}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                          title="Edit task"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          disabled={loading}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Loading indicator for existing tasks */}
          {loading && tasks.length > 0 && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
        <p>Task Manager - Phase II Hackathon Project</p>
      </footer>
    </div>
  );
}
