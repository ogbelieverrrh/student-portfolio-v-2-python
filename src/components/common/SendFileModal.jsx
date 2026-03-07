import React, { useState, useRef } from 'react';
import { X, Users, Send, FileText, FileAudio, FileImage, FileVideo, Check, CloudUpload, Trash2 } from 'lucide-react';

const SendFileModal = ({
  showSendFileModal,
  setShowSendFileModal,
  students,
  handleSendFileToStudents,
  darkMode,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileNote, setFileNote] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [sending, setSending] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!showSendFileModal) return null;

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.m4v', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma', '.pdf', '.doc', '.docx', '.txt', '.md'];
    const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExt) {
      alert('Invalid file type. Please select a video, image, audio, or document file.');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleStudentToggle = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSend = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }
    if (!sendToAll && selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    setSending(true);
    const recipientIds = sendToAll ? students.map(s => s.id) : selectedStudents;
    await handleSendFileToStudents(selectedFile, recipientIds, fileNote);
    setSending(false);
    
    // Reset and close
    setSelectedFile(null);
    setFileNote('');
    setSelectedStudents([]);
    setSendToAll(false);
    setFileInputKey(prev => prev + 1);
    setShowSendFileModal(false);
  };

  const getFileIcon = (file) => {
    if (!file) return <CloudUpload className="w-16 h-16" />;
    const type = file.type;
    if (type.startsWith('video/')) return <FileVideo className="w-16 h-16" />;
    if (type.startsWith('image/')) return <FileImage className="w-16 h-16" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-16 h-16" />;
    return <FileText className="w-16 h-16" />;
  };

  const getFileColor = (file) => {
    if (!file) return 'from-gray-400 to-gray-500';
    const type = file.type;
    if (type.startsWith('video/')) return 'from-red-500 to-orange-500';
    if (type.startsWith('image/')) return 'from-green-500 to-emerald-500';
    if (type.startsWith('audio/')) return 'from-purple-500 to-pink-500';
    return 'from-blue-500 to-cyan-500';
  };

  const getFileTypeLabel = (file) => {
    if (!file) return 'FILE';
    const type = file.type;
    if (type.startsWith('video/')) return 'VIDEO';
    if (type.startsWith('image/')) return 'IMAGE';
    if (type.startsWith('audio/')) return 'AUDIO';
    return 'DOCUMENT';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileInputKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all`}>
        
        {/* Animated Header */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className={`absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600`}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 animate-pulse opacity-50"></div>
          <div className="relative p-4 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Send className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">Send Files</h2>
                  <p className="text-white/80 text-xs sm:text-sm">Distribute files to your students</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowSendFileModal(false); }} 
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>
          </div>
          
          {/* Wave decoration - hidden on small screens */}
          <div className="absolute bottom-0 left-0 right-0 hidden sm:block">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill={darkMode ? '#111827' : '#ffffff'}/>
            </svg>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} p-4 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]`}>
          
          {/* File Drop Zone */}
          <div>
            <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2 sm:mb-3`}>
              📁 Select File
            </label>
            
            {selectedFile ? (
              <div className={`relative rounded-xl sm:rounded-2xl border-2 border-violet-500/50 bg-gradient-to-br ${darkMode ? 'from-gray-800 to-gray-900' : 'from-violet-50 to-purple-50'} p-3 sm:p-6`}>
                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </button>
                
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className={`w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br ${getFileColor(selectedFile)} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}>
                    {getFileIcon(selectedFile)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-bold rounded-full mb-1 sm:mb-2">
                      {getFileTypeLabel(selectedFile)}
                    </span>
                    <p className={`font-bold text-sm sm:text-lg ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>{selectedFile.name}</p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                      <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        📊 {formatFileSize(selectedFile.size)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-xl sm:rounded-2xl border-2 border-dashed transition-all duration-300 ${
                  dragActive 
                    ? 'border-violet-500 bg-violet-500/10 scale-[1.02]' 
                    : darkMode 
                      ? 'border-gray-700 hover:border-violet-500 bg-gray-800/50' 
                      : 'border-gray-300 hover:border-violet-400 bg-gray-50'
                }`}
              >
                <input
                  key={fileInputKey}
                  type="file"
                  ref={fileInputRef}
                  accept="video/*,image/*,audio/*,.pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                  id="teacher-file-upload-v2"
                />
                <label
                  htmlFor="teacher-file-upload-v2"
                  className="flex flex-col items-center justify-center p-6 sm:p-10 cursor-pointer"
                >
                  <div className={`w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg transform hover:scale-110 transition-all duration-300`}>
                    <CloudUpload className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <p className={`font-semibold text-sm sm:text-lg ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    Drag & drop your file here
                  </p>
                  <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    or <span className="text-violet-500 font-semibold">browse</span> to choose
                  </p>
                  <p className={`text-xs mt-2 sm:mt-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Videos, Images, Audio, Documents (Max 15GB)
                  </p>
                </label>
              </div>
            )}
          </div>

          {/* Note Input */}
          <div>
            <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2 sm:mb-3`}>
              💬 Add Note (Optional)
            </label>
            <textarea
              placeholder="Write a message to accompany your file..."
              rows={2}
              value={fileNote}
              onChange={(e) => setFileNote(e.target.value)}
              className={`w-full p-3 sm:p-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all resize-none text-sm sm:text-base ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
              }`}
            />
          </div>

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <label className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                👥 Recipients
              </label>
              <button
                onClick={() => { setSendToAll(!sendToAll); if (!sendToAll) setSelectedStudents([]); }}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  sendToAll 
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg' 
                    : darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                }`}
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{sendToAll ? '✓ All Students Selected' : 'Send to All'}</span>
                <span className="sm:hidden">{sendToAll ? '✓ All' : 'All'}</span>
              </button>
            </div>
            
            {!sendToAll && (
              <div className={`border-2 rounded-xl sm:rounded-2xl max-h-40 sm:max-h-52 overflow-y-auto ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                {students.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Users className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No students available</p>
                  </div>
                ) : (
                  <div className="p-1 sm:p-2 space-y-1">
                    {students.map(student => (
                      <label
                        key={student.id}
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleStudentToggle(student.id)}
                          className="hidden"
                        />
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0`}>
                          {(student.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>{student.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{student.email}</p>
                        </div>
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          selectedStudents.includes(student.id)
                            ? 'bg-violet-500 border-violet-500'
                            : darkMode ? 'border-gray-600' : 'border-gray-300'
                        }`}>
                          {selectedStudents.includes(student.id) && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {!sendToAll && students.length > 0 && (
              <p className={`text-xs sm:text-sm mt-2 sm:mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!selectedFile || (!sendToAll && selectedStudents.length === 0) || sending}
            className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 ${
              !selectedFile || (!sendToAll && selectedStudents.length === 0) || sending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
            }`}
          >
            {sending ? (
              <>
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 sm:border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Sending to {sendToAll ? 'All Students' : `${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}...</span>
                <span className="sm:hidden">Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Send to {sendToAll ? 'All Students' : `${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendFileModal;