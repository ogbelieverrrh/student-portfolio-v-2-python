import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddStudentModal = ({
  showAddStudentModal,
  setShowAddStudentModal,
  handleSignup,
  showNotification,
  darkMode,
}) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  if (!showAddStudentModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-md w-full animate-scale-in`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Add New Student</h2>
          <button onClick={() => setShowAddStudentModal(false)} className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className={`w-full p-3 border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className={`w-full p-3 border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none`}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className={`w-full p-3 border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none`}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            onClick={() => {
              if (formData.name && formData.email && formData.password) {
                handleSignup(formData.name, formData.email, formData.password, 'student', true);
                setFormData({ name: '', email: '', password: '' });
                setShowAddStudentModal(false);
              } else {
                showNotification('Please fill all fields');
              }
            }}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Create Student Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;
