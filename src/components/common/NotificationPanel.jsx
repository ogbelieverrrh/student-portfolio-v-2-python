import React from 'react';
import { X, Bell, MessageCircle, FileText, Heart, Share2, Send } from 'lucide-react';

const NotificationPanel = ({
  showNotificationPanel,
  setShowNotificationPanel,
  notifications,
  currentUser,
  markNotificationRead,
  darkMode,
  setShowChat,
}) => {
  if (!showNotificationPanel) return null;

  // Use dbId for students/teachers, id for admin
  const userId = currentUser.role === 'admin' ? currentUser.id : currentUser.dbId;
  const userNotifications = notifications.filter(n => n.userId === userId);
  const unreadCount = userNotifications.filter(n => !n.read).length;
  
  // Filter chat notifications
  const chatNotifications = userNotifications.filter(n => n.type === 'chat');
  const chatUnreadCount = chatNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'chat':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'upload':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-purple-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-yellow-500" />;
      case 'teacher_file':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return '';
    switch (type) {
      case 'chat':
        return darkMode ? 'bg-green-900/20 hover:bg-green-900/30' : 'bg-green-50 hover:bg-green-100';
      case 'upload':
        return darkMode ? 'bg-blue-900/20 hover:bg-blue-900/30' : 'bg-blue-50 hover:bg-blue-100';
      case 'like':
        return darkMode ? 'bg-red-900/20 hover:bg-red-900/30' : 'bg-red-50 hover:bg-red-100';
      case 'share':
        return darkMode ? 'bg-purple-900/20 hover:bg-purple-900/30' : 'bg-purple-50 hover:bg-purple-100';
      case 'comment':
        return darkMode ? 'bg-yellow-900/20 hover:bg-yellow-900/30' : 'bg-yellow-50 hover:bg-yellow-100';
      case 'teacher_file':
        return darkMode ? 'bg-indigo-900/20 hover:bg-indigo-900/30' : 'bg-indigo-50 hover:bg-indigo-100';
      default:
        return darkMode ? 'bg-blue-900/20 hover:bg-blue-900/30' : 'bg-blue-50 hover:bg-blue-100';
    }
  };

  return (
    <div className="fixed top-12 sm:top-16 right-2 sm:right-4 z-50 animate-slide-down">
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-2xl border-2 w-[calc(100vw-16px)] sm:w-96 max-h-[80vh] overflow-y-auto`}>
        <div className={`p-3 sm:p-4 border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {chatUnreadCount > 0 && (
              <button 
                onClick={() => {
                  setShowNotificationPanel(false);
                  if (setShowChat) setShowChat(true);
                }}
                className="text-xs text-green-500 hover:text-green-400 flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                {chatUnreadCount} new
              </button>
            )}
          </div>
          <button onClick={() => setShowNotificationPanel(false)}>
            <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {userNotifications.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500">
              <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            userNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3 sm:p-4 cursor-pointer transition-all ${
                  notif.read
                    ? darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                    : getNotificationColor(notif.type, false)
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${notif.read ? 'bg-gray-400' : 'bg-blue-500'}`} />
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
