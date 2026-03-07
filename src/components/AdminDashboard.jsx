import React, { useState } from 'react';
import { User, Users, LogOut, Eye, Trash2, UserPlus, Settings, Bell, Moon, Sun, Video, Image, FileText, Music, Mail, X, Shield, HardDrive, MessageCircle } from 'lucide-react';
import FileViewer from './FileViewer';

const AdminDashboard = ({
  currentUser,
  students,
  teachers,
  files,
  shares,
  notifications,
  darkMode,
  toggleDarkMode,
  setShowNotificationPanel,
  setCurrentUser,
  setCurrentView,
  signupEnabled,
  toggleSignup,
  isConnected,
  setShowAddStudentModal,
  setShowAddTeacherModal,
  handleDeleteStudent,
  handleDeleteTeacher,
  comments,
  likes,
  handleLikeFile,
  handleAddComment,
  handleInviteUser,
  setSelectedFileForShare,
  setShowShareModal,
  showChat,
  setShowChat,
  }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewTab, setViewTab] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'student' });
  const [inviting, setInviting] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  const notificationsList = notifications || [];
  const unreadNotifications = notificationsList.filter(n => n.userId === currentUser?.id && !n.read).length;
  const chatNotifications = notificationsList.filter(n => n.userId === currentUser?.id && n.type === 'chat' && !n.read).length;

  // Get all files from all students
  const filesMap = files || {};
  const allFiles = Object.values(filesMap).flat();
  
  // Filter files by type
  const videoFiles = allFiles.filter(f => f.type === 'video' || f.mime_type?.startsWith('video/'));
  const imageFiles = allFiles.filter(f => f.type === 'image' || f.mime_type?.startsWith('image/'));
  const textFiles = allFiles.filter(f => f.type === 'text' || f.mime_type?.startsWith('text/') || f.mime_type?.includes('pdf') || f.mime_type?.includes('document'));
  const audioFiles = allFiles.filter(f => f.type === 'audio' || f.mime_type?.startsWith('audio/'));

  const getFilesByType = () => {
    switch (viewTab) {
      case 'video': return videoFiles;
      case 'image': return imageFiles;
      case 'text': return textFiles;
      case 'audio': return audioFiles;
      default: return allFiles;
    }
  };

  const displayedFiles = getFilesByType();

  const totalFiles = Object.values(filesMap).flat().length;

  const handleInvite = async () => {
    if (!inviteForm.email) return;
    setInviting(true);
    const success = await handleInviteUser(inviteForm.email, inviteForm.role);
    if (success) {
      setInviteForm({ email: '', role: 'student' });
      setShowInviteModal(false);
    }
    setInviting(false);
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono" style={{ backgroundImage: 'linear-gradient(rgba(0,255,153,0.03) 1px, transparent 1px), linear-gradient(90deg,rgba(0,255,153,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{ background: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15) 1px,transparent 1px,transparent 2px)' }}></div>
      
      {/* Header */}
      <nav className="bg-gray-900/80 border-b border-cyan-500/30 p-4 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.8))' }} />
            <h1 className="text-2xl font-bold">
              <span className="text-cyan-400" style={{ textShadow: '0 0 10px rgba(34,211,238,0.8)' }}>CYBER</span>
              <span className="text-pink-500" style={{ textShadow: '0 0 10px rgba(236,72,153,0.8)' }}>_ADMIN</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-gray-900/50 border border-cyan-500/30 text-xs">
              <span className="text-green-400">●</span> SYSTEM ONLINE
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-900/50 border border-cyan-500/30 hover:border-cyan-400 transition-all"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowNotificationPanel(true)}
              className="relative p-2 rounded-lg bg-gray-900/50 border border-cyan-500/30 hover:border-cyan-400 transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowChat(true)}
              className="relative p-2 rounded-lg bg-gray-900/50 border border-cyan-500/30 hover:border-cyan-400 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              {chatNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {chatNotifications}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-cyan-500/30">
              <User className="w-5 h-5" />
              <span>ROOT_ADMIN</span>
            </div>
            <button
              onClick={() => { setCurrentUser(null); setCurrentView('login'); }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-pink-500/30 text-pink-400 hover:border-pink-400 hover:bg-pink-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              LOGOUT
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/60 border border-cyan-500/30 p-5 relative overflow-hidden group hover:border-cyan-400 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
            <div className="text-gray-500 text-sm uppercase tracking-wider mb-2">Total Users</div>
            <div className="text-3xl font-bold text-cyan-400" style={{ textShadow: '0 0 20px rgba(34,211,238,0.5)' }}>{students.length + teachers.length}</div>
          </div>
          <div className="bg-gray-900/60 border border-green-500/30 p-5 relative overflow-hidden group hover:border-green-400 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="text-gray-500 text-sm uppercase tracking-wider mb-2">Students</div>
            <div className="text-3xl font-bold text-green-400" style={{ textShadow: '0 0 20px rgba(74,222,128,0.5)' }}>{students.length}</div>
          </div>
          <div className="bg-gray-900/60 border border-purple-500/30 p-5 relative overflow-hidden group hover:border-purple-400 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <div className="text-gray-500 text-sm uppercase tracking-wider mb-2">Teachers</div>
            <div className="text-3xl font-bold text-purple-400" style={{ textShadow: '0 0 20px rgba(192,132,252,0.5)' }}>{teachers.length}</div>
          </div>
          <div className="bg-gray-900/60 border border-pink-500/30 p-5 relative overflow-hidden group hover:border-pink-400 transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
            <div className="text-gray-500 text-sm uppercase tracking-wider mb-2">Files Stored</div>
            <div className="text-3xl font-bold text-pink-400" style={{ textShadow: '0 0 20px rgba(236,72,153,0.5)' }}>{totalFiles}</div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-gray-900/60 border border-cyan-500/30 p-4">
            <h3 className="text-cyan-400 text-sm uppercase tracking-wider mb-4 pb-2 border-b border-cyan-500/30">{'//'} NAVIGATION</h3>
            <div className="space-y-2">
              {[
                { id: 'users', icon: Users, label: 'USERS' },
                { id: 'files', icon: HardDrive, label: 'FILES' },
                { id: 'settings', icon: Settings, label: 'SETTINGS' },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === id
                      ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
                      : 'border border-transparent text-gray-400 hover:border-cyan-500/30 hover:text-cyan-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <h3 className="text-pink-400 text-sm uppercase tracking-wider mb-4 mt-6 pb-2 border-b border-pink-500/30">{'//'} QUICK_ACTIONS</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-400 transition-all"
              >
                <UserPlus className="w-5 h-5" />
                + ADD_STUDENT
              </button>
              <button
                onClick={() => setShowAddTeacherModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 transition-all"
              >
                <UserPlus className="w-5 h-5" />
                + ADD_TEACHER
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all"
              >
                <Mail className="w-5 h-5" />
                <span>&gt; INVITE_USER</span>
              </button>
            </div>

            {/* System Status */}
            <h3 className="text-green-400 text-sm uppercase tracking-wider mb-4 mt-6 pb-2 border-b border-green-500/30">{'//'} SYSTEM_STATUS</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">DATABASE:</span>
                <span className="text-green-400">● ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">API:</span>
                <span className="text-green-400">● ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">BACKUP:</span>
                <span className="text-cyan-400">● SCHEDULED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ENCRYPTION:</span>
                <span className="text-green-400">● ENABLED</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 bg-gray-900/60 border border-cyan-500/30 p-6">
            {activeTab === 'users' && (
              <>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-cyan-500/30">
                  <h2 className="text-xl font-bold text-cyan-400">{'//'} USER_DATABASE_</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm">STUDENT_SIGNUP:</span>
                    <button
                      onClick={toggleSignup}
                      className={`w-12 h-6 rounded-full border transition-all ${signupEnabled ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}`}
                    >
                      <div className={`w-4 h-4 rounded-full transition-all ${signupEnabled ? 'bg-green-400 ml-7' : 'bg-red-400'}`}></div>
                    </button>
                  </div>
                </div>

                {/* Students Section */}
                <div className="mb-8">
                  <h3 className="text-green-400 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" /> STUDENTS [{students.length}]
                  </h3>
                  <div className="space-y-3">
                    {students.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No students in system
                      </div>
                    ) : (
                      students.map((student, index) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-4 bg-gray-950/50 border border-gray-800 hover:border-green-500/50 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-cyan-500 rounded flex items-center justify-center text-black font-bold">
                              {(student.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-green-400">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 text-xs bg-green-500/20 border border-green-500/30 text-green-400 rounded">
                              STUDENT
                            </span>
                            <button
                              onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                              className="p-2 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Teachers Section */}
                <div>
                  <h3 className="text-purple-400 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> TEACHERS [{teachers.length}]
                  </h3>
                  <div className="space-y-3">
                    {teachers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700">
                        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No teachers in system
                      </div>
                    ) : (
                      teachers.map((teacher, index) => (
                        <div
                          key={teacher.id}
                          className="flex items-center justify-between p-4 bg-gray-950/50 border border-gray-800 hover:border-purple-500/50 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center text-white font-bold">
                              {(teacher.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-purple-400">{teacher.name}</p>
                              <p className="text-sm text-gray-500">{teacher.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 text-xs bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded">
                              TEACHER
                            </span>
                            <button
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              className="p-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'files' && (
              <div>
                <h2 className="text-xl font-bold text-cyan-400 mb-6 pb-4 border-b border-cyan-500/30">{'//'} FILE_DATABASE_</h2>
                
                {/* File Type Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {[
                    { tab: 'all', icon: HardDrive, label: 'All Files', count: allFiles.length },
                    { tab: 'video', icon: Video, label: 'Videos', count: videoFiles.length },
                    { tab: 'image', icon: Image, label: 'Images', count: imageFiles.length },
                    { tab: 'text', icon: FileText, label: 'Documents', count: textFiles.length },
                    { tab: 'audio', icon: Music, label: 'Audio', count: audioFiles.length }
                  ].map(({ tab, icon: Icon, label, count }) => (
                    <button
                      key={tab}
                      onClick={() => setViewTab(tab)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
                        viewTab === tab
                          ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          : 'bg-gray-900/50 border border-gray-700 text-gray-400 hover:border-cyan-500/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 inline mr-2" />
                      {label} ({count})
                    </button>
                  ))}
                </div>

                {/* Files List */}
                <div className="space-y-3">
                  {displayedFiles.length === 0 ? (
                    <div className="text-center py-12">
                      <HardDrive className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-500">No files found</p>
                    </div>
                  ) : (
                    displayedFiles.map((file, index) => (
                      <FileViewer
                        key={file.id}
                        file={file}
                        canDelete={false}
                        onDelete={() => {}}
                        darkMode={darkMode}
                        comments={comments}
                        likes={likes}
                        currentUser={currentUser}
                        handleLikeFile={handleLikeFile}
                        handleAddComment={handleAddComment}
                        setSelectedFileForShare={setSelectedFileForShare}
                        setShowShareModal={setShowShareModal}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold text-cyan-400 mb-6 pb-4 border-b border-cyan-500/30">{'//'} SYSTEM_CONFIG_</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-950/30 border border-gray-800">
                    <div>
                      <p className="text-cyan-400 font-bold">Student Registration</p>
                      <p className="text-sm text-gray-500">Allow new students to register</p>
                    </div>
                    <button
                      onClick={toggleSignup}
                      className={`w-14 h-7 rounded-full border transition-all ${signupEnabled ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'}`}
                    >
                      <div className={`w-5 h-5 rounded-full transition-all ${signupEnabled ? 'bg-green-400 ml-8' : 'bg-red-400'}`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-950/30 border border-gray-800">
                    <div>
                      <p className="text-cyan-400 font-bold">Database Connection</p>
                      <p className="text-sm text-gray-500">{isConnected ? 'Connected to Supabase' : 'Not connected'}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded ${isConnected ? 'bg-green-500/20 text-green-400 border border-green-500' : 'bg-red-500/20 text-red-400 border border-red-500'}`}>
                      {isConnected ? '● CONNECTED' : '● DISCONNECTED'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-cyan-500/50 p-8 max-w-md w-full rounded-lg animate-scale-in" style={{ boxShadow: '0 0 50px rgba(34,211,238,0.2)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-cyan-400">{'//'} INVITE_USER_</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-500 hover:text-red-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-sm block mb-2">EMAIL_ADDRESS</label>
                <input
                  type="email"
                  placeholder="user@domain.com"
                  className="w-full p-3 bg-gray-950 border border-gray-700 text-cyan-400 focus:border-cyan-500 outline-none"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-gray-500 text-sm block mb-2">ROLE</label>
                <select
                  className="w-full p-3 bg-gray-950 border border-gray-700 text-cyan-400 focus:border-cyan-500 outline-none"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                >
                  <option value="student">STUDENT</option>
                  <option value="teacher">TEACHER</option>
                </select>
              </div>
              <button
                onClick={handleInvite}
                disabled={!inviteForm.email || inviting}
                className="w-full bg-cyan-500/20 border border-cyan-500 text-cyan-400 p-3 rounded hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {inviting ? 'SENDING...' : <span>&gt; SEND_INVITATION</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
