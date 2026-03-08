import React, { useState } from 'react';
import { User, Users, LogOut, Eye, Bell, Moon, Sun, Video, Image, FileText, Music, Send, Link2, MessageCircle } from 'lucide-react';
import FileViewer from './FileViewer';

const TeacherDashboard = ({
  currentUser,
  students,
  files,
  shares,
  notifications,
  darkMode,
  toggleDarkMode,
  setShowNotificationPanel,
  setCurrentUser,
  setCurrentView,
  comments,
  likes,
  handleLikeFile,
  handleAddComment,
  setSelectedFileForShare,
  setShowShareModal,
  setShowSendFileModal,
  handleSendFileToStudents,
  showChat,
  setShowChat,
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewTab, setViewTab] = useState('video');

  const notificationsList = notifications || [];
  const currentUserIdStr = String(currentUser?.dbId || '');
  const unreadNotifications = notificationsList.filter(n => String(n.userId) === currentUserIdStr && !n.read).length;
  const chatNotifications = notificationsList.filter(n => String(n.userId) === currentUserIdStr && n.type === 'chat' && !n.read).length;

  const TeacherFileViewer = ({ studentId }) => {
    const studentFiles = files[studentId] || [];
    const videoFiles = studentFiles.filter(f => f.type === 'video');
    const imageFiles = studentFiles.filter(f => f.type === 'image');
    const textFiles = studentFiles.filter(f => f.type === 'text');
    const audioFiles = studentFiles.filter(f => f.type === 'audio');

    const getFilesByType = () => {
      switch (viewTab) {
        case 'video': return videoFiles;
        case 'image': return imageFiles;
        case 'text': return textFiles;
        case 'audio': return audioFiles;
        default: return [];
      }
    };

    const currentFiles = getFilesByType();

    return (
      <div className="mt-6 border-t pt-6 animate-slide-down">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { tab: 'video', icon: Video, label: 'Videos', count: videoFiles.length, color: 'indigo' },
            { tab: 'image', icon: Image, label: 'Images', count: imageFiles.length, color: 'green' },
            { tab: 'text', icon: FileText, label: 'Notes', count: textFiles.length, color: 'blue' },
            { tab: 'audio', icon: Music, label: 'Audio', count: audioFiles.length, color: 'purple' }
          ].map(({ tab, icon: Icon, label, count, color }) => (
            <button
              key={tab}
              onClick={() => setViewTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                viewTab === tab
                  ? color === 'indigo' ? 'bg-indigo-600 text-white shadow-md' :
                    color === 'green' ? 'bg-green-600 text-white shadow-md' :
                    color === 'blue' ? 'bg-blue-600 text-white shadow-md' :
                    color === 'purple' ? 'bg-purple-600 text-white shadow-md' : ''
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label} ({count})
            </button>
          ))}
        </div>

        {currentFiles.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <div className={`w-16 h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full mx-auto mb-4 flex items-center justify-center`}>
              {viewTab === 'video' && <Video className={`w-8 h-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />}
              {viewTab === 'image' && <Image className={`w-8 h-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />}
              {viewTab === 'text' && <FileText className={`w-8 h-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />}
              {viewTab === 'audio' && <Music className={`w-8 h-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />}
            </div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No {viewTab} files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentFiles.map((file, index) => (
              <div key={file.id} className="animate-slide-down" style={{ animationDelay: `${index * 0.05}s` }}>
                <FileViewer
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
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      <nav className={`${darkMode ? 'bg-gradient-to-r from-purple-900 to-pink-900' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white p-4 shadow-lg`}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowNotificationPanel(true)}
              className="relative p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowChat(true)}
              className="relative p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              {chatNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {chatNotifications}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
              <User className="w-5 h-5" />
              <span>{currentUser.name}</span>
            </div>
            <button
              onClick={() => { setCurrentUser(null); setCurrentView('login'); }}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {/* Dashboard Link */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-md p-4 mb-6 border-l-4 border-purple-500 animate-slide-down`}>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link2 className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className={`font-semibold ${darkMode ? 'text-gray-300' : ''}`}>Your Dashboard Link:</span>
            <code className={`${darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700'} px-3 py-1 rounded-lg`}>{currentUser.dashboard_link || currentUser.dashboardLink}</code>
          </div>
        </div>

        {/* Send File Button */}
        <button
          onClick={() => setShowSendFileModal(true)}
          className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          Send File to Students
        </button>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 animate-fade-in`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'}`}>
            Student Files
          </h2>

          <div className="grid gap-4">
            {students.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <div className={`w-16 h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <Users className={`w-8 h-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No students registered yet</p>
              </div>
            ) : (
              students.map((student, index) => (
                <div
                  key={student.id}
                  className={`border-2 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100'} rounded-xl overflow-hidden hover:border-purple-300 hover:shadow-md transition-all duration-300 animate-slide-down`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {(student.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{student.name}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{student.email}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                            Files: {(files[student.id] || []).length}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'} transition-all duration-200`}
                        >
                          <Eye className="w-4 h-4" />
                          {selectedStudent === student.id ? 'Hide' : 'View'} Files
                        </button>
                      </div>
                    </div>

                    {selectedStudent === student.id && (
                      <TeacherFileViewer studentId={student.id} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
