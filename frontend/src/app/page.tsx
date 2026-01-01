




"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { authService } from "@/lib/auth";
import { apiClient, type Task, type User } from "@/lib/api";
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
  ChevronRight,
  Clock,
  TrendingUp,
  MoreVertical,
  Sun,
  Moon,
  Bell,
  Calendar,
  Tag,
  Star,
  Sparkles,
  Target,
  Zap,
  Shield,
  Cloud,
  BatteryCharging,
  Mic,
  MicOff,
  AlertCircle,
  Timer,
  Flag,
  RefreshCw,
} from "lucide-react";

type FilterType = "all" | "active" | "completed" | "starred" | "priority";
type SortType = "newest" | "oldest" | "title" | "priority";
type Theme = "light" | "dark" | "system";
type Priority = "low" | "medium" | "high";

// Speech Recognition types for browser compatibility
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// Enhanced Task interface
interface EnhancedTask extends Task {
  starred?: boolean;
  priority?: Priority;
  tags?: string[];
  dueDate?: string;
}

// Custom icon component for flame
const FlameIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
    />
  </svg>
);

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    message: 'Task "Project Presentation" due tomorrow',
    time: "2 hours ago",
  },
  { id: 2, message: "Welcome to Task Manager Pro!", time: "1 day ago" },
  { id: 3, message: "Your productivity increased by 24%", time: "2 days ago" },
];

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [showNotifications, setShowNotifications] = useState(false);
  const [taskPriority, setTaskPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  // Voice recognition state - REAL IMPLEMENTATION
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Edit state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [currentEditTag, setCurrentEditTag] = useState("");

  // Filter, search, sort state
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Refs
  const taskInputRef = useRef<HTMLInputElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Theme management - Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Theme management - Apply theme to document and save to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // REAL Voice recognition - Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if speech recognition is available
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setVoiceSupported(false);
      return;
    }

    setVoiceSupported(true);

    // Create recognition instance
    const recognition = new SpeechRecognitionClass() as SpeechRecognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(null);
    };

    recognition.onresult = (event: unknown) => {
      const speechEvent = event as SpeechRecognitionEvent;
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = speechEvent.resultIndex; i < speechEvent.results.length; i++) {
        const result = speechEvent.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        setTitle(finalTranscript);
      } else if (interimTranscript) {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event: unknown) => {
      const errorEvent = event as SpeechRecognitionErrorEvent;
      console.error("Speech recognition error:", errorEvent.error);
      setIsListening(false);

      if (errorEvent.error === "not-allowed") {
        setVoiceError("Microphone access denied. Please allow microphone access.");
      } else if (errorEvent.error === "no-speech") {
        setVoiceError("No speech detected. Please try again.");
      } else {
        setVoiceError(`Voice error: ${errorEvent.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Real voice input handler
  const handleVoiceInput = () => {
    if (!voiceSupported) {
      alert(
        "Voice input is not supported in your browser. Please use Chrome or Edge."
      );
      return;
    }

    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Start listening
      setTranscript("");
      setVoiceError(null);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setVoiceError("Failed to start voice input. Please try again.");
      }
    }
  };

  // Add tag
  const addTag = useCallback(() => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags((prev) => [...prev, currentTag.trim()]);
      setCurrentTag("");
    }
  }, [currentTag, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }, []);

  // Add edit tag
  const addEditTag = useCallback(() => {
    if (currentEditTag.trim() && !editTags.includes(currentEditTag.trim())) {
      setEditTags((prev) => [...prev, currentEditTag.trim()]);
      setCurrentEditTag("");
    }
  }, [currentEditTag, editTags]);

  const removeEditTag = useCallback((tagToRemove: string) => {
    setEditTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authService.getAuthSession();
        if (session) {
          setUser(session);
          await fetchTasks(session.id);
        }
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setTimeout(() => setInitialLoading(false), 800);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const fetchTasks = async (userId: number) => {
    setLoading(true);
    try {
      setError(null);
      const data = await apiClient.getTasks(userId);
      // Map backend data to frontend EnhancedTask format
      const enhancedData: EnhancedTask[] = data.map((task) => ({
        ...task,
        starred: task.starred ?? false,
        priority: (task.priority as Priority) ?? "medium",
        tags: task.tags ?? [],
        dueDate: task.due_date ?? undefined,
      }));
      setTasks(enhancedData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch tasks";
      setError(message);
      console.error("Error fetching tasks:", err);
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
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description &&
            task.description.toLowerCase().includes(query)) ||
          (task.tags &&
            task.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    // Apply status filter
    if (filter === "active") {
      result = result.filter((task) => !task.completed);
    } else if (filter === "completed") {
      result = result.filter((task) => task.completed);
    } else if (filter === "starred") {
      result = result.filter((task) => task.starred);
    } else if (filter === "priority") {
      result = result.filter((task) => task.priority === "high");
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority || "medium"];
          const bPriority = priorityOrder[b.priority || "medium"];
          return bPriority - aPriority;
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, searchQuery, filter, sortBy]);

  // Enhanced Stats with Priority Counts
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    const starred = tasks.filter((t) => t.starred).length;
    const highPriority = tasks.filter((t) => t.priority === "high").length;
    const mediumPriority = tasks.filter((t) => t.priority === "medium").length;
    const lowPriority = tasks.filter((t) => t.priority === "low").length;

    const productivityScore =
      total > 0
        ? Math.min(
            100,
            Math.round(
              ((completed + starred * 2 + highPriority * 3) / total) * 100
            )
          )
        : 0;

    return {
      total,
      completed,
      active,
      completionRate,
      starred,
      highPriority,
      mediumPriority,
      lowPriority,
      productivityScore,
    };
  }, [tasks]);

  // Mock streak data
  const streak = useMemo(
    () => ({
      current: 7,
      longest: 21,
      totalCompleted: 134,
    }),
    []
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      await fetchTasks(loggedInUser.id);
      setEmail("");
      setPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      console.error("Login failed:", err);
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
      setEmail("");
      setPassword("");
      setName("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      console.error("Registration failed:", err);
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

  // Enhanced add task with tags and due date
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading || !user) return;

    setLoading(true);
    try {
      setError(null);
      const newTask = await apiClient.createTask(user.id, {
        title,
        description: description || undefined,
        priority: taskPriority,
        starred: false,
        tags: tags.length > 0 ? tags : undefined,
        due_date: dueDate || undefined,
      });

      const enhancedTask: EnhancedTask = {
        ...newTask,
        starred: newTask.starred ?? false,
        priority: (newTask.priority as Priority) ?? taskPriority,
        tags: newTask.tags ?? tags,
        dueDate: newTask.due_date ?? (dueDate || undefined),
      };

      setTasks([...tasks, enhancedTask]);
      setTitle("");
      setDescription("");
      setTaskPriority("medium");
      setDueDate("");
      setTags([]);
      setTranscript("");

      if (statsRef.current) {
        statsRef.current.classList.add("animate-pulse");
        setTimeout(
          () => statsRef.current?.classList.remove("animate-pulse"),
          500
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add task";
      setError(message);
      console.error("Error adding task:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (loading || !user) return;

    if (!confirm("Are you sure you want to delete this task?")) return;

    setLoading(true);
    try {
      setError(null);
      await apiClient.deleteTask(user.id, taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete task";
      setError(message);
      console.error("Error deleting task:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (taskId: number, completed: boolean) => {
    if (loading || !user) return;

    setLoading(true);
    try {
      setError(null);
      const updatedTask = await apiClient.updateTaskCompletion(
        user.id,
        taskId,
        !completed
      );
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? {
            ...task,
            ...updatedTask,
            priority: (updatedTask.priority as Priority) ?? task.priority,
            starred: updatedTask.starred ?? task.starred,
            tags: updatedTask.tags ?? task.tags,
            dueDate: updatedTask.due_date ?? task.dueDate,
          } : task
        )
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update task";
      setError(message);
      console.error("Error updating task:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = async (taskId: number) => {
    if (loading || !user) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStarred = !task.starred;

    // Optimistic update
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, starred: newStarred } : t
      )
    );

    try {
      await apiClient.updateTask(user.id, taskId, { starred: newStarred });
    } catch (err) {
      // Revert on error
      setTasks(
        tasks.map((t) =>
          t.id === taskId ? { ...t, starred: task.starred } : t
        )
      );
      const message = err instanceof Error ? err.message : "Failed to update task";
      setError(message);
      console.error("Error updating task:", err);
    }
  };

  // Enhanced edit task functions
  const startEditing = (task: EnhancedTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority || "medium");
    setEditDueDate(task.dueDate || "");
    setEditTags(task.tags || []);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
    setEditPriority("medium");
    setEditDueDate("");
    setEditTags([]);
    setCurrentEditTag("");
  };

  const saveEdit = async (taskId: number) => {
    if (!editTitle.trim() || loading || !user) return;

    setLoading(true);
    try {
      setError(null);
      const updatedTask = await apiClient.updateTask(user.id, taskId, {
        title: editTitle,
        description: editDescription || undefined,
        priority: editPriority,
        starred: tasks.find((t) => t.id === taskId)?.starred,
        tags: editTags.length > 0 ? editTags : undefined,
        due_date: editDueDate || undefined,
      });

      setTasks(
        tasks.map((task) =>
          task.id === taskId
            ? {
                ...updatedTask,
                starred: updatedTask.starred ?? task.starred,
                priority: (updatedTask.priority as Priority) ?? editPriority,
                tags: updatedTask.tags ?? editTags,
                dueDate: updatedTask.due_date ?? (editDueDate || undefined),
              }
            : task
        )
      );
      cancelEditing();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update task";
      setError(message);
      console.error("Error updating task:", err);
    } finally {
      setLoading(false);
    }
  };

  // Bulk operations
  const deleteCompletedTasks = async () => {
    if (loading || !user) return;

    const completedTasks = tasks.filter((task) => task.completed);
    if (completedTasks.length === 0) return;

    if (!confirm(`Delete ${completedTasks.length} completed tasks?`)) return;

    setLoading(true);
    try {
      setError(null);
      // Delete all completed tasks
      for (const task of completedTasks) {
        await apiClient.deleteTask(user.id, task.id);
      }
      setTasks(tasks.filter((task) => !task.completed));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete completed tasks";
      setError(message);
      console.error("Error deleting completed tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsComplete = async () => {
    if (loading || !user) return;

    setLoading(true);
    try {
      setError(null);
      const incompleteTasks = tasks.filter((task) => !task.completed);
      for (const task of incompleteTasks) {
        await apiClient.updateTaskCompletion(user.id, task.id, true);
      }
      setTasks(tasks.map((task) => ({ ...task, completed: true })));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to mark all as complete";
      setError(message);
      console.error("Error marking all as complete:", err);
    } finally {
      setLoading(false);
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => <Loader2 className="w-5 h-5 animate-spin" />;

  // SIMPLIFIED Navbar items - Only essential ones
  const navItems = [
    { name: "Dashboard", icon: <ListTodo className="w-5 h-5" />, active: true },
    { name: "Tasks", icon: <CheckCircle2 className="w-5 h-5" /> },
    { name: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-12 flex flex-col items-center space-y-6 border border-white/10 shadow-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-lg animate-spin-slow"></div>
              <Sparkles className="w-16 h-16 text-white relative z-10 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                TaskFlow Pro
              </h1>
              <p className="text-white/60 text-sm">Loading your workspace...</p>
            </div>
            <div className="w-48 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-white/80 to-white/40 animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-500 hover:scale-[1.01] border border-white/20 dark:border-gray-700/50">
            {/* Logo and Title */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-lg"></div>
                <div className="relative bg-gradient-to-br from-cyan-600 to-purple-600 p-4 rounded-2xl shadow-2xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
                  TaskFlow Pro
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ultimate Productivity Suite
                </p>
              </div>
            </div>

            {/* Toggle between Login/Register */}
            <div className="flex mb-8 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
              <button
                onClick={() => setIsRegistering(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 ${
                  !isRegistering
                    ? "bg-white dark:bg-gray-800 shadow-lg text-cyan-600 dark:text-cyan-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsRegistering(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 ${
                  isRegistering
                    ? "bg-white dark:bg-gray-800 shadow-lg text-purple-600 dark:text-purple-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-center space-x-3 animate-fade-in">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                  <X className="w-4 h-4" />
                </div>
                <span className="flex-1">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="hover:opacity-70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form
              onSubmit={isRegistering ? handleRegister : handleLogin}
              className="space-y-4"
            >
              {isRegistering && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full relative overflow-hidden group"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl group-hover:from-cyan-600 group-hover:to-purple-600 transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-cyan-600 to-purple-600 group-hover:from-cyan-700 group-hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform group-hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      <span>
                        {isRegistering
                          ? "Creating Account..."
                          : "Signing In..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isRegistering ? "Create Account" : "Sign In"}
                      </span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <Shield className="w-5 h-5 text-cyan-500 mx-auto" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Secure
                  </p>
                </div>
                <div className="space-y-1">
                  <Zap className="w-5 h-5 text-purple-500 mx-auto" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Fast
                  </p>
                </div>
                <div className="space-y-1">
                  <Cloud className="w-5 h-5 text-pink-500 mx-auto" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sync
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      {/* Simplified Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border-b border-slate-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur"></div>
                <div className="relative bg-gradient-to-br from-cyan-600 to-purple-600 p-2 rounded-xl shadow-lg">
                  <ListTodo className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
                  TaskFlow Pro
                </h1>
                <p className="text-xs text-slate-500 dark:text-gray-400 hidden sm:block">
                  Productivity Redefined
                </p>
              </div>
            </div>

            {/* Center: Navigation Items (Desktop) */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    item.active
                      ? "bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 text-cyan-600 dark:text-cyan-400"
                      : "text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    // Simple navigation - just change active state
                    navItems.forEach((nav) => (nav.active = false));
                    item.active = true;
                    // In a real app, you would navigate to different pages here
                  }}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-2">
              {/* Voice Control Button */}
              {voiceSupported && (
                <button
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isListening
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse"
                      : "bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600"
                  }`}
                  title={isListening ? "Stop listening" : "Voice input - Click to speak"}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Simple Theme Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    theme === "light"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-amber-600"
                      : "hover:bg-white/50 dark:hover:bg-gray-600/50 text-slate-500 dark:text-gray-400"
                  }`}
                  title="Light theme"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    theme === "dark"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-indigo-400"
                      : "hover:bg-white/50 dark:hover:bg-gray-600/50 text-slate-500 dark:text-gray-400"
                  }`}
                  title="Dark theme"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

              {/* Notifications - SIMPLIFIED */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl relative transition-colors"
                >
                  <Bell className="w-5 h-5 text-slate-600 dark:text-gray-300" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowNotifications(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 animate-slide-down">
                      <div className="p-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          Notifications
                        </h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                        >
                          Close
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {mockNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-4 hover:bg-slate-50 dark:hover:bg-gray-700/50 border-b border-slate-100 dark:border-gray-700 last:border-0 transition-colors"
                          >
                            <p className="text-sm text-slate-700 dark:text-gray-300">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3 bg-slate-100 dark:bg-gray-700 rounded-xl px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name?.[0]?.toUpperCase() ||
                      user.email[0].toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Pro User
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-gray-600 rounded-lg transition-colors group"
                  disabled={loading}
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4 text-slate-500 dark:text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Voice Input Indicator */}
      {isListening && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
              <Mic className="w-6 h-6 relative animate-pulse" />
            </div>
            <div>
              <p className="font-medium">Listening...</p>
              <p className="text-sm opacity-90">
                {transcript || "Speak now"}
              </p>
            </div>
            <button
              onClick={() => recognitionRef.current?.stop()}
              className="ml-4 p-1 hover:bg-white/20 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Voice Error Display */}
      {voiceError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-3">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-medium">Voice Error</p>
              <p className="text-sm opacity-90">{voiceError}</p>
            </div>
            <button
              onClick={() => setVoiceError(null)}
              className="ml-4 p-1 hover:bg-white/20 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Dashboard */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Productivity Score */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats.productivityScore}</p>
            <p className="text-sm opacity-90">Productivity Score</p>
            <div className="mt-4 w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-1000"
                style={{ width: `${stats.productivityScore}%` }}
              ></div>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <Flag className="w-8 h-8 opacity-80" />
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">High Priority</span>
                <span className="font-bold">{stats.highPriority}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Medium Priority</span>
                <span className="font-bold">{stats.mediumPriority}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Priority</span>
                <span className="font-bold">{stats.lowPriority}</span>
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 opacity-80" />
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold mb-1">{stats.completionRate}%</p>
            <p className="text-sm opacity-90">Completion Rate</p>
            <div className="mt-4 flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Excellent progress!</span>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <FlameIcon className="w-8 h-8 opacity-80" />
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold mb-1">{streak.current} days</p>
            <p className="text-sm opacity-90">Current Streak</p>
            <div className="mt-4 flex items-center space-x-2">
              <Timer className="w-4 h-4" />
              <span className="text-xs">Longest: {streak.longest} days</span>
            </div>
          </div>
        </div>

        {/* Simple Bulk Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-slate-200/50 dark:border-gray-700/50">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={markAllAsComplete}
              disabled={
                loading || tasks.filter((t) => !t.completed).length === 0
              }
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Mark All Complete</span>
            </button>

            <button
              onClick={deleteCompletedTasks}
              disabled={
                loading || tasks.filter((t) => t.completed).length === 0
              }
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Completed</span>
            </button>

            <button
              onClick={() => fetchTasks(user.id)}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh Tasks</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Add Task */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Add Task Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-slate-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-cyan-500 to-purple-500 p-2 rounded-lg">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                      Create New Task
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                      Add a task to your workflow
                    </p>
                  </div>
                </div>

                {/* Voice Control Button */}
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isListening
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse"
                        : "bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600"
                    }`}
                    title={isListening ? "Stop listening" : "Voice input - Click to speak"}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>

              <form onSubmit={addTask} className="space-y-4">
                {/* Voice Transcript Preview */}
                {transcript && (
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                    <p className="text-sm text-cyan-700 dark:text-cyan-300">
                      <span className="font-medium">Voice input:</span>{" "}
                      {transcript}
                    </p>
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                  <input
                    ref={taskInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your next achievement?"
                    className="relative w-full px-5 py-4 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm placeholder-slate-400 dark:placeholder-gray-500 text-lg"
                    maxLength={255}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Priority Selection - SIMPLIFIED */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                      Priority Level
                    </label>
                    <div className="flex space-x-2">
                      {(["low", "medium", "high"] as Priority[]).map(
                        (priority) => (
                          <button
                            key={priority}
                            type="button"
                            onClick={() => setTaskPriority(priority)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                              taskPriority === priority
                                ? priority === "high"
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                                  : priority === "medium"
                                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                                : "bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600"
                            }`}
                          >
                            {priority.charAt(0).toUpperCase() +
                              priority.slice(1)}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                      Due Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  {/* Tags Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                      Tags (Optional)
                    </label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && (e.preventDefault(), addTag())
                          }
                          placeholder="Add tag..."
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addTag}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tags Display */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded-full text-sm"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-cyan-900 dark:hover:text-cyan-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add detailed description, notes, or requirements..."
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all duration-300 resize-none placeholder-slate-400 dark:placeholder-gray-500"
                  rows={3}
                  maxLength={1000}
                  disabled={loading}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 relative overflow-hidden group"
                    disabled={loading || !title.trim()}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative bg-gradient-to-r from-cyan-600 to-purple-600 group-hover:from-cyan-700 group-hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3">
                      {loading ? (
                        <>
                          <LoadingSpinner />
                          <span>Creating Task...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          <span>Add Task</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-slate-200/50 dark:border-gray-700/50">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search */}
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks..."
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm placeholder-slate-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl border transition-all duration-300 ${
                    showFilters
                      ? "bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400"
                      : "border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform duration-300 ${
                      showFilters ? "rotate-90" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-700 space-y-6 animate-slide-down">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3">
                      Status Filter
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          "all",
                          "active",
                          "completed",
                          "starred",
                          "priority",
                        ] as FilterType[]
                      ).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                            filter === f
                              ? f === "starred"
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                : f === "priority"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                                : "bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800"
                              : "bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {f === "starred" && <Star className="w-4 h-4" />}
                          {f === "priority" && <Flag className="w-4 h-4" />}
                          <span>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3">
                      Sort Tasks
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <button
                        onClick={() => setSortBy("newest")}
                        className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                          sortBy === "newest"
                            ? "bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800"
                            : "bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        <SortDesc className="w-4 h-4" />
                        <span>Newest</span>
                      </button>
                      <button
                        onClick={() => setSortBy("oldest")}
                        className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                          sortBy === "oldest"
                            ? "bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800"
                            : "bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        <SortAsc className="w-4 h-4" />
                        <span>Oldest</span>
                      </button>
                      <button
                        onClick={() => setSortBy("title")}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                          sortBy === "title"
                            ? "bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800"
                            : "bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        A → Z
                      </button>
                      <button
                        onClick={() => setSortBy("priority")}
                        className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                          sortBy === "priority"
                            ? "bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800"
                            : "bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        <Target className="w-4 h-4" />
                        <span>Priority</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Task List */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    {filter === "all"
                      ? "All Tasks"
                      : filter === "active"
                      ? "Active Tasks"
                      : filter === "completed"
                      ? "Completed Tasks"
                      : filter === "starred"
                      ? "Starred Tasks"
                      : "High Priority Tasks"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400">
                    {filteredTasks.length} tasks found
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>
              </div>

              {loading && tasks.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl border border-slate-200/50 dark:border-gray-700/50 text-center">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur"></div>
                    <Loader2 className="w-12 h-12 text-cyan-500 animate-spin relative" />
                  </div>
                  <p className="mt-4 text-slate-500 dark:text-gray-400">
                    Loading your tasks...
                  </p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl border border-slate-200/50 dark:border-gray-700/50 text-center">
                  <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ListTodo className="w-10 h-10 text-slate-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-white mb-2">
                    No tasks found
                  </h3>
                  <p className="text-slate-500 dark:text-gray-400 mb-6">
                    {searchQuery
                      ? "Try a different search term"
                      : "Create your first task to begin!"}
                  </p>
                  <button
                    onClick={() => taskInputRef.current?.focus()}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create New Task</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-gray-700/50 transition-all duration-500 hover:shadow-2xl hover:border-cyan-200 dark:hover:border-cyan-800 hover:scale-[1.005] ${
                        task.completed ? "opacity-75" : ""
                      }`}
                    >
                      {editingTaskId === task.id ? (
                        /* Edit Mode */
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent text-lg font-medium"
                              maxLength={255}
                              autoFocus
                            />
                          </div>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 resize-none placeholder-slate-400 dark:placeholder-gray-500"
                            rows={3}
                            maxLength={1000}
                            placeholder="Description (optional)"
                          />
                          <div className="flex flex-wrap gap-3">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                                Priority
                              </label>
                              <div className="flex space-x-2">
                                {(["low", "medium", "high"] as const).map(
                                  (priority) => (
                                    <button
                                      key={priority}
                                      type="button"
                                      onClick={() => setEditPriority(priority)}
                                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                                        editPriority === priority
                                          ? priority === "high"
                                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                                            : priority === "medium"
                                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                                          : "bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600"
                                      }`}
                                    >
                                      {priority.charAt(0).toUpperCase() +
                                        priority.slice(1)}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => saveEdit(task.id)}
                                disabled={loading || !editTitle.trim()}
                                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
                              >
                                {loading ? (
                                  <LoadingSpinner />
                                ) : (
                                  <Check className="w-5 h-5" />
                                )}
                                <span>Save Changes</span>
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="flex items-center space-x-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-300 px-6 py-3 rounded-xl font-medium transition-all duration-300"
                              >
                                <X className="w-5 h-5" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="flex items-start space-x-4">
                          {/* Checkbox */}
                          <button
                            onClick={() =>
                              toggleComplete(task.id, task.completed)
                            }
                            disabled={loading}
                            className={`relative flex-shrink-0 w-6 h-6 mt-1 rounded-lg border-2 flex items-center justify-center transition-all duration-300 group/checkbox ${
                              task.completed
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 border-green-500"
                                : "border-slate-300 dark:border-gray-600 hover:border-cyan-400 dark:hover:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                            } disabled:opacity-50`}
                          >
                            {task.completed && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg opacity-0 group-hover/checkbox:opacity-100 transition-opacity"></div>
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-3">
                                  <h3
                                    className={`text-lg font-semibold ${
                                      task.completed
                                        ? "line-through text-slate-400 dark:text-gray-500"
                                        : "text-slate-800 dark:text-white"
                                    }`}
                                  >
                                    {task.title}
                                  </h3>
                                  {task.priority === "high" && (
                                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-lg">
                                      High
                                    </span>
                                  )}
                                  {task.priority === "medium" && (
                                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-lg">
                                      Medium
                                    </span>
                                  )}
                                  {task.priority === "low" && (
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-lg">
                                      Low
                                    </span>
                                  )}
                                </div>
                                {task.description && (
                                  <p
                                    className={`mt-2 text-slate-600 dark:text-gray-400 ${
                                      task.completed ? "opacity-60" : ""
                                    }`}
                                  >
                                    {task.description}
                                  </p>
                                )}
                                {task.tags && task.tags.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {task.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs rounded-full"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => toggleStar(task.id)}
                                className={`p-1.5 rounded-lg transition-all duration-300 ${
                                  task.starred
                                    ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20"
                                    : "text-slate-400 dark:text-gray-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                }`}
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    task.starred ? "fill-current" : ""
                                  }`}
                                />
                              </button>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1 text-slate-500 dark:text-gray-500 text-sm">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {new Date(
                                      task.created_at
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                {task.dueDate && (
                                  <div className="flex items-center space-x-1 text-slate-500 dark:text-gray-500 text-sm">
                                    <Timer className="w-4 h-4" />
                                    <span>
                                      Due:{" "}
                                      {new Date(
                                        task.dueDate
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => startEditing(task)}
                                  disabled={loading}
                                  className="p-2 text-slate-400 dark:text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-all duration-300 disabled:opacity-50 group/edit"
                                  title="Edit task"
                                >
                                  <Edit3 className="w-4 h-4 group-hover/edit:scale-110 transition-transform" />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  disabled={loading}
                                  className="p-2 text-slate-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 disabled:opacity-50 group/delete"
                                  title="Delete task"
                                >
                                  <Trash2 className="w-4 h-4 group-hover/delete:scale-110 transition-transform" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Loading indicator for existing tasks */}
              {loading && tasks.length > 0 && (
                <div className="mt-6 flex items-center justify-center space-x-3 text-slate-500 dark:text-gray-400">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur"></div>
                    <Loader2 className="w-5 h-5 animate-spin relative" />
                  </div>
                  <span className="text-sm font-medium">Updating tasks...</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-slate-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">
                Quick Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-lg">
                      <ListTodo className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span className="text-slate-700 dark:text-gray-300">
                      Total Tasks
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">
                    {stats.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-slate-700 dark:text-gray-300">
                      Completed
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">
                    {stats.completed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-lg">
                      <Star className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <span className="text-slate-700 dark:text-gray-300">
                      Starred
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">
                    {stats.starred}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                      <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-slate-700 dark:text-gray-300">
                      High Priority
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">
                    {stats.highPriority}
                  </span>
                </div>
              </div>
            </div>

            {/* Productivity Tips */}
            <div className="bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="w-6 h-6" />
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Productivity Tip</h3>
              <p className="text-sm opacity-90 mb-4">
                Break down large tasks into smaller, actionable items to
                increase completion rates by up to 40%.
              </p>
              <button
                onClick={() => taskInputRef.current?.focus()}
                className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Task</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-slate-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => taskInputRef.current?.focus()}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                >
                  <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-lg">
                    <Plus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <span className="text-slate-700 dark:text-gray-300">
                    Quick Add Task
                  </span>
                </button>
                <button
                  onClick={() => setFilter("priority")}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                >
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                    <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-slate-700 dark:text-gray-300">
                    View High Priority
                  </span>
                </button>
                <button
                  onClick={() => setFilter("starred")}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                >
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                    <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-slate-700 dark:text-gray-300">
                    View Starred
                  </span>
                </button>
                <button
                  onClick={markAllAsComplete}
                  disabled={
                    loading || tasks.filter((t) => !t.completed).length === 0
                  }
                  className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors disabled:opacity-50"
                >
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-slate-700 dark:text-gray-300">
                    Complete All
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-12 border-t border-slate-200/50 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">
                TaskFlow Pro
              </p>
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Simple & Powerful Task Management
              </p>
            </div>
          </div>
          <div className="text-center md:text-right text-sm text-slate-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} TaskFlow Pro</p>
            <p className="mt-1">
              Built by{" "}
              <span className="font-medium text-slate-700 dark:text-gray-300">
                Kiran Mushtaque
              </span>{" "}
              • Hackathon Project
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}







