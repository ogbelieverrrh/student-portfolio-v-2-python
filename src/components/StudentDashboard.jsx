import React, { useState } from 'react';
import { Upload, FileText, Image, Video, Music, User, LogOut, Eye, Link2, Bell, Moon, Sun, Share2, Inbox, MessageCircle } from 'lucide-react';
import FileViewer from './FileViewer';

const StudentDashboard = ({
  currentUser,
  files,
  shares,
  notifications,
  darkMode,
  toggleDarkMode,
  setShowNotificationPanel,
  setCurrentUser,
  setCurrentView,
  handleFileUpload,
  handleDeleteFile,
  comments,
  likes,
  handleLikeFile,
  handleAddComment,
  setSelectedFileForShare,
  setShowShareModal,
  students,
  showChat,
  setShowChat,
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [viewTab, setViewTab] = useState('video');
  const [fileType, setFileType] = useState('video');

  const studentFiles = (files && currentUser?.dbId) ? (files[currentUser.dbId] || []) : [];
  const sharesMap = shares || {};
  const currentUserIdStr = String(currentUser?.dbId || '');
  const sharedWithMe = Object.values(sharesMap)
    .filter(share => String(share.recipientId) === currentUserIdStr)
    .map(share => {
      const allFiles = Object.values(files || {}).flat();
      const file = allFiles.find(f => f.id === share.fileId);
      return file;
    })
    .filter(Boolean);
  
  // Files sent by teachers
  const receivedFromTeacher = studentFiles.filter(f => f.sent_by_teacher === true);
  // Files uploaded by the student themselves
  const myUploads = studentFiles.filter(f => f.sent_by_teacher !== true);

  const videoFiles = myUploads.filter(f => f.type === 'video');
  const imageFiles = myUploads.filter(f => f.type === 'image');
  const textFiles = myUploads.filter(f => f.type === 'text');
  const audioFiles = myUploads.filter(f => f.type === 'audio');

  const notificationsList = notifications || [];
  const unreadNotifications = notificationsList.filter(n => String(n.userId) === currentUserIdStr && !n.read).length;
  const chatNotifications = notificationsList.filter(n => String(n.userId) === currentUserIdStr && n.type === 'chat' && !n.read).length;

  const FileList = ({ fileList, type }) => (
    fileList.length === 0 ? (
      <div className="text-center py-8 sm:py-12 animate-fade-in">
        <div className={`w-12 h-12 sm:w-16 sm:h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center`}>
          {type === 'video' && <Video className={`w-6 h-6 sm:w-8 sm:h-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />}
          {type === 'image' && <Image className={`w-6 h-6 sm:w-8 sm:h-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />}
          {type === 'text/note' && <FileText className={`w-6 h-6 sm:w-8 sm:h-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />}
          {type === 'audio' && <Music className={`w-6 h-6 sm:w-8 sm:h-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />}
        </div>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm sm:text-base`}>No {type} files uploaded yet</p>
      </div>
    ) : (
      <div className="space-y-3 sm:space-y-4">
        {fileList.map((file, index) => (
          <div key={file.id} className="animate-slide-down" style={{ animationDelay: `${index * 0.05}s` }}>
            <FileViewer
              file={file}
              canDelete={true}
              onDelete={(fileId) => handleDeleteFile(currentUser.dbId, fileId)}
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
    )
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      <nav className={`${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} text-white p-3 sm:p-4 shadow-lg`}>
        <div className="container mx-auto flex justify-between items-center gap-2">
          <h1 className="text-lg sm:text-2xl font-bold truncate">My Portfolio</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            >
              {darkMode ? <Sun className="w-4 h-5 sm:w-5 h-5" /> : <Moon className="w-4 h-5 sm:w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowNotificationPanel(true)}
              className="relative p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            >
              <Bell className="w-4 h-5 sm:w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowChat(true)}
              className="relative p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            >
              <MessageCircle className="w-4 h-5 sm:w-5 h-5" />
              {chatNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {chatNotifications}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 bg-white/20 px-2 sm:px-4 py-2 rounded-lg backdrop-blur-sm">
              <User className="w-4 h-5 sm:w-5 h-5" />
              <span className="hidden sm:inline text-sm">{currentUser.name}</span>
              <span className="sm:hidden text-xs">{currentUser.name?.split(' ')[0]}</span>
            </div>
            <button onClick={() => { setCurrentUser(null); setCurrentView('login'); }} className="flex items-center gap-1 sm:gap-2 bg-white/20 hover:bg-white/30 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm">
              <LogOut className="w-3 h-4 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-2 sm:p-4 lg:p-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-md p-2 sm:p-4 mb-4 sm:mb-6 border-l-4 border-indigo-500 animate-slide-down`}>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Link2 className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <span className={`font-semibold ${darkMode ? 'text-gray-300' : ''}`}>Your Dashboard Link:</span>
          </div>
          <code className={`${darkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-50 text-indigo-700'} px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm block mt-1 overflow-x-auto whitespace-nowrap`}>{currentUser.dashboard_link || currentUser.dashboardLink}</code>
        </div>

        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-base ${activeTab === 'upload' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : darkMode ? 'bg-gray-800 text-gray-300 shadow-md' : 'bg-white shadow-md'}`}
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Upload Files</span>
            <span className="sm:hidden">Upload</span>
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-base ${activeTab === 'view' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : darkMode ? 'bg-gray-800 text-gray-300 shadow-md' : 'bg-white shadow-md'}`}
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">My Files</span>
            <span className="sm:hidden">Files</span>
          </button>
          <button
            onClick={() => setActiveTab('shared')}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-base ${activeTab === 'shared' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : darkMode ? 'bg-gray-800 text-gray-300 shadow-md' : 'bg-white shadow-md'}`}
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden md:inline">Shared With Me</span>
            <span className="sm:hidden md:inline">Shared</span>
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{sharedWithMe.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-base ${activeTab === 'received' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : darkMode ? 'bg-gray-800 text-gray-300 shadow-md' : 'bg-white shadow-md'}`}
          >
            <Inbox className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden md:inline">From Teachers</span>
            <span className="sm:hidden md:inline">Teachers</span>
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{receivedFromTeacher.length}</span>
          </button>
        </div>

        {activeTab === 'upload' && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 sm:p-6 animate-fade-in`}>
            <h2 className={`text-lg sm:text-2xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>Upload Files</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {[
                { type: 'video', icon: Video, color: 'indigo' },
                { type: 'image', icon: Image, color: 'green' },
                { type: 'text', icon: FileText, color: 'blue' },
                { type: 'audio', icon: Music, color: 'purple' }
              ].map(({ type, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => setFileType(type)}
                  className={`p-3 sm:p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    fileType === type
                      ? color === 'indigo' ? 'border-indigo-500 bg-indigo-900/20 shadow-lg' :
                        color === 'green' ? 'border-green-500 bg-green-900/20 shadow-lg' :
                        color === 'blue' ? 'border-blue-500 bg-blue-900/20 shadow-lg' :
                        color === 'purple' ? 'border-purple-500 bg-purple-900/20 shadow-lg' : ''
                      : darkMode
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 ${
                      fileType === type 
                        ? color === 'indigo' ? 'text-indigo-600' :
                          color === 'green' ? 'text-green-600' :
                          color === 'blue' ? 'text-blue-600' :
                          color === 'purple' ? 'text-purple-600' : ''
                        : darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  />
                  <p className={`capitalize font-semibold text-xs sm:text-sm ${darkMode ? 'text-gray-300' : ''}`}>{type}</p>
                </button>
              ))}
            </div>
            <div className={`border-2 border-dashed ${darkMode ? 'border-gray-600 hover:border-indigo-500' : 'border-gray-300 hover:border-indigo-400'} rounded-xl p-4 sm:p-8 text-center transition-all duration-300`}>
              <input
                type="file"
                id="file-upload"
                accept={fileType === 'video' ? 'video/*' : fileType === 'image' ? 'image/*' : fileType === 'audio' ? 'audio/*' : '.pdf,.doc,.docx,.txt,.md'}
                onChange={(e) => {
                  if (e.target.files[0]) {
                    const selectedFile = e.target.files[0];
                    const fileType2 = fileType;
                    const fileName = selectedFile.name.toLowerCase();
                    
                    if (fileType2 === 'video') {
                      const validTypes = ['video/'];
                      const validExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.m4v'];
                      const hasValidType = validTypes.some(t => selectedFile.type.startsWith(t));
                      const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
                      if (!hasValidType && !hasValidExt) {
                        alert('Please select a valid video file (MP4, WebM, MOV, AVI, MKV)');
                        return;
                      }
                    }
                    if (fileType2 === 'image') {
                      const validTypes = ['image/'];
                      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
                      const hasValidType = validTypes.some(t => selectedFile.type.startsWith(t));
                      const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
                      if (!hasValidType && !hasValidExt) {
                        alert('Please select a valid image file (JPG, PNG, GIF, WebP, SVG)');
                        return;
                      }
                    }
                    if (fileType2 === 'audio') {
                      const validTypes = ['audio/'];
                      const validExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma'];
                      const hasValidType = validTypes.some(t => selectedFile.type.startsWith(t));
                      const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
                      if (!hasValidType && !hasValidExt) {
                        alert('Please select a valid audio file (MP3, WAV, OGG, FLAC)');
                        return;
                      }
                    }
                    if (fileType2 === 'text') {
                      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'application/json'];
                      const validExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md', '.json'];
                      const hasValidType = validTypes.some(t => selectedFile.type.includes(t));
                      const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
                      if (!hasValidType && !hasValidExt) {
                        alert('Please select a valid document file (PDF, DOC, DOCX, TXT, MD)');
                        return;
                      }
                    }
                    
                    handleFileUpload(currentUser.dbId, selectedFile, fileType);
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} font-semibold mb-1`}>Click to upload</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Selected type: <span className="capitalize font-semibold text-indigo-600">{fileType}</span></p>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'view' && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 sm:p-6 animate-fade-in`}>
            <h2 className={`text-lg sm:text-2xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>My Files</h2>
            <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
              {[
                { tab: 'video', icon: Video, label: 'Videos', count: videoFiles.length, color: 'indigo' },
                { tab: 'image', icon: Image, label: 'Images', count: imageFiles.length, color: 'green' },
                { tab: 'text', icon: FileText, label: 'Notes', count: textFiles.length, color: 'blue' },
                { tab: 'audio', icon: Music, label: 'Audio', count: audioFiles.length, color: 'purple' }
              ].map(({ tab, icon: Icon, label, count, color }) => (
                <button
                  key={tab}
                  onClick={() => setViewTab(tab)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm ${
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
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.slice(0, 3)}</span>
                  <span className="text-xs opacity-75">({count})</span>
                </button>
              ))}
            </div>
            {viewTab === 'video' && <FileList fileList={videoFiles} type="video" />}
            {viewTab === 'image' && <FileList fileList={imageFiles} type="image" />}
            {viewTab === 'text' && <FileList fileList={textFiles} type="text/note" />}
            {viewTab === 'audio' && <FileList fileList={audioFiles} type="audio" />}
          </div>
        )}

        {activeTab === 'shared' && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 sm:p-6 animate-fade-in`}>
            <h2 className={`text-lg sm:text-2xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>Shared With Me</h2>
            {sharedWithMe.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Share2 className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm sm:text-base`}>No files shared with you yet</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {sharedWithMe.map((file, index) => (
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
        )}

        {activeTab === 'received' && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-4 sm:p-6 animate-fade-in`}>
            <h2 className={`text-lg sm:text-2xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>Files From Teachers</h2>
            {receivedFromTeacher.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Inbox className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm sm:text-base`}>No files from teachers yet</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {receivedFromTeacher.map((file, index) => (
                  <div key={file.id} className="animate-slide-down" style={{ animationDelay: `${index * 0.05}s` }}>
                    {file.note && (
                      <div className={`mb-2 p-2 sm:p-3 rounded-lg ${darkMode ? 'bg-purple-900/30 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'}`}>
                        <p className={`text-xs sm:text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          <span className="font-semibold">Note from teacher:</span> {file.note}
                        </p>
                      </div>
                    )}
                    <FileViewer
                      file={file}
                      canDelete={true}
                      onDelete={(fileId) => handleDeleteFile(currentUser.dbId, fileId)}
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
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
