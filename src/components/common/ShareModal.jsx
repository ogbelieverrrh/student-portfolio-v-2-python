import React, { useState } from 'react';
import { X } from 'lucide-react';

const ShareModal = ({
  showShareModal,
  setShowShareModal,
  selectedFileForShare,
  setSelectedFileForShare,
  students,
  currentUser,
  handleShareFile,
  darkMode,
}) => {
  const [selectedStudents, setSelectedStudents] = useState([]);

  if (!showShareModal || !selectedFileForShare) return null;

  const availableStudents = students.filter(s => s.id !== currentUser.dbId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 sm:p-8 max-w-md w-full animate-scale-in`}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className={`text-lg sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Share File</h2>
          <button onClick={() => { setShowShareModal(false); setSelectedFileForShare(null); }}>
            <X className={`w-5 h-5 sm:w-6 sm:h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>
        <p className={`mb-3 sm:mb-4 text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Select students to share with:</p>
        <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto mb-4 sm:mb-6">
          {availableStudents.map(student => (
            <label key={student.id} className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStudents([...selectedStudents, student.id]);
                  } else {
                    setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                  }
                }}
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-800'} truncate`}>{student.name}</p>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{student.email}</p>
              </div>
            </label>
          ))}
        </div>
        <button
          onClick={() => handleShareFile(selectedFileForShare, selectedStudents)}
          disabled={selectedStudents.length === 0}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
        >
          Share with {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
