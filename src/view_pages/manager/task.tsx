import React, { useState } from 'react';
import Sidebar from "../../components/sidebarLayout"; // <-- import Sidebar
import TopNavbar from "../../components/topbarLayouot";
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Calendar, User, Clock, AlertCircle, CheckCircle, Pause, Play } from 'lucide-react';

// ✅ Define allowed status keys
type StatusKey = 'all' | 'completed' | 'on-progress' | 'on-hold' | 'pending';

const TaskManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<StatusKey>('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const navigate = useNavigate();

  const tasks = [
    {
      id: 1,
      title: "Design Homepage Layout",
      description: "Create wireframes and mockups for the new homepage design",
      status: "completed",
      priority: "high",
      assignee: "Sarah Chen",
      dueDate: "2024-03-15",
      project: "Website Redesign",
      tags: ["design", "ui/ux"],
      progress: 100
    },
    {
      id: 2,
      title: "Implement User Authentication",
      description: "Set up login/logout functionality with JWT tokens",
      status: "on-progress",
      priority: "high",
      assignee: "Mike Johnson",
      dueDate: "2024-03-20",
      project: "Backend Development",
      tags: ["development", "security"],
      progress: 65
    },
    {
      id: 3,
      title: "Database Migration",
      description: "Migrate from MySQL to PostgreSQL for better performance",
      status: "on-hold",
      priority: "medium",
      assignee: "Alex Rivera",
      dueDate: "2024-03-25",
      project: "Infrastructure",
      tags: ["database", "migration"],
      progress: 30
    },
    {
      id: 4,
      title: "Write API Documentation",
      description: "Document all REST API endpoints with examples",
      status: "pending",
      priority: "low",
      assignee: "Emma Davis",
      dueDate: "2024-03-30",
      project: "Documentation",
      tags: ["documentation", "api"],
      progress: 0
    },
    {
      id: 5,
      title: "Mobile App Testing",
      description: "Comprehensive testing across iOS and Android devices",
      status: "on-progress",
      priority: "high",
      assignee: "John Wayne",
      dueDate: "2024-03-18",
      project: "Mobile Development",
      tags: ["testing", "mobile"],
      progress: 45
    },
    {
      id: 6,
      title: "Performance Optimization",
      description: "Optimize database queries and reduce page load times",
      status: "completed",
      priority: "medium",
      assignee: "Lisa Park",
      dueDate: "2024-03-12",
      project: "Performance",
      tags: ["optimization", "performance"],
      progress: 100
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'on-progress': return <Play className="w-4 h-4 text-blue-500" />;
      case 'on-hold': return <Pause className="w-4 h-4 text-orange-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on-progress': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    return task.status === activeFilter;
  });

  // ✅ Status counts typed with StatusKey
  const statusCounts: Record<StatusKey, number> = {
    all: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    'on-progress': tasks.filter(t => t.status === 'on-progress').length,
    'on-hold': tasks.filter(t => t.status === 'on-hold').length,
    pending: tasks.filter(t => t.status === 'pending').length,
  };

  // ✅ Filters typed
  const filters: { key: StatusKey; label: string }[] = [
    { key: 'all', label: 'All Tasks' },
    { key: 'completed', label: 'Completed' },
    { key: 'on-progress', label: 'In Progress' },
    { key: 'on-hold', label: 'On Hold' },
    { key: 'pending', label: 'Pending' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ✅ Full width Top Navbar fixed */}
      <div className="w-full fixed top-0 left-0 z-100">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
      </div>

      {/* ✅ Push content down so it's not hidden under navbar */}
      <div className="pt-16 px-5 w-full p-7">
        {/* ✅ Reusable Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Header */}
        <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mt-8">
            <div>
            <h2 className="text-2xl font-semibold text-gray-800">Task</h2>
            <p className="text-gray-600 mt-1">Manage and track your team's tasks</p>
            </div>
            <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filter
            </button>
            <button onClick={() => navigate("/create")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4"/>
                New Task
            </button>
            </div>
        </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts['on-progress']}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col mb-6">
        {/* Search Bar */}
        <div className="flex-1">
            <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
                type="text"
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            </div>
        </div>

        {/* View Mode Buttons */}
        <div className="flex gap-2 mt-3">
            <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-md ${
                viewMode === 'list'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            >
            List View
            </button>
            <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-2 rounded-md ${
                viewMode === 'board'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            >
            Board View
            </button>
        </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {filters.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeFilter === filter.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {filter.label} ({statusCounts[filter.key]})
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(task.priority)} p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(task.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{task.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{task.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Project:</span>
                      <span>{task.project}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {task.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="ml-6 text-right">
                  <div className="text-sm text-gray-500 mb-2">Progress</div>
                  <div className="w-32">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TaskManagement;
