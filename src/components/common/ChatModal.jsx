import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Users, User, MessageCircle, Volume2, Trash2 } from 'lucide-react';

const ChatModal = ({
  showChat,
  setShowChat,
  currentUser,
  students,
  teachers,
  admin,
  chatMessages,
  darkMode,
  handleSendMessage,
  handleSendAudio,
  handleDeleteMessage,
  isConnected,
  supabase
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatType, setChatType] = useState('general'); // 'general' or 'private'
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [showRecipientSelect, setShowRecipientSelect] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatType, selectedRecipient]);

  // Mark chat notifications as read when chat is opened
  useEffect(() => {
    if (showChat && typeof window !== 'undefined' && window.markChatNotificationsRead) {
      window.markChatNotificationsRead();
    }
  }, [showChat]);

  if (!showChat) return null;

  // Get available recipients based on user role
  const getRecipients = () => {
    const recipients = [];
    
    // Add general chat option
    recipients.push({ id: 'general', name: '📢 General Chat', role: 'all', email: null });
    
    if (currentUser.role === 'admin') {
      // Admin can chat with everyone
      students.forEach(s => recipients.push({ id: s.id, name: s.name, role: 'student', email: s.email }));
      teachers.forEach(t => recipients.push({ id: t.id, name: t.name, role: 'teacher', email: t.email }));
      recipients.push({ id: currentUser.id || currentUser.dbId, name: 'Admin (You)', role: 'admin', email: currentUser.email });
    } else if (currentUser.role === 'teacher') {
      // Teachers can chat with all students, other teachers, and admin
      students.forEach(s => recipients.push({ id: s.id, name: s.name, role: 'student', email: s.email }));
      teachers.forEach(t => {
        if (t.id !== currentUser.dbId) {
          recipients.push({ id: t.id, name: t.name, role: 'teacher', email: t.email });
        }
      });
      // Add admin as recipient for teachers
      if (admin) {
        recipients.push({ id: admin.id, name: '👨‍💼 Admin', role: 'admin', email: admin.email });
      }
    } else if (currentUser.role === 'student') {
      // Students can chat with other students, teachers, and admin
      students.forEach(s => {
        if (s.id !== currentUser.dbId) {
          recipients.push({ id: s.id, name: s.name, role: 'student', email: s.email });
        }
      });
      teachers.forEach(t => recipients.push({ id: t.id, name: t.name, role: 'teacher', email: t.email }));
      // Add admin as recipient for students
      if (admin) {
        recipients.push({ id: admin.id, name: '👨‍💼 Admin', role: 'admin', email: admin.email });
      }
    }
    
    return recipients;
  };

  const recipients = getRecipients();

  // Filter messages based on chat type
  const getFilteredMessages = () => {
    const currentUserId = currentUser.id || currentUser.dbId;
    const currentUserIdStr = String(currentUserId || '');
    const isAdmin = currentUser.role === 'admin';
    
    if (chatType === 'general') {
      const msgs = chatMessages.filter(m => m.is_general === true || m.is_general === 'true');
      return msgs;
    } else if (selectedRecipient && selectedRecipient.id !== 'general') {
      const recipientIdStr = String(selectedRecipient.id || '');
      const msgs = chatMessages.filter(m => {
        if (m.is_general === true || m.is_general === 'true') return false;
        
        const msgSenderId = String(m.sender_id || '');
        const msgRecipientId = String(m.recipient_id || '');
        
        if (isAdmin) {
          const isFromAdmin = msgSenderId === 'admin_001';
          const isToAdmin = msgRecipientId === 'admin_001';
          const isWithSelected = msgSenderId === recipientIdStr || msgRecipientId === recipientIdStr;
          return isWithSelected && (isFromAdmin || isToAdmin);
        }
        
        const isToRecipient = msgRecipientId === recipientIdStr && msgSenderId === currentUserIdStr;
        const isFromRecipient = msgSenderId === recipientIdStr && msgRecipientId === currentUserIdStr;
        return isToRecipient || isFromRecipient;
      });
      
      return msgs;
    }
    return [];
  };

  const filteredMessages = getFilteredMessages();

  const handleSelectRecipient = (recipient) => {
    setSelectedRecipient(recipient);
    if (recipient.id === 'general') {
      setChatType('general');
    } else {
      setChatType('private');
    }
    setShowRecipientSelect(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          await handleSendAudio(base64Audio, selectedRecipient, currentUser);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    
    await handleSendMessage(
      message,
      selectedRecipient,
      currentUser
    );
    setMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRecipientLabel = () => {
    if (chatType === 'general') return '📢 General Chat';
    if (!selectedRecipient) return 'Select recipient';
    return `💬 ${selectedRecipient.name}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-pink-900/80 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl sm:rounded-3xl w-full max-w-4xl h-[85vh] sm:h-[80vh] flex flex-col shadow-2xl overflow-hidden`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm sm:text-base">Chat</h3>
              <p className="text-white/70 text-xs">
                {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'teacher' ? 'Teacher' : 'Student'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowChat(false)}
            className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>

        {/* Chat Type Selector */}
        <div className={`p-2 sm:p-3 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} flex-shrink-0`}>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowRecipientSelect(true)}
              className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                chatType === 'general' 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                  : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="truncate max-w-[120px] sm:max-w-none">{getRecipientLabel()}</span>
            </button>
            
            <div className="flex gap-2 justify-center sm:justify-start">
              <button
                onClick={() => { setChatType('general'); setSelectedRecipient({ id: 'general', name: 'General Chat', role: 'all' }); }}
                className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  chatType === 'general' 
                    ? 'bg-indigo-500 text-white' 
                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4" /> 
                <span className="hidden sm:inline">General</span>
                <span className="sm:hidden">Gen</span>
              </button>
              <button
                onClick={() => { setChatType('private'); if (!selectedRecipient) setShowRecipientSelect(true); }}
                className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  chatType === 'private' 
                    ? 'bg-indigo-500 text-white' 
                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Private</span>
                <span className="sm:hidden">Prv</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recipient Selection Modal */}
        {showRecipientSelect && (
          <div className={`p-2 sm:p-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} flex-shrink-0`}>
            <h4 className={`font-semibold mb-2 sm:mb-3 text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>Select recipient:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 max-h-24 sm:max-h-40 overflow-y-auto">
              {recipients.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRecipient(r)}
                  className={`p-2 sm:p-3 rounded-xl text-left transition-all text-xs sm:text-sm ${
                    selectedRecipient?.id === r.id
                      ? 'bg-indigo-500 text-white'
                      : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700 border'
                  }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-lg">{r.role === 'all' ? '📢' : r.role === 'student' ? '👨‍🎓' : r.role === 'teacher' ? '👨‍🏫' : '👨‍💼'}</span>
                    <span className="font-medium truncate">{r.name}</span>
                  </div>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowRecipientSelect(false)}
              className="mt-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <MessageCircle className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm sm:text-base`}>
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMyMessage = msg.sender_id === (currentUser.id || currentUser.dbId);
              const isGeneral = msg.is_general;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] sm:max-w-[70%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                    {/* Sender info for general chat */}
                    {(isGeneral || chatType === 'general') && !isMyMessage && (
                      <div className={`text-[10px] sm:text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {msg.sender_role === 'admin' && '👨‍💼'} {msg.sender_role === 'teacher' && '👨‍🏫'} {msg.sender_role === 'student' && '👨‍🎓'} {msg.sender_name}
                      </div>
                    )}
                    
                    <div className={`p-2 sm:p-3 rounded-2xl ${
                      isMyMessage 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-md' 
                        : darkMode 
                          ? 'bg-gray-700 text-gray-200 rounded-bl-md' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}>
                      {msg.message_type === 'audio' ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          <audio 
                            ref={audioPlayerRef} 
                            src={msg.audio_data} 
                            controls 
                            className="h-6 sm:h-8 w-24 sm:w-32"
                          />
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm">{msg.message}</p>
                      )}
                      
                      <div className={`text-[10px] sm:text-xs mt-1 flex items-center gap-1 sm:gap-2 ${isMyMessage ? 'text-white/70' : 'text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                        {isMyMessage && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-2 sm:p-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} flex-shrink-0`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 sm:p-3 rounded-full transition-all flex-shrink-0 ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? 'Recording...' : 'Type a message...'}
              disabled={isRecording}
              className={`flex-1 p-2 sm:p-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
              }`}
            />
            
            <button
              onClick={handleSend}
              disabled={!message.trim() || isRecording}
              className="p-2 sm:p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          
          {isRecording && (
            <p className="text-center text-red-500 text-xs sm:text-sm mt-2 animate-pulse">
              🎤 Recording audio... Click microphone to stop
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;