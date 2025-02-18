import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import Login from './components/Login';
import { getUserProfile } from './services/userService';
import { UserData } from './types/user';
import Quiz from './Quiz'; // Corrected import path
import Submit from './Submit'; // Corrected import path
import { 
  LayoutDashboard, 
  Bell, 
  Search,
  TrendingUp,
  DollarSign,
  Calendar,
  Menu,
  ChevronRight,
  Activity,
  LogOut,
  FileEdit,
  Upload,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

function App() {
  const [loading, setLoading] = useState(true);
  // State management
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('Student');
  const [profilePic, setProfilePic] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignments, setAssignments] = useState<{ name: string; due: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Reference for scrolling to sections
  const statsRef = useRef<HTMLDivElement>(null);
  const assignmentsRef = useRef<HTMLDivElement>(null);
  const subjectsRef = useRef<HTMLDivElement>(null);
  const activitiesRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
      // Add a highlight animation
      ref.current.classList.add('highlight-section');
      setTimeout(() => {
        ref.current?.classList.remove('highlight-section');
      }, 2000);
    }
  };

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUsername(user.displayName?.split(' ')[0] || 'Student');
        setProfilePic(user.photoURL || '');
      } else {
        setIsAuthenticated(false);
        setUsername('Student');
        setProfilePic('');
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Separate effect for loading user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || !auth.currentUser) return;
      
      try {
        const profile = await getUserProfile(auth.currentUser.uid);
        if (profile) {
          setUserData(profile);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [isAuthenticated]);

  // Dashboard data
  const stats = [
    { 
      title: 'Questions Asked', 
      value: '156', 
      icon: FileEdit, 
      change: '+23 this week', 
      color: 'bg-indigo-500' 
    },
    { 
      title: 'Accuracy Rate', 
      value: '92%', 
      icon: TrendingUp, 
      change: '+5% improvement', 
      color: 'bg-emerald-500' 
    },
    { 
      title: 'Topics Mastered', 
      value: '12', 
      icon: Activity, 
      change: '3 new topics', 
      color: 'bg-purple-500' 
    },
    { 
      title: 'Learning Streak', 
      value: '7d', 
      icon: Calendar, 
      change: 'Personal best!', 
      color: 'bg-pink-500' 
    }
  ];

  const areaChartData = [
    { name: 'Mon', value: 24 },
    { name: 'Tue', value: 31 },
    { name: 'Wed', value: 28 },
    { name: 'Thu', value: 35 },
    { name: 'Fri', value: 42 },
    { name: 'Sat', value: 18 },
    { name: 'Sun', value: 15 }
  ];

  const barChartData = [
    { name: 'Math', value: 85 },
    { name: 'Science', value: 78 },
    { name: 'History', value: 92 },
    { name: 'English', value: 88 }
  ];

  const performanceData = [
    { name: 'A Grade', value: 35 },
    { name: 'B Grade', value: 45 },
    { name: 'C Grade', value: 15 },
    { name: 'Below C', value: 5 }
  ];

  const pieChartData = [
    { name: 'Practice', value: 40 },
    { name: 'Quizzes', value: 35 },
    { name: 'Challenges', value: 25 }
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];

  // Task management
  const handleNewTaskClick = () => setIsModalOpen(true);
  const handleModalClose = () => {
    setIsModalOpen(false);
    setTaskName("");
    setDueDate("");
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName && dueDate) {
      const newAssignment = {
        name: taskName,
        due: `Due on: ${new Date(dueDate).toLocaleDateString()}`
      };
      setAssignments([...assignments, newAssignment]);
      handleModalClose();
    }
  };

  // Mobile menu handling
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Login onLogin={() => setIsAuthenticated(true)} />;
    }

    return (
      <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleMobileMenu} />
      )}

      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } fixed lg:relative bg-gray-800 h-full shadow-lg transition-all duration-300 border-r border-gray-700 z-50 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-8 w-8 text-indigo-500" />
              {isSidebarOpen && <span className="text-xl font-bold">XVAT.AI</span>}
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors hidden lg:block"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="space-y-1">
            {[
              { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
              { icon: FileEdit, label: 'Quiz', id: 'quiz' },
              { icon: Upload, label: 'Submit', id: 'submit' }
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center space-x-2 p-3 rounded-lg transition-colors w-full text-left ${
                  currentPage === item.id
                    ? 'bg-indigo-500 text-white' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center space-x-4">
            <img
              src={profilePic || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
              alt="Profile"
              className="h-10 w-10 rounded-full border-2 border-gray-700"
            />
            {isSidebarOpen && (
              <div>
                <p className="text-sm font-medium">{username}</p>
                <p className="text-xs text-gray-400">Student at SST</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="mt-4 w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-0">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors lg:hidden mr-2"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="relative">
                <div className="flex items-center bg-gray-700 rounded-lg px-4 py-2 w-full lg:w-64">
                  <Search className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.length > 0) {
                        // Perform search
                        const results = [
                          // Assignments
                          ...assignments.map(a => ({
                            ...a,
                            type: 'assignment',
                            searchType: 'Assignment',
                            icon: FileEdit
                          })),
                          // Stats
                          ...stats.map(s => ({
                            ...s,
                            type: 'stat',
                            searchType: 'Statistic',
                            icon: Activity
                          })),
                          // Subjects
                          ...barChartData.map(b => ({
                            ...b,
                            type: 'subject',
                            searchType: 'Subject Performance',
                            icon: TrendingUp
                          })),
                          // Activities
                          ...pieChartData.map(p => ({
                            ...p,
                            type: 'activity',
                            searchType: 'Learning Activity',
                            icon: Calendar
                          })),
                          // Add Quick Actions
                          {
                            name: 'New Task',
                            type: 'action',
                            searchType: 'Quick Action',
                            icon: FileEdit,
                            action: handleNewTaskClick
                          },
                          {
                            name: 'Take Quiz',
                            type: 'action',
                            searchType: 'Quick Action',
                            icon: FileEdit,
                            action: () => setCurrentPage('quiz')
                          },
                          {
                            name: 'Submit Document',
                            type: 'action',
                            searchType: 'Quick Action',
                            icon: Upload,
                            action: () => setCurrentPage('submit')
                          }
                        ].filter(item => {
                          const searchValue = e.target.value.toLowerCase();
                          return (
                            (('name' in item && item.name.toLowerCase().includes(searchValue)) || ('title' in item && item.title.toLowerCase().includes(searchValue))) ||
                            ('title' in item && item.title.toLowerCase().includes(searchValue)) ||
                            item.searchType?.toLowerCase().includes(searchValue)
                          );
                        });
                        setSearchResults(results);
                        setShowSearchResults(true);
                      } else {
                        setShowSearchResults(false);
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                    placeholder="Search assignments, stats..."
                    className="bg-transparent border-none focus:outline-none w-full text-gray-100 placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                      className="p-1 hover:bg-gray-600 rounded-full"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div 
                    className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50"
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking results
                  >
                    {searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center"
                            onClick={() => {
                              setCurrentPage('dashboard');
                              setShowSearchResults(false);
                              
                              // Handle different result types
                              switch(result.type) {
                                case 'assignment':
                                  setTimeout(() => scrollToSection(assignmentsRef), 100);
                                  break;
                                case 'stat':
                                  setTimeout(() => scrollToSection(statsRef), 100);
                                  break;
                                case 'subject':
                                  setTimeout(() => scrollToSection(subjectsRef), 100);
                                  break;
                                case 'activity':
                                  setTimeout(() => scrollToSection(activitiesRef), 100);
                                  break;
                                case 'action':
                                  result.action();
                                  break;
                              }
                            }}
                          >
                            <>
                              <result.icon className="h-4 w-4 mr-2 text-indigo-500" />
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {result.name || result.title}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {result.searchType}
                                  {result.due && ` • ${result.due}`}
                                  {result.value && ` • ${result.value}`}
                                  {result.type === 'action' && ' • Quick Action'}
                                </div>
                              </div>
                              {result.type === 'action' && (
                                <div className="ml-2 px-2 py-1 text-xs bg-indigo-500 text-white rounded">
                                  Run
                                </div>
                              )}
                            </>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-400">No results found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-full hover:bg-gray-700 transition-colors">
                <Bell className="h-6 w-6 text-gray-300" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {currentPage === 'dashboard' && (
          <main className="p-4 lg:p-6">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-100">Welcome back, {username}!</h1>
            <div className="flex flex-wrap gap-4 mt-4">
              <button 
                onClick={handleNewTaskClick}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                New Task
              </button>
              <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                Add to Calendar
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800 rounded-xl border border-gray-700 p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-500">
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-400">{stat.title}</h3>
                <p className="text-xl lg:text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
            {/* Current Assignments */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 lg:p-6">
              <h2 className="text-lg font-semibold mb-4">Current Assignments</h2>
              <div className="space-y-4">
                {assignments.map((assignment, index) => (
                  <div key={index} className="p-4 bg-gray-700 rounded-lg">
                    <div className="font-medium">{assignment.name}</div>
                    <div className="text-sm text-gray-400">{assignment.due}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Analytics */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 lg:p-6">
              <h2 className="text-lg font-semibold mb-4">Daily Questions</h2>
              <div className="h-60 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" label={{ value: 'Questions', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }} />
                    <Tooltip 
                      formatter={(value) => [`${value} questions`, 'Daily Activity']}
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Subject Performance */}
            <div ref={subjectsRef} className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-4 lg:p-6">
              <h2 className="text-lg font-semibold mb-4">Subject Performance</h2>
              <div className="h-60 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }} />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Performance']}
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Time Distribution */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 lg:p-6">
              <h2 className="text-lg font-semibold mb-4">Learning Activities</h2>
              <div className="h-60 lg:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {pieChartData.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-400">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        )}
        {currentPage === 'quiz' && <Quiz />}
        {currentPage === 'submit' && <Submit />}
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
            <form onSubmit={handleTaskSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-4 justify-end">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    );
  };

  return renderContent();
}

export default App;