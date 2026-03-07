import React, { useState } from 'react';
import { X } from 'lucide-react';

const ShareModal = ({
  showShareModal,
  setShowShareModal,
  selectedFileForShare,
  setSelectedFileForShare,
  students,
  teachers,
  currentUser,
  handleShareFile,
  darkMode,
}) => {
  const [selectedRecipients, setSelectedRecipients] = useState([]);

  if (!showShareModal || !selectedFileForShare) return null;

  // Get available recipients based on user role
  const getAvailableRecipients = () => {
    const currentUserId = currentUser?.dbId || currentUser?.id;
    
    if (currentUser?.role === 'teacher') {
      // Teachers can share with students and other teachers
      const otherTeachers = (teachers || []).filter(t => t.id !== currentUserId);
      const allStudents = (students || []).filter(s => s.id !== currentUserId);
      return [
        ...otherTeachers.map(t => ({ ...t, displayRole: 'Teacher' })),
        ...allStudents.map(s => ({ ...s, displayRole: 'Student' }))
      ];
    } else {
      // Students can only share with other students
      return (students || []).filter(s => s.id !== currentUserId).map(s => ({ ...s, displayRole: 'Student' }));
    }
  };

  const availableRecipients = getAvailableRecipients();
  const isTeacher = currentUser?.role === 'teacher';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 sm:p-8 max-w-md w-full animate-scale-in`}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className={`text-lg sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Share File</h2>
          <button onClick={() => { setShowShareModal(false); setSelectedFileForShare(null); }}>
            <X className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>
        <p className={`mb-3 sm:mb-4 text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Select {isTeacher ? 'users' : 'students'} to share with:
        </p>
        <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto mb-4 sm:mb-6">
          {availableRecipients.length === 0 ? (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-4`}>
              No {isTeacher ? 'other users' : 'students'} available to share with.
            </p>
          ) : (
            availableRecipients.map(recipient => (
              <label key={recipient.id} className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <input
                  type="checkbox"
                  checked={selectedRecipients.includes(recipient.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRecipients([...selectedRecipients, recipient.id]);
                    } else {
                      setSelectedRecipients(selectedRecipients.filter(id => id !== recipient.id));
                    }
                  }}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>
                    {recipient.name}
                    {recipient.displayRole && (
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        recipient.displayRole === 'Teacher' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {recipient.displayRole}
                      </span>
                    )}
                  </p>
                  <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{recipient.email}</p>
                </div>
              </label>
            ))
          )}
        </div>
        <button
          onClick={() => handleShareFile(selectedFileForShare, selectedRecipients)}
          disabled={selectedRecipients.length === 0}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
        >
          Share with {selectedRecipients.length} {isTeacher ? 'user' : 'student'}{selectedRecipients.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
