import { createClient } from '@supabase/supabase-js';
import React, { useState } from 'react';
import { FileText, Database, Sun, Moon } from 'lucide-react';

const DatabaseSetup = ({ darkMode, toggleDarkMode, showNotification, setSupabase, setDbConfig, setIsConnected, loadFromDatabase, setCurrentView }) => {
    const [setupData, setSetupData] = useState({ url: '', key: '' });
    const [testing, setTesting] = useState(false);

    const testConnection = async () => {
      setTesting(true);
      try {
        const response = await fetch(`${setupData.url}/rest/v1/`, {
          headers: {
            'apikey': setupData.key,
            'Authorization': `Bearer ${setupData.key}`
          }
        });
        
        if (response.ok) {
          showNotification('Connection successful!');
          localStorage.setItem('dbConfig', JSON.stringify(setupData));
          const client = createClient(setupData.url, setupData.key);
          setSupabase(client);
          setDbConfig(setupData);
          setIsConnected(true);
          
          await initializeTables(setupData);
          await loadFromDatabase(setupData);
          setCurrentView('login');
        } else {
          showNotification('Connection failed. Please check your credentials.');
        }
      } catch (error) {
        showNotification('Connection error. Please check your URL and key.');
      } finally {
        setTesting(false);
      }
    };

    const initializeTables = async (config) => {
      try {
        const settingsData = await fetch(`${config.url}/rest/v1/settings?select=*`, {
          headers: {
            'apikey': config.key,
            'Authorization': `Bearer ${config.key}`
          }
        }).then(res => res.json());

        if (!settingsData || settingsData.length === 0) {
          await fetch(`${config.url}/rest/v1/settings`, {
            method: 'POST',
            headers: {
              'apikey': config.key,
              'Authorization': `Bearer ${config.key}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ signup_enabled: true })
          });
        }
      } catch (error) {
        console.log('Error initializing tables:', error);
      }
    };

    const skipDatabase = () => {
      setCurrentView('login');
      showNotification('Using local storage mode');
    };

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} flex items-center justify-center p-4 animate-fade-in`}>
        {!darkMode && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        )}
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white/80 backdrop-blur-sm'} rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative z-10 animate-scale-in`}>
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:scale-110 transition-transform`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-float">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
              Database Setup
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>Connect to Supabase for persistent storage</p>
          </div>

          <div className={`${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-6`}>
            <h3 className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>Quick Setup Guide:</h3>
            <ol className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'} space-y-1 list-decimal list-inside`}>
              <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a> and create a free account</li>
              <li>Create a new project</li>
              <li>Go to Project Settings → API</li>
              <li>Copy the "Project URL" and "anon public" key</li>
              <li>Run the SQL commands below in SQL Editor</li>
            </ol>
          </div>

          <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 mb-6`}>
            <h3 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2 flex items-center gap-2`}>
              <FileText className="w-4 h-4" />
              SQL Setup Commands:
            </h3>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`-- Drop existing tables if needed (careful: this deletes all data)
-- DROP TABLE IF EXISTS shares CASCADE;
-- DROP TABLE IF EXISTS likes CASCADE;
-- DROP TABLE IF EXISTS comments CASCADE;
-- DROP TABLE IF EXISTS files CASCADE;
-- DROP TABLE IF EXISTS teachers CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;

-- Recreate with UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student',
  dashboard_link TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'teacher',
  dashboard_link TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  upload_date TEXT,
  size TEXT,
  data TEXT,
  mime_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE settings (
  id BIGSERIAL PRIMARY KEY,
  signup_enabled BOOLEAN DEFAULT true
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for students" ON students FOR ALL USING (true);
CREATE POLICY "Enable all for teachers" ON teachers FOR ALL USING (true);
CREATE POLICY "Enable all for files" ON files FOR ALL USING (true);
CREATE POLICY "Enable all for settings" ON settings FOR ALL USING (true);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id uuid REFERENCES files(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  user_name TEXT,
  user_role TEXT,
  text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id uuid REFERENCES files(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  UNIQUE(file_id, user_id)
);

CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id uuid REFERENCES files(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES students(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES students(id) ON DELETE CASCADE
);

-- Create notifications table for real-time notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  recipient_id TEXT,
  recipient_name TEXT,
  recipient_role TEXT,
  message_type TEXT DEFAULT 'text',
  message TEXT NOT NULL,
  audio_data TEXT,
  is_general BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for notifications" ON notifications FOR ALL USING (true);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for chat_messages" ON chat_messages FOR ALL USING (true);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for comments" ON comments FOR ALL USING (true);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for likes" ON likes FOR ALL USING (true);

ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for shares" ON shares FOR ALL USING (true);
`}
            </pre>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Supabase Project URL</label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                className={`w-full p-3 border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none`}
                value={setupData.url}
                onChange={(e) => setSetupData({ ...setupData, url: e.target.value })}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Supabase Anon Key</label>
              <input
                type="password"
                placeholder="Your anon public key"
                className={`w-full p-3 border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none`}
                value={setupData.key}
                onChange={(e) => setSetupData({ ...setupData, key: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={testConnection}
                disabled={!setupData.url || !setupData.key || testing}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {testing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5" />
                    Connect to Database
                  </>
                )}
              </button>
              <button
                onClick={skipDatabase}
                className={`px-6 py-3 border-2 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg transition-all duration-300`}
              >
                Skip (Use Local Storage)
              </button>
            </div>
          </div>

          <div className={`mt-6 pt-6 border-t text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>💡 With Supabase, your data persists across devices and sessions!</p>
          </div>
        </div>
      </div>
    );
  };

  export default DatabaseSetup;
