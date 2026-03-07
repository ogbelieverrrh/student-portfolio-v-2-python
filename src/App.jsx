import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect, useCallback } from 'react';
import DatabaseSetup from './components/DatabaseSetup';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import Notification from './components/common/Notification';
import NotificationPanel from './components/common/NotificationPanel';
import ShareModal from './components/common/ShareModal';
import SendFileModal from './components/common/SendFileModal';
import AddStudentModal from './components/common/AddStudentModal';
import AddTeacherModal from './components/common/AddTeacherModal';
import ChatModal from './components/common/ChatModal';

const ADMIN_ACCOUNT = {
  id: 'admin_001',
  name: 'Administrator',
  email: 'admin@school.com',
  password: 'admin123',
  role: 'admin'
};

const App = () => {
  const [currentView, setCurrentView] = useState('setup');
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [files, setFiles] = useState({});
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});
  const [shares, setShares] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [notification, setNotification] = useState(null);
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSendFileModal, setShowSendFileModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedFileForShare, setSelectedFileForShare] = useState(null);
  const [dbConfig, setDbConfig] = useState({ url: '', key: '' });
  const [isConnected, setIsConnected] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [supabase, setSupabase] = useState(null);
  const [showUnverifiedEmailNotification, setShowUnverifiedEmailNotification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  const loadFromDatabase = useCallback(async (config) => {
    if (!config.url || !config.key) return;
    
    try {
      // Load all data in parallel for faster loading
      const [studentsRes, teachersRes, filesRes, commentsRes, likesRes, sharesRes, chatRes] = await Promise.all([
        fetch(`${config.url}/rest/v1/students?select=*`, {
          headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}` }
        }),
        fetch(`${config.url}/rest/v1/teachers?select=*`, {
          headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}` }
        }),
        fetch(`${config.url}/rest/v1/files?select=*`, {
          headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}` }
        }),
        fetch(`${config.url}/rest/v1/comments?select=*`, {
          headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}` }
        }),
        fetch(`${config.url}/rest/v1/likes?select=*`, {
          headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}` }
        }),
        fetch(`${config.url}/rest/v1/shares?select=*`, {
          headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}` }
        }),
        fetch(`${config.url}/rest/v1/chat_messages?select=*&order=created_at.desc&limit=200`, {
          headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}` }
        })
      ]);

      // Process all responses in parallel
      const [studentsData, teachersData, filesData, commentsData, likesData, sharesData, chatData] = await Promise.all([
        studentsRes.json(),
        teachersRes.json(),
        filesRes.json(),
        commentsRes.json(),
        likesRes.json(),
        sharesRes.json(),
        chatRes.json()
      ]);

      // Update all states
      setStudents(studentsData || []);
      setTeachers(teachersData || []);
      
      // Build files map
      const filesMap = {};
      (filesData || []).forEach(file => {
        if (!filesMap[file.student_id]) filesMap[file.student_id] = [];
        filesMap[file.student_id].push(file);
      });
      setFiles(filesMap);

      // Build comments map
      const commentsMap = {};
      (commentsData || []).forEach(comment => {
        if (!commentsMap[comment.file_id]) commentsMap[comment.file_id] = [];
        commentsMap[comment.file_id].push(comment);
      });
      setComments(commentsMap);

      // Build likes map
      const likesMap = {};
      (likesData || []).forEach(like => {
        if (!likesMap[like.file_id]) likesMap[like.file_id] = [];
        likesMap[like.file_id].push(like.user_id);
      });
      setLikes(likesMap);

      // Build shares map
      const sharesMap = {};
      (sharesData || []).forEach(share => {
        sharesMap[share.id] = {
          fileId: share.file_id,
          ownerId: share.owner_id,
          recipientId: share.recipient_id,
        };
      });
      setShares(sharesMap);

      // Set chat messages
      setChatMessages(chatData || []);

    } catch (error) {
      console.error('Error loading from database:', error);
      showNotification('Error loading data from database');
    } 
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      setDarkMode(true);
    }

    const savedDbConfig = JSON.parse(localStorage.getItem('dbConfig') || '{}');
    if (savedDbConfig.url && savedDbConfig.key) {
      // Verify connection before setting isConnected to true
      fetch(`${savedDbConfig.url}/rest/v1/`, {
        headers: {
          'apikey': savedDbConfig.key,
          'Authorization': `Bearer ${savedDbConfig.key}`
        }
      }).then(res => {
        if (res.ok) {
          const client = createClient(savedDbConfig.url, savedDbConfig.key);
          setSupabase(client);
          setDbConfig(savedDbConfig);
          setIsConnected(true);
          setCurrentView('login');
          loadFromDatabase(savedDbConfig);
        } else {
          console.error('Database connection failed');
          showNotification('Database connection failed. Please reconfigure.');
        }
      }).catch(err => {
        console.error('Database connection error:', err);
        showNotification('Database connection error. Please reconfigure.');
      });
    }
  }, [loadFromDatabase]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!supabase || !isConnected) return;

    const channels = [];

    // Subscribe to files table changes
    const filesChannel = supabase
      .channel('files-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, (payload) => {
        console.log('Files change detected:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newFile = payload.new;
          setFiles(prev => {
            const studentFiles = prev[newFile.student_id] || [];
            return {
              ...prev,
              [newFile.student_id]: [...studentFiles, newFile]
            };
          });
          // Note: Notification is already handled in handleFileUpload
        } else if (payload.eventType === 'DELETE') {
          const deletedFile = payload.old;
          setFiles(prev => {
            const studentFiles = prev[deletedFile.student_id] || [];
            return {
              ...prev,
              [deletedFile.student_id]: studentFiles.filter(f => f.id !== deletedFile.id)
            };
          });
        }
      })
      .subscribe();
    channels.push(filesChannel);

    // Subscribe to students table changes
    const studentsChannel = supabase
      .channel('students-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, (payload) => {
        console.log('Students change detected:', payload);
        
        if (payload.eventType === 'INSERT') {
          setStudents(prev => [...prev, payload.new]);
          // Note: Notification is already handled in signup process
        } else if (payload.eventType === 'DELETE') {
          setStudents(prev => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .subscribe();
    channels.push(studentsChannel);

    // Subscribe to teachers table changes
    const teachersChannel = supabase
      .channel('teachers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, (payload) => {
        console.log('Teachers change detected:', payload);
        
        if (payload.eventType === 'INSERT') {
          setTeachers(prev => [...prev, payload.new]);
          // Note: Notification is already handled in signup process
        } else if (payload.eventType === 'DELETE') {
          setTeachers(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();
    channels.push(teachersChannel);

    // Subscribe to shares table changes
    const sharesChannel = supabase
      .channel('shares-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shares' }, (payload) => {
        console.log('Shares change detected:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newShare = payload.new;
          setShares(prev => ({
            ...prev,
            [newShare.id]: {
              fileId: newShare.file_id,
              ownerId: newShare.owner_id,
              recipientId: newShare.recipient_id,
            }
          }));
          // Note: Notification is already handled in handleShareFile
        }
      })
      .subscribe();
    channels.push(sharesChannel);

    // Subscribe to comments table changes
    const commentsChannel = supabase
      .channel('comments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
        console.log('Comments change detected:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newComment = payload.new;
          setComments(prev => {
            const fileComments = prev[newComment.file_id] || [];
            return {
              ...prev,
              [newComment.file_id]: [...fileComments, newComment]
            };
          });
          // Note: Notification is already handled in handleAddComment
        }
      })
      .subscribe();
    channels.push(commentsChannel);

    // Subscribe to likes table changes
    const likesChannel = supabase
      .channel('likes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, (payload) => {
        console.log('Likes change detected:', payload);
        
        if (payload.eventType === 'INSERT') {
          const newLike = payload.new;
          setLikes(prev => {
            const fileLikes = prev[newLike.file_id] || [];
            return {
              ...prev,
              [newLike.file_id]: [...fileLikes, newLike.user_id]
            };
          });
          // Note: Notification is already handled in handleLikeFile
        } else if (payload.eventType === 'DELETE') {
          const oldLike = payload.old;
          setLikes(prev => {
            const fileLikes = prev[oldLike.file_id] || [];
            return {
              ...prev,
              [oldLike.file_id]: fileLikes.filter(id => id !== oldLike.user_id)
            };
          });
        }
      })
      .subscribe();
    channels.push(likesChannel);

    // Subscribe to chat messages for real-time updates
    const chatChannel = supabase
      .channel('chat-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        console.log('New chat message received:', payload);
        const newMessage = payload.new;
        
        // Add to local state
        setChatMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) {
            console.log('Duplicate message, ignoring');
            return prev;
          }
          console.log('Adding new message to chat:', newMessage);
          return [...prev, newMessage];
        });
      })
      .subscribe();
    channels.push(chatChannel);

    // Subscribe to notifications table for real-time notifications from OTHER users
    const notificationsChannel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        console.log('New notification received:', payload);
        const newNotif = payload.new;
        
        // Only add notification if it's for the current user
        const targetUserId = currentUser?.role === 'admin' ? currentUser.id : currentUser?.dbId;
        
        if (newNotif.user_id === targetUserId) {
          // Use functional update to check for duplicates
          setNotifications(prev => {
            // Avoid duplicate notifications
            if (prev.some(n => n.id === newNotif.id)) {
              return prev;
            }
            return [{
              id: newNotif.id,
              userId: newNotif.user_id,
              message: newNotif.message,
              type: newNotif.type,
              read: newNotif.read,
              timestamp: newNotif.created_at
            }, ...prev];
          });
        }
      })
      .subscribe();
    channels.push(notificationsChannel);

    // Cleanup subscriptions on unmount
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [supabase, isConnected, currentUser, files, students]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  const sendEmailNotification = (to, subject, message) => {
    console.log(`Email sent to ${to}: ${subject} - ${message}`);
    showNotification(`Email notification sent to ${to}`);
  };

  const addNotification = async (userId, message, type = 'info') => {
    const newNotification = {
      id: crypto.randomUUID(),
      userId,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };
    
    // Add to local state first for immediate UI update
    setNotifications(prev => [...prev, newNotification]);
    
    // Also save to database for persistence
    if (isConnected && supabase) {
      try {
        await supabase.from('notifications').insert({
          user_id: userId,
          message: message,
          type: type,
          read: false,
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error saving notification to database:', error);
      }
    }
  };

  const markNotificationRead = (notifId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  };

  // Mark all chat notifications as read
  const markAllChatNotificationsRead = () => {
    const userId = currentUser?.role === 'admin' ? currentUser?.id : currentUser?.dbId;
    setNotifications(prev => 
      prev.map(n => 
        (n.userId === userId && n.type === 'chat' && !n.read) 
          ? { ...n, read: true } 
          : n
      )
    );
  };

  // Expose function to window for ChatModal to call
  useEffect(() => {
    window.markChatNotificationsRead = markAllChatNotificationsRead;
    return () => {
      delete window.markChatNotificationsRead;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);


  const saveToDatabase = async (endpoint, data, method = 'POST') => {
    try {
      const response = await fetch(`${dbConfig.url}/rest/v1/${endpoint}`, {
        method,
        headers: {
          'apikey': dbConfig.key,
          'Authorization': `Bearer ${dbConfig.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        console.error('Database error:', error);
        const errorMessage = error.message || error.error_description || JSON.stringify(error);
        showNotification(`Error saving to database: ${errorMessage}`);
        return null;
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Database error:', error);
      showNotification('Error saving to database. Check console for details.');
      return null;
    }
  };

  const toggleSignup = async () => {
    const newValue = !signupEnabled;
    setSignupEnabled(newValue);

    if (isConnected) {
      try {
        const settingsRes = await fetch(`${dbConfig.url}/rest/v1/settings?select=id&limit=1`, {
          headers: {
            'apikey': dbConfig.key,
            'Authorization': `Bearer ${dbConfig.key}`
          }
        });
        const settingsData = await settingsRes.json();
        if (settingsData.length > 0) {
          const settingsId = settingsData[0].id;
          saveToDatabase(`settings?id=eq.${settingsId}`, { signup_enabled: newValue }, 'PATCH');
        }
      } catch (error) {
        console.error('Error toggling signup:', error);
        showNotification('Error updating signup status');
      }
    }
    showNotification(`Student signup ${newValue ? 'enabled' : 'disabled'}`);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSignup = async (name, email, password, role = 'student', isAdminCreated = false) => {
    if (!signupEnabled && !isAdminCreated && role === 'student') {
      showNotification('Student signup is currently disabled');
      return false;
    }

    // Check if email already exists in database
    const emailExists = students.find(s => s.email.toLowerCase() === email.toLowerCase()) || 
                       teachers.find(t => t.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      showNotification('Email already exists');
      return false;
    }

    if (!isConnected || !supabase) {
      showNotification('Not connected to database. Cannot create account.');
      return false;
    }

    try {
      // Create auth user via Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        showNotification(`Signup error: ${error.message}`);
        return false;
      }

      // If admin created, the user is created but needs email confirmation
      // OR we can use the user immediately if email is auto-confirmed
      if (data.user) {
        const newUserProfile = {
          user_id: data.user.id,
          name,
          email,
          role,
          dashboard_link: `${window.location.origin}?user=${data.user.id}`,
        };

        const endpoint = role === 'teacher' ? 'teachers' : 'students';
        const saved = await saveToDatabase(endpoint, newUserProfile);

        if (saved && saved.length > 0) {
          if (role === 'teacher') {
            setTeachers(prev => [...prev, saved[0]]);
          } else {
            setStudents(prev => [...prev, saved[0]]);
          }
          
          if (isAdminCreated) {
            // Show credentials to admin so they can share with the user
            showNotification(`${role === 'teacher' ? 'Teacher' : 'Student'} added! Email: ${email}, Password: ${password}`);
          } else {
            showNotification('Signup successful! Please check your email to verify your account.');
          }
          return true;
        } else {
          showNotification('Error creating user profile. Please contact support.');
          return false;
        }
      } else {
        showNotification('This email has already been registered.');
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      showNotification('An error occurred during signup');
      return false;
    }
  };

  const handleLogin = async (email, password) => {
    setIsLoggingIn(true);
    setLoadingProgress(0);
    setLoadingMessage('Connecting...');
    
    if (email === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
      setLoadingMessage('Loading students...');
      setLoadingProgress(10);
      
      const studentsRes = await fetch(`${dbConfig.url}/rest/v1/students?select=*`, {
        headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
      });
      const studentsData = await studentsRes.json();
      setStudents(studentsData || []);
      setLoadingProgress(25);
      
      setLoadingMessage('Loading teachers...');
      const teachersRes = await fetch(`${dbConfig.url}/rest/v1/teachers?select=*`, {
        headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
      });
      const teachersData = await teachersRes.json();
      setTeachers(teachersData || []);
      setLoadingProgress(40);
      
      setLoadingMessage('Loading files...');
      const filesRes = await fetch(`${dbConfig.url}/rest/v1/files?select=*`, {
        headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
      });
      const filesData = await filesRes.json();
      const filesMap = {};
      (filesData || []).forEach(file => {
        if (!filesMap[file.student_id]) filesMap[file.student_id] = [];
        filesMap[file.student_id].push(file);
      });
      setFiles(filesMap);
      setLoadingProgress(55);
      
      setLoadingMessage('Loading comments & likes...');
      const [commentsRes, likesRes, sharesRes] = await Promise.all([
        fetch(`${dbConfig.url}/rest/v1/comments?select=*`, {
          headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
        }),
        fetch(`${dbConfig.url}/rest/v1/likes?select=*`, {
          headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
        }),
        fetch(`${dbConfig.url}/rest/v1/shares?select=*`, {
          headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
        })
      ]);
      
      const [commentsData, likesData, sharesData] = await Promise.all([commentsRes.json(), likesRes.json(), sharesRes.json()]);
      
      const commentsMap = {};
      (commentsData || []).forEach(comment => {
        if (!commentsMap[comment.file_id]) commentsMap[comment.file_id] = [];
        commentsMap[comment.file_id].push(comment);
      });
      setComments(commentsMap);
      
      const likesMap = {};
      (likesData || []).forEach(like => {
        if (!likesMap[like.file_id]) likesMap[like.file_id] = [];
        likesMap[like.file_id].push(like.user_id);
      });
      setLikes(likesMap);
      
      const sharesMap = {};
      (sharesData || []).forEach(share => {
        sharesMap[share.id] = {
          fileId: share.file_id,
          ownerId: share.owner_id,
          recipientId: share.recipient_id,
        };
      });
      setShares(sharesMap);
      setLoadingProgress(75);
      
      setLoadingMessage('Loading chat...');
      const chatRes = await fetch(`${dbConfig.url}/rest/v1/chat_messages?select=*&order=created_at.desc&limit=200`, {
        headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
      });
      const chatData = await chatRes.json();
      setChatMessages(chatData || []);
      setLoadingProgress(90);
      
      if (supabase) {
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', 'admin_001')
          .order('created_at', { ascending: false })
          .limit(50)
          .then(({ data: notifData }) => {
            if (notifData && notifData.length > 0) {
              const loadedNotifications = notifData.map(n => ({
                id: n.id,
                userId: n.user_id,
                message: n.message,
                type: n.type,
                read: n.read,
                timestamp: n.created_at
              }));
              setNotifications(loadedNotifications);
            }
          });
      }
      
      setLoadingProgress(100);
      setTimeout(() => {
        setCurrentUser(ADMIN_ACCOUNT);
        setCurrentView('admin');
        showNotification('Welcome Administrator!');
        setIsLoggingIn(false);
        setLoadingProgress(0);
        setLoadingMessage('');
      }, 300);
      
      return;
    }

    if (isConnected && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        showNotification(`Login error: ${error.message}`);
        setIsLoggingIn(false);
        return;
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          setShowUnverifiedEmailNotification(false);
          setUnverifiedEmail('');
          const userRole = data.user.user_metadata.role || 'student';
          
          const user = {
            id: data.user.id,
            name: data.user.user_metadata.name,
            email: data.user.email,
            role: userRole,
          };

          setCurrentUser(user);
          if (userRole === 'teacher') {
            setCurrentView('teacher');
          } else {
            setCurrentView('dashboard');
          }
          showNotification(`Welcome back, ${user.name}!`);

          if (userRole === 'teacher') {
            setLoadingMessage('Loading your profile...');
            setLoadingProgress(10);
            
            const teachersRes = await fetch(`${dbConfig.url}/rest/v1/teachers?email=eq.${encodeURIComponent(email)}&select=*`, {
              headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
            });
            const teachersData = await teachersRes.json();
            if (teachersData && teachersData.length > 0) {
              user.dbId = teachersData[0].id;
              user.dashboard_link = teachersData[0].dashboard_link;
              setCurrentUser({ ...user });
            }
            
            setLoadingMessage('Loading students...');
            setLoadingProgress(25);
            const studentsRes = await fetch(`${dbConfig.url}/rest/v1/students?select=*`, {
              headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
            });
            const studentsData = await studentsRes.json();
            setStudents(studentsData || []);
            
            setLoadingMessage('Loading files...');
            setLoadingProgress(40);
            const filesRes = await fetch(`${dbConfig.url}/rest/v1/files?select=*`, {
              headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
            });
            const allFilesData = await filesRes.json();
            const filesMap = {};
            (allFilesData || []).forEach(file => {
              if (!filesMap[file.student_id]) filesMap[file.student_id] = [];
              filesMap[file.student_id].push(file);
            });
            setFiles(filesMap);
            
            setLoadingMessage('Loading shares...');
            setLoadingProgress(55);
            const sharesRes = await fetch(`${dbConfig.url}/rest/v1/shares?select=*`, {
              headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
            });
            const sharesData = await sharesRes.json();
            const sharesMap = {};
            (sharesData || []).forEach(share => {
              sharesMap[share.id] = {
                fileId: share.file_id,
                ownerId: share.owner_id,
                recipientId: share.recipient_id,
              };
            });
            setShares(sharesMap);
            
            setLoadingMessage('Loading comments & likes...');
            setLoadingProgress(70);
            const [commentsRes, likesRes] = await Promise.all([
              fetch(`${dbConfig.url}/rest/v1/comments?select=*`, {
                headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
              }),
              fetch(`${dbConfig.url}/rest/v1/likes?select=*`, {
                headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
              })
            ]);
            const [commentsData, likesData] = await Promise.all([commentsRes.json(), likesRes.json()]);
            const commentsMap = {};
            (commentsData || []).forEach(comment => {
              if (!commentsMap[comment.file_id]) commentsMap[comment.file_id] = [];
              commentsMap[comment.file_id].push(comment);
            });
            setComments(commentsMap);
            
            const likesMap = {};
            (likesData || []).forEach(like => {
              if (!likesMap[like.file_id]) likesMap[like.file_id] = [];
              likesMap[like.file_id].push(like.user_id);
            });
            setLikes(likesMap);
            
            setLoadingMessage('Loading chat...');
            setLoadingProgress(85);
            const chatRes = await fetch(`${dbConfig.url}/rest/v1/chat_messages?select=*&order=created_at.desc&limit=200`, {
              headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
            });
            const privateChatRes = await fetch(`${dbConfig.url}/rest/v1/chat_messages?or=(sender_id.eq.${user.dbId},recipient_id.eq.${user.dbId})&select=*&order=created_at.desc&limit=100`, {
              headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
            });
            const chatData = await chatRes.json();
            const privateChatData = await privateChatRes.json();
            const allChatData = [...(chatData || []), ...(privateChatData || [])];
            const uniqueChatData = allChatData.filter((v,i,a)=>a.findIndex(t=>(t.id===v.id))===i).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
            setChatMessages(uniqueChatData);
            
            setLoadingProgress(95);
            
            if (supabase && user.dbId) {
              supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.dbId)
                .order('created_at', { ascending: false })
                .limit(50)
                .then(({ data: notifData }) => {
                  if (notifData && notifData.length > 0) {
                    const loadedNotifications = notifData.map(n => ({
                      id: n.id,
                      userId: n.user_id,
                      message: n.message,
                      type: n.type,
                      read: n.read,
                      timestamp: n.created_at
                    }));
                    setNotifications(loadedNotifications);
                  }
                });
            }
            
            setLoadingProgress(100);
            setTimeout(() => {
              setLoadingProgress(0);
              setLoadingMessage('');
              setIsLoggingIn(false);
            }, 300);
          } else {
            const [studentsRes, teachersRes] = await Promise.all([
              fetch(`${dbConfig.url}/rest/v1/students?select=*`, {
                headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
              }),
              fetch(`${dbConfig.url}/rest/v1/teachers?select=*`, {
                headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
              })
            ]);
            const [allStudentsData, teachersData] = await Promise.all([studentsRes.json(), teachersRes.json()]);
            
            const studentsData = allStudentsData.filter(s => s.email === email);
            setStudents(allStudentsData || []);
            setTeachers(teachersData || []);
            
            if (studentsData && studentsData.length > 0) {
              user.dbId = studentsData[0].id;
              user.dashboard_link = studentsData[0].dashboard_link;
              setCurrentUser({ ...user });
              
              setLoadingMessage('Loading your files...');
              setLoadingProgress(25);
              const userFilesRes = await fetch(`${dbConfig.url}/rest/v1/files?student_id=eq.${user.dbId}&select=*&order=created_at.desc`, {
                headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
              });
              const userFilesData = await userFilesRes.json();
              
              const filesMap = {};
              filesMap[user.dbId] = userFilesData || [];
              setFiles(filesMap);
              
              setLoadingMessage('Loading shared files...');
              setLoadingProgress(45);
              const sharesRes = await fetch(`${dbConfig.url}/rest/v1/shares?recipient_id=eq.${user.dbId}&select=*`, {
                headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
              });
              const sharesData = await sharesRes.json();
              const sharesMap = {};
              (sharesData || []).forEach(share => {
                sharesMap[share.id] = {
                  fileId: share.file_id,
                  ownerId: share.owner_id,
                  recipientId: share.recipient_id,
                };
              });
              setShares(sharesMap);
              
              setLoadingMessage('Loading comments & likes...');
              setLoadingProgress(65);
              if (userFilesData && userFilesData.length > 0) {
                const fileIds = userFilesData.map(f => f.id).join(',');
                const [commentsRes, likesRes] = await Promise.all([
                  fetch(`${dbConfig.url}/rest/v1/comments?file_id=in.(${fileIds})&select=*`, {
                    headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
                  }),
                  fetch(`${dbConfig.url}/rest/v1/likes?file_id=in.(${fileIds})&select=*`, {
                    headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
                  })
                ]);
                const [commentsData, likesData] = await Promise.all([commentsRes.json(), likesRes.json()]);
                
                const commentsMap = {};
                (commentsData || []).forEach(comment => {
                  if (!commentsMap[comment.file_id]) commentsMap[comment.file_id] = [];
                  commentsMap[comment.file_id].push(comment);
                });
                setComments(commentsMap);
                
                const likesMap = {};
                (likesData || []).forEach(like => {
                  if (!likesMap[like.file_id]) likesMap[like.file_id] = [];
                  likesMap[like.file_id].push(like.user_id);
                });
                setLikes(likesMap);
              }
              
              setLoadingMessage('Loading chat...');
              setLoadingProgress(85);
              const chatRes = await fetch(`${dbConfig.url}/rest/v1/chat_messages?select=*&order=created_at.desc&limit=200`, {
                headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
              });
              const privateChatRes = await fetch(`${dbConfig.url}/rest/v1/chat_messages?or=(sender_id.eq.${user.dbId},recipient_id.eq.${user.dbId})&select=*&order=created_at.desc&limit=100`, {
                headers: { 'apikey': dbConfig.key, 'Authorization': `Bearer ${dbConfig.key}` }
              });
              const chatData = await chatRes.json();
              const privateChatData = await privateChatRes.json();
              const allChatData = [...(chatData || []), ...(privateChatData || [])];
              const uniqueChatData = allChatData.filter((v,i,a)=>a.findIndex(t=>(t.id===v.id))===i).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
              setChatMessages(uniqueChatData);
              
              if (supabase && user.dbId) {
                supabase
                  .from('notifications')
                  .select('*')
                  .eq('user_id', user.dbId)
                  .order('created_at', { ascending: false })
                  .limit(50)
                  .then(({ data: notifData }) => {
                    if (notifData && notifData.length > 0) {
                      const loadedNotifications = notifData.map(n => ({
                        id: n.id,
                        userId: n.user_id,
                        message: n.message,
                        type: n.type,
                        read: n.read,
                        timestamp: n.created_at
                      }));
                      setNotifications(loadedNotifications);
                    }
                  });
              }
              }
            }
            
            setLoadingProgress(100);
            setTimeout(() => {
              setLoadingProgress(0);
              setLoadingMessage('');
              setIsLoggingIn(false);
            }, 300);
          } else {
          setUnverifiedEmail(email);
          setShowUnverifiedEmailNotification(true);
          setIsLoggingIn(false);
        }
      }
    } else {
      showNotification('Invalid credentials. Please try again.');
      setIsLoggingIn(false);
    }
  };

  const handleResendVerification = async (email) => {
    if (!supabase) return;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) {
      showNotification(`Error resending verification: ${error.message}`);
    } else {
      showNotification('A new verification email has been sent.');
    }
  };

  // Magic Link Login
  const handleMagicLink = async (email) => {
    if (!supabase) {
      showNotification('Not connected to database');
      return;
    }
    if (!email) {
      showNotification('Please enter your email address');
      return;
    }
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    
    if (error) {
      showNotification(`Error: ${error.message}`);
    } else {
      showNotification('Magic link sent! Check your email to log in.');
    }
  };

  // Invite User (Admin feature) - creates user directly without email verification
  const handleInviteUser = async (email, role = 'student') => {
    if (!supabase || !isConnected) {
      showNotification('Not connected to database');
      return false;
    }
    
    // Generate a random password for the invited user
    const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
    
    // Create user via signup (which will work if we disable confirmation or if it's auto-confirmed)
    const { data, error } = await supabase.auth.signUp({
      email,
      password: randomPassword,
      options: {
        data: { role },
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (error) {
      // If signup fails (e.g., email already exists), try to get the user
      if (error.message.includes('already been registered')) {
        showNotification('User already exists with this email');
      } else {
        showNotification(`Error: ${error.message}`);
      }
      return false;
    }
    
    if (data.user) {
      // Create profile in database
      const newUserProfile = {
        user_id: data.user.id,
        email,
        name: email.split('@')[0], // Use email prefix as name
        role,
        dashboard_link: `${window.location.origin}?user=${data.user.id}`,
      };
      
      const endpoint = role === 'teacher' ? 'teachers' : 'students';
      const saved = await saveToDatabase(endpoint, newUserProfile);
      
      if (saved && saved.length > 0) {
        if (role === 'teacher') {
          setTeachers(prev => [...prev, saved[0]]);
        } else {
          setStudents(prev => [...prev, saved[0]]);
        }
        showNotification(`Invited ${email}! Password: ${randomPassword} (share with user)`);
        return true;
      }
    }
    
    showNotification('Failed to invite user');
    return false;
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student account? This action cannot be undone.')) {
      if (isConnected) {
        await fetch(`${dbConfig.url}/rest/v1/students?id=eq.${studentId}`, {
          method: 'DELETE',
          headers: {
            'apikey': dbConfig.key,
            'Authorization': `Bearer ${dbConfig.key}`
          }
        });
        await fetch(`${dbConfig.url}/rest/v1/files?student_id=eq.${studentId}`, {
          method: 'DELETE',
          headers: {
            'apikey': dbConfig.key,
            'Authorization': `Bearer ${dbConfig.key}`
          }
        });
      }
      
      const updatedStudents = students.filter(s => s.id !== studentId);
      const updatedFiles = { ...files };
      delete updatedFiles[studentId];
      setStudents(updatedStudents);
      setFiles(updatedFiles);
      showNotification('Student account deleted successfully');
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher account? This action cannot be undone.')) {
      if (isConnected) {
        await fetch(`${dbConfig.url}/rest/v1/teachers?id=eq.${teacherId}`, {
          method: 'DELETE',
          headers: {
            'apikey': dbConfig.key,
            'Authorization': `Bearer ${dbConfig.key}`
          }
        });
      }
      
      const updatedTeachers = teachers.filter(t => t.id !== teacherId);
      setTeachers(updatedTeachers);
      showNotification('Teacher account deleted successfully');
    }
  };

  const handleFileUpload = async (studentId, file, type) => {
    // Check file size (limit to 15GB for Supabase storage)
    const maxSize = 15 * 1024 * 1024 * 1024; // 15GB
    if (file.size > maxSize) {
      showNotification('File too large! Maximum size is 15GB');
      return;
    }

    // Validate file type matches the selected category
    const mimeType = file.type.toLowerCase();
    const validTypes = {
      video: ['video/'],
      image: ['image/'],
      audio: ['audio/'],
      text: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'application/json']
    };
    const validExtensions = {
      video: ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.m4v'],
      image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'],
      audio: ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma'],
      text: ['.pdf', '.doc', '.docx', '.txt', '.md', '.json']
    };
    
    const allowedMimes = validTypes[type] || [];
    const allowedExts = validExtensions[type] || [];
    const hasValidMime = allowedMimes.some(m => mimeType.startsWith(m));
    const hasValidExt = allowedExts.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidMime && !hasValidExt) {
      showNotification(`Invalid file type for ${type}. Please select a valid ${type} file.`);
      return;
    }

    // Determine file type based on MIME type
    let fileType = type;
    if (mimeType.startsWith('video/')) fileType = 'video';
    else if (mimeType.startsWith('image/')) fileType = 'image';
    else if (mimeType.startsWith('audio/')) fileType = 'audio';
    else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) fileType = 'text';

    // Use the dbId from currentUser (already the correct student ID)
    const actualStudentId = currentUser.dbId;
    if (!actualStudentId) {
      showNotification('Error: Student profile not found. Please contact admin.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const newFile = {
        student_id: actualStudentId,
        name: file.name,
        type: fileType,
        upload_date: new Date().toLocaleDateString(),
        size: (file.size / 1024).toFixed(2) + ' KB',
        data: e.target.result,
        mime_type: file.type,
        created_at: new Date().toISOString()
      };

      if (isConnected) {
        showNotification('Uploading file...');
        const saved = await saveToDatabase('files', newFile);
        if (saved && saved.length > 0) {
          newFile.id = saved[0].id;
          const updatedFiles = {
            ...files,
            [actualStudentId]: [...(files[actualStudentId] || []), newFile]
          };
          setFiles(updatedFiles);
          
          addNotification('admin_001', `New file uploaded by ${currentUser.name}: ${file.name}`, 'upload');
          sendEmailNotification('admin@school.com', 'New File Upload', `${currentUser.name} uploaded ${file.name}`);
          
          showNotification('File uploaded successfully!');
        }
      } else {
        showNotification('Error: Not connected to database. Please configure Supabase first.');
      }
    };
    reader.onerror = () => {
      showNotification('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  // Chat functions
  const handleSendMessage = async (messageText, recipient, sender) => {
    if (!isConnected) {
      showNotification('Not connected to database');
      return;
    }

    // Determine if this is a general chat message
    const isGeneral = !recipient || recipient.id === 'general';
    const senderId = sender.id || sender.dbId;

    console.log('Sending message:', { messageText, recipient, isGeneral, senderId });

    const newMessage = {
      sender_id: senderId,
      sender_name: sender.name,
      sender_role: sender.role,
      recipient_id: isGeneral ? null : recipient.id,
      recipient_name: isGeneral ? null : recipient.name,
      recipient_role: isGeneral ? null : recipient.role,
      message_type: 'text',
      message: messageText,
      is_general: isGeneral,
      created_at: new Date().toISOString()
    };

    console.log('New message object:', newMessage);

    const saved = await saveToDatabase('chat_messages', newMessage);
    if (saved && saved.length > 0) {
      console.log('Message saved successfully:', saved[0]);
      setChatMessages(prev => {
        const newMessages = [...prev, saved[0]];
        console.log('Chat messages updated, total:', newMessages.length);
        return newMessages;
      });
      
      // Send notifications for private messages
      if (!isGeneral && recipient && recipient.id !== 'general') {
        const notificationMessage = `${sender.name} sent you a message: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`;
        await addNotification(recipient.id, notificationMessage, 'chat');
        sendEmailNotification(
          recipient.email, 
          'New Chat Message', 
          `${sender.name} sent you a message: ${messageText}`
        );
      }
    }
  };

  const handleSendAudio = async (audioData, recipient, sender) => {
    if (!isConnected) {
      showNotification('Not connected to database');
      return;
    }

    const isGeneral = recipient?.id === 'general' || !recipient;
    const senderId = sender.id || sender.dbId;

    const newMessage = {
      sender_id: senderId,
      sender_name: sender.name,
      sender_role: sender.role,
      recipient_id: isGeneral ? null : recipient.id,
      recipient_name: isGeneral ? null : recipient.name,
      recipient_role: isGeneral ? null : recipient.role,
      message_type: 'audio',
      message: 'Voice message',
      audio_data: audioData,
      is_general: isGeneral,
      created_at: new Date().toISOString()
    };

    const saved = await saveToDatabase('chat_messages', newMessage);
    if (saved && saved.length > 0) {
      setChatMessages(prev => [...prev, saved[0]]);
      
      // Send notifications for private messages
      if (!isGeneral && recipient && recipient.id !== 'general') {
        const notificationMessage = `${sender.name} sent you a voice message`;
        await addNotification(recipient.id, notificationMessage, 'chat');
        sendEmailNotification(
          recipient.email, 
          'New Voice Message', 
          `${sender.name} sent you a voice message`
        );
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!isConnected) return;
    
    await fetch(`${dbConfig.url}/rest/v1/chat_messages?id=eq.${messageId}`, {
      method: 'DELETE',
      headers: {
        'apikey': dbConfig.key,
        'Authorization': `Bearer ${dbConfig.key}`
      }
    });
    
    setChatMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const handleDeleteFile = async (studentId, fileId) => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      if (isConnected) {
        await fetch(`${dbConfig.url}/rest/v1/files?id=eq.${fileId}`, {
          method: 'DELETE',
          headers: {
            'apikey': dbConfig.key,
            'Authorization': `Bearer ${dbConfig.key}`
          }
        });
        
        // Also delete related likes and comments
        await fetch(`${dbConfig.url}/rest/v1/likes?file_id=eq.${fileId}`, {
          method: 'DELETE',
          headers: {
            'apikey': dbConfig.key,
            'Authorization': `Bearer ${dbConfig.key}`
          }
        });
        await fetch(`${dbConfig.url}/rest/v1/comments?file_id=eq.${fileId}`, {
          method: 'DELETE',
          headers: {
            'apikey': dbConfig.key,
            'Authorization': `Bearer ${dbConfig.key}`
          }
        });
        await fetch(`${dbConfig.url}/rest/v1/shares?file_id=eq.${fileId}`, {
          method: 'DELETE',
          headers: {
            'apikey': dbConfig.key,
            'Authorization': `Bearer ${dbConfig.key}`
          }
        });
        
        // Update local state
        const studentFiles = files[studentId] || [];
        const updatedFiles = {
          ...files,
          [studentId]: studentFiles.filter(f => f.id !== fileId)
        };
        setFiles(updatedFiles);
        showNotification('File deleted successfully!');
      } else {
        showNotification('Error: Not connected to database. File not deleted.');
      }
    }
  };

  const handleAddComment = async (fileId, comment) => {
    const newComment = {
      file_id: fileId,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role,
      text: comment,
    };

    if (isConnected) {
      const saved = await saveToDatabase('comments', newComment);
      if (saved && saved.length > 0) {
        setComments(prev => ({
          ...prev,
          [fileId]: [...(prev[fileId] || []), saved[0]]
        }));

        const file = Object.values(files).flat().find(f => f.id === fileId);
        if (file && currentUser.role === 'teacher') {
          const student = students.find(s => s.id === file.student_id);
          if (student) {
            addNotification(student.id, `${currentUser.name} commented on your file: ${file.name}`, 'comment');
            sendEmailNotification(student.email, 'New Comment on Your File', `${currentUser.name} commented: "${comment}"`);
          }
        }
        showNotification('Comment added successfully!');
      }
    } 
  };

  const handleLikeFile = async (fileId) => {
    const currentLikes = likes[fileId] || [];
    const hasLiked = currentLikes.includes(currentUser.id);

    if (isConnected) {
      if (hasLiked) {
        await fetch(`${dbConfig.url}/rest/v1/likes?file_id=eq.${fileId}&user_id=eq.${currentUser.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': dbConfig.key,
            'Authorization': `Bearer ${dbConfig.key}`
          }
        });
        setLikes(prev => ({
          ...prev,
          [fileId]: currentLikes.filter(id => id !== currentUser.id)
        }));
      } else {
        const saved = await saveToDatabase('likes', { file_id: fileId, user_id: currentUser.id });
        if (saved && saved.length > 0) {
          setLikes(prev => ({
            ...prev,
            [fileId]: [...currentLikes, currentUser.id]
          }));
        }
      }
    } 

    const file = Object.values(files).flat().find(f => f.id === fileId);
    // For students: check if they own the file to skip self-notification
    // For teachers: always notify the student
    const isOwnFile = currentUser.role === 'student' && file?.student_id === currentUser.dbId;
    if (file && !isOwnFile && !hasLiked) {
      const student = students.find(s => s.id === file.student_id);
      if (student) {
        addNotification(student.id, `${currentUser.name} liked your file: ${file.name}`, 'like');
      }
    }
  };

  const handleShareFile = async (fileId, recipientIds) => {
    const file = Object.values(files).flat().find(f => f.id === fileId);
    if (!file) return;

    if (isConnected) {
      const sharesToSave = recipientIds.map(recipientId => ({
        file_id: fileId,
        owner_id: file.student_id,
        recipient_id: recipientId,
      }));
      const saved = await saveToDatabase('shares', sharesToSave);
      if (saved && saved.length > 0) {
        setShares(prev => {
          const newShares = { ...prev };
          saved.forEach(share => {
            newShares[share.id] = {
              fileId: share.file_id,
              ownerId: share.owner_id,
              recipientId: share.recipient_id,
            };
          });
          return newShares;
        });
      }
    } 

    recipientIds.forEach(recipientId => {
      const recipient = students.find(s => s.id === recipientId);
      if (recipient) {
        addNotification(recipientId, `${currentUser.name} shared a file with you: ${file.name}`, 'share');
        sendEmailNotification(recipient.email, 'File Shared With You', `${currentUser.name} shared ${file.name} with you`);
      }
    });

    showNotification('File shared successfully!');
    setShowShareModal(false);
    setSelectedFileForShare(null);
  };

  // Teacher sends file to students
  const handleSendFileToStudents = async (file, recipientIds, note) => {
    if (!isConnected) {
      showNotification('Not connected to database');
      return;
    }

    // Validate file type
    const mimeType = file.type.toLowerCase();
    const validExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.m4v', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma', '.pdf', '.doc', '.docx', '.txt', '.md'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidExt) {
      showNotification('Invalid file type. Please select a video, image, audio, or document file.');
      return;
    }

    // Determine file type
    let fileType = 'text';
    if (mimeType.startsWith('video/')) fileType = 'video';
    else if (mimeType.startsWith('image/')) fileType = 'image';
    else if (mimeType.startsWith('audio/')) fileType = 'audio';

    const reader = new FileReader();
    reader.onload = async (e) => {
      // Create file records for each recipient
      const filesToSave = recipientIds.map(recipientId => ({
        student_id: recipientId,
        name: file.name,
        type: fileType,
        upload_date: new Date().toLocaleDateString(),
        size: (file.size / 1024).toFixed(2) + ' KB',
        data: e.target.result,
        mime_type: file.type,
        created_at: new Date().toISOString(),
        note: note || '',
        sent_by_teacher: true,
        teacher_id: currentUser.dbId,
      }));

      const saved = await saveToDatabase('files', filesToSave);
      
      if (saved && saved.length > 0) {
        // Update local files state
        const updatedFiles = { ...files };
        saved.forEach((newFile, index) => {
          const recipientId = recipientIds[index];
          if (!updatedFiles[recipientId]) {
            updatedFiles[recipientId] = [];
          }
          updatedFiles[recipientId].push(newFile);
        });
        setFiles(updatedFiles);

        // Send notifications to recipients
        recipientIds.forEach(recipientId => {
          const recipient = students.find(s => s.id === recipientId);
          if (recipient) {
            const message = note 
              ? `${currentUser.name} sent you a file: ${file.name}. Note: ${note}`
              : `${currentUser.name} sent you a file: ${file.name}`;
            addNotification(recipientId, message, 'teacher_file');
            sendEmailNotification(recipient.email, 'New File From Teacher', message);
          }
        });

        showNotification(`File sent to ${recipientIds.length} student${recipientIds.length !== 1 ? 's' : ''}!`);
      } else {
        showNotification('Error sending file');
      }
    };
    reader.readAsDataURL(file);
  };



  return (
    <>
      <Notification notification={notification} darkMode={darkMode} />
      <NotificationPanel
        showNotificationPanel={showNotificationPanel}
        setShowNotificationPanel={setShowNotificationPanel}
        notifications={notifications}
        currentUser={currentUser}
        markNotificationRead={markNotificationRead}
        darkMode={darkMode}
        setShowChat={setShowChat}
      />
      <ShareModal
        showShareModal={showShareModal}
        setShowShareModal={setShowShareModal}
        selectedFileForShare={selectedFileForShare}
        setSelectedFileForShare={setSelectedFileForShare}
        students={students}
        currentUser={currentUser}
        handleShareFile={handleShareFile}
        darkMode={darkMode}
      />
      <SendFileModal
        showSendFileModal={showSendFileModal}
        setShowSendFileModal={setShowSendFileModal}
        students={students}
        handleSendFileToStudents={handleSendFileToStudents}
        darkMode={darkMode}
      />
      <AddStudentModal
        showAddStudentModal={showAddStudentModal}
        setShowAddStudentModal={setShowAddStudentModal}
        handleSignup={handleSignup}
        showNotification={showNotification}
        darkMode={darkMode}
      />
      <AddTeacherModal
        showAddTeacherModal={showAddTeacherModal}
        setShowAddTeacherModal={setShowAddTeacherModal}
        handleSignup={handleSignup}
        showNotification={showNotification}
        darkMode={darkMode}
      />
      
      {currentView === 'setup' && <DatabaseSetup 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        showNotification={showNotification}
        setSupabase={setSupabase}
        setDbConfig={setDbConfig}
        setIsConnected={setIsConnected}
        loadFromDatabase={loadFromDatabase}
        setCurrentView={setCurrentView}
      />}
      {currentView === 'login' && (
        <>
          {isLoggingIn && loadingProgress > 0 && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl p-6 w-80 max-w-[90vw]`}>
                <div className="text-center mb-4">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-900' : 'bg-indigo-100'}`}>
                    <svg className="animate-spin w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Loading...</h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{loadingMessage}</p>
                </div>
                <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p className={`text-center text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{loadingProgress}%</p>
              </div>
            </div>
          )}
          <LoginPage
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            showNotification={showNotification}
            signupEnabled={signupEnabled}
            handleSignup={handleSignup}
            handleLogin={handleLogin}
            handleResendVerification={handleResendVerification}
            handleMagicLink={handleMagicLink}
            showUnverifiedEmailNotification={showUnverifiedEmailNotification}
            unverifiedEmail={unverifiedEmail}
            isLoggingIn={isLoggingIn}
          />}
        </>
      )}
      {currentView === 'dashboard' && <StudentDashboard
        currentUser={currentUser}
        files={files}
        shares={shares}
        notifications={notifications}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        setShowNotificationPanel={setShowNotificationPanel}
        setCurrentUser={setCurrentUser}
        setCurrentView={setCurrentView}
        handleFileUpload={handleFileUpload}
        handleDeleteFile={handleDeleteFile}
        comments={comments}
        likes={likes}
        handleLikeFile={handleLikeFile}
        handleAddComment={handleAddComment}
        setSelectedFileForShare={setSelectedFileForShare}
        setShowShareModal={setShowShareModal}
        students={students}
        showChat={showChat}
        setShowChat={setShowChat}
      />}
      {currentView === 'teacher' && <TeacherDashboard
        currentUser={currentUser}
        students={students}
        files={files}
        shares={shares}
        notifications={notifications}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        setShowNotificationPanel={setShowNotificationPanel}
        setCurrentUser={setCurrentUser}
        setCurrentView={setCurrentView}
        comments={comments}
        likes={likes}
        handleLikeFile={handleLikeFile}
        handleAddComment={handleAddComment}
        setSelectedFileForShare={setSelectedFileForShare}
        setShowShareModal={setShowShareModal}
        setShowSendFileModal={setShowSendFileModal}
        handleSendFileToStudents={handleSendFileToStudents}
        showChat={showChat}
        setShowChat={setShowChat}
      />}
      {currentView === 'admin' && <AdminDashboard
        currentUser={currentUser}
        students={students}
        teachers={teachers}
        files={files}
        shares={shares}
        notifications={notifications}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        setShowNotificationPanel={setShowNotificationPanel}
        setCurrentUser={setCurrentUser}
        setCurrentView={setCurrentView}
        signupEnabled={signupEnabled}
        toggleSignup={toggleSignup}
        isConnected={isConnected}
        setShowAddStudentModal={setShowAddStudentModal}
        setShowAddTeacherModal={setShowAddTeacherModal}
        handleDeleteStudent={handleDeleteStudent}
        handleDeleteTeacher={handleDeleteTeacher}
        comments={comments}
        likes={likes}
        handleLikeFile={handleLikeFile}
        handleAddComment={handleAddComment}
        handleInviteUser={handleInviteUser}
        setSelectedFileForShare={setSelectedFileForShare}
        setShowShareModal={setShowShareModal}
        showChat={showChat}
        setShowChat={setShowChat}
      />}

      {/* Chat Modal */}
      <ChatModal
        showChat={showChat}
        setShowChat={setShowChat}
        currentUser={currentUser}
        students={students}
        teachers={teachers}
        admin={ADMIN_ACCOUNT}
        chatMessages={chatMessages}
        darkMode={darkMode}
        handleSendMessage={handleSendMessage}
        handleSendAudio={handleSendAudio}
        handleDeleteMessage={handleDeleteMessage}
        isConnected={isConnected}
        supabase={supabase}
      />
    </>
  );
};

export default App;
