import React, { useState } from 'react';
import { FileText, Image, Video, Music, Eye, Trash2, Share2, MessageSquare, Heart, Send, X } from 'lucide-react';

const FileViewer = ({
  file,
  canDelete,
  onDelete,
  showActions = true,
  darkMode,
  comments,
  likes,
  currentUser,
  handleLikeFile,
  handleAddComment,
  setSelectedFileForShare,
  setShowShareModal,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const fileComments = comments[file.id] || [];
  const fileLikes = likes[file.id] || [];
  const currentUserId = currentUser?.role === 'admin' ? currentUser?.id : (currentUser?.dbId || currentUser?.id);
  const isLiked = fileLikes.some(id => String(id) === String(currentUserId));

  return (
    <div className={`border-2 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100'} rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between p-2 sm:p-4 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
            file.type === 'video' ? (darkMode ? 'bg-indigo-900' : 'bg-indigo-100') :
            file.type === 'image' ? (darkMode ? 'bg-green-900' : 'bg-green-100') :
            file.type === 'text' ? (darkMode ? 'bg-blue-900' : 'bg-blue-100') : (darkMode ? 'bg-purple-900' : 'bg-purple-100')
          }`}>
            {file.type === 'video' && <Video className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />}
            {file.type === 'image' && <Image className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />}
            {file.type === 'text' && <FileText className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
            {file.type === 'audio' && <Music className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>{file.name}</p>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{file.upload_date || file.uploadDate} • {file.size}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {showActions && (
            <>
              <button
                onClick={() => handleLikeFile(file.id)}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all ${
                  isLiked
                    ? 'bg-red-100 text-red-600'
                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs sm:text-sm hidden sm:inline">{fileLikes.length}</span>
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-all`}
              >
                <MessageSquare className={`w-3 h-3 sm:w-4 sm:h-4`} />
                <span className="text-xs sm:text-sm hidden sm:inline">{fileComments.length}</span>
              </button>
              {(currentUser?.role === 'student' || currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
                <button
                  onClick={() => {
                    setSelectedFileForShare(file.id);
                    setShowShareModal(true);
                  }}
                  className={`flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg ${darkMode ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'} transition-all`}
                >
                  <Share2 className={`w-3 h-3 sm:w-4 sm:h-4`} />
                  <span className="hidden sm:inline text-sm">Share</span>
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg ${darkMode ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} transition-all duration-200 text-xs sm:text-sm`}
          >
            {showPreview ? <X className={`w-3 h-3 sm:w-4 sm:h-4`} /> : <Eye className={`w-3 h-3 sm:w-4 sm:h-4`} />}
            <span className="hidden sm:inline">{showPreview ? 'Close' : 'View'}</span>
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(file.id)}
              className={`${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'} p-1.5 sm:p-2 rounded-lg transition-all duration-200`}
            >
              <Trash2 className={`w-4 h-4 sm:w-5 sm:h-5`} />
            </button>
          )}
        </div>
      </div>

      {showComments && (
        <div className={`px-2 sm:px-4 pb-2 sm:pb-4 border-t-2 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} animate-slide-down`}>
          <div className="py-3 sm:py-4 space-y-2 sm:space-y-3">
            {fileComments.map(comment => (
              <div key={comment.id} className={`p-2 sm:p-3 rounded-lg ${
                comment.user_role === 'teacher'
                  ? darkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'
                  : darkMode ? 'bg-gray-700' : 'bg-white'
              }`}>
                <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                  <span className={`font-semibold text-xs sm:text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{comment.user_name}</span>
                  {comment.user_role === 'teacher' && (
                    <span className="text-[10px] sm:text-xs bg-purple-600 text-white px-1.5 sm:px-2 py-0.5 rounded-full">Teacher</span>
                  )}
                  <span className={`text-[10px] sm:text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{comment.text}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className={`flex-1 p-2 text-sm border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} rounded-lg focus:border-indigo-500 outline-none`}
            />
            <button
              onClick={() => {
                if (commentText.trim()) {
                  handleAddComment(file.id, commentText);
                  setCommentText('');
                }
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:shadow-lg transition-all"
            >
              <Send className={`w-4 h-4`} />
            </button>
          </div>
        </div>
      )}

      {showPreview && (
        <div className={`p-2 sm:p-4 ${darkMode ? 'bg-gray-900 border-t-2 border-gray-700' : 'bg-gray-50 border-t-2 border-gray-200'} animate-slide-down`}>
          {file.type === 'video' && (
            <video controls className="w-full max-h-48 sm:max-h-96 rounded-lg bg-black">
              <source src={file.data} type={file.mime_type || file.mimeType} />
              Your browser does not support video playback.
            </video>
          )}
          {file.type === 'image' && (
            <img src={file.data} alt={file.name} className="w-full max-h-48 sm:max-h-96 object-contain rounded-lg mx-auto" />
          )}
          {file.type === 'audio' && (
            <div className="flex items-center justify-center p-4 sm:p-8">
              <audio controls className="w-full max-w-sm sm:max-w-md">
                <source src={file.data} type={file.mime_type || file.mimeType} />
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
          {file.type === 'text' && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 sm:p-6 rounded-lg max-h-48 sm:max-h-96 overflow-auto`}>
              <iframe src={file.data} className="w-full h-48 sm:h-96 border-0" title={file.name}></iframe>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileViewer;
