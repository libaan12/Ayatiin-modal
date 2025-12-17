import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Modal } from '../components/UI';
import { useData } from '../hooks/useFirebase';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { updateProfile, createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth';
import { auth, db, firebaseConfig } from '../firebase';
import { ref, update, set } from 'firebase/database';
import { initializeApp } from "firebase/app";
import { UserRole } from '../types';
import { Icons } from '../components/Icons';

export const Settings = () => {
  const navigate = useNavigate();
  const { data: announcements, add: addAnnouncement } = useData<any>('announcements');
  const { data: settings } = useData<any>('settings');
  const { user } = useAuth();
  const { showToast } = useUI();
  
  // App Settings State
  const generalSettings = settings.find((s:any) => s.id === 'general') || { appName: 'Ayatiin' };
  const [appName, setAppName] = useState(generalSettings.appName);

  // Announcement State
  const [msg, setMsg] = useState('');

  // User Profile State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // User Management State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: UserRole.TEACHER });
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
     if (generalSettings.appName) setAppName(generalSettings.appName);
  }, [generalSettings]);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user]);

  const postAnnouncement = async () => {
    if (!msg) return;
    try {
      // 1. Delete all existing announcements from Firebase by setting the node to null
      await set(ref(db, 'announcements'), null);

      // 2. Explicitly clear local storage cache to prevent ghost data
      localStorage.removeItem('ayatiin_cache_announcements');

      // 3. Add new announcement
      await addAnnouncement({ message: msg, date: new Date().toISOString(), active: true });
      
      showToast('Announcement Posted and Updated', 'success');
      setMsg('');
    } catch (e) {
      console.error(e);
      showToast('Error posting announcement', 'error');
    }
  };

  const saveAppProfile = async () => {
    try {
      await set(ref(db, 'settings/general'), {
         id: 'general',
         appName: appName
      });
      showToast('School profile updated', 'success');
    } catch (e) {
      showToast('Error updating profile', 'error');
    }
  };

  const updateUserProfile = async () => {
     if (!auth.currentUser || !displayName) return;
     try {
       await updateProfile(auth.currentUser, { displayName });
       await update(ref(db, `users/${user?.uid}`), { displayName });
       showToast('Profile updated. Refresh to see changes.', 'success');
       setIsEditingProfile(false);
     } catch (e) {
       showToast('Error updating user profile', 'error');
     }
  };

  const handleCreateUser = async () => {
    if(!newUser.email || !newUser.password || !newUser.name) return alert("Fill all fields");
    setCreatingUser(true);
    
    try {
      // 1. Initialize a secondary app instance to avoid logging out the current admin
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      
      // 2. Create the user in Authentication
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, newUser.password);
      const createdUser = userCredential.user;
      
      // 3. Update Profile for the new user (Auth level)
      await updateProfile(createdUser, { displayName: newUser.name });

      // 4. Create User Record in Realtime Database (using main app's db instance which is authorized)
      await set(ref(db, `users/${createdUser.uid}`), {
        displayName: newUser.name,
        email: newUser.email,
        role: newUser.role,
        joinDate: new Date().toISOString()
      });

      // 5. Cleanup secondary app
      await signOut(secondaryAuth); // Ensure we don't keep this session
      
      showToast(`User ${newUser.name} created successfully`, 'success');
      setIsUserModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: UserRole.TEACHER });
    } catch (e: any) {
      console.error(e);
      showToast(`Error: ${e.message}`, 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <Icons.Settings className="mr-3 h-6 w-6 text-slate-600" /> Settings
      </h1>
      
      <div className="grid grid-cols-1 gap-8">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center">
             <div>
                <h3 className="text-lg font-bold text-slate-900">Academic Features</h3>
                <p className="text-sm text-slate-500">Manage school events and holidays.</p>
             </div>
             <Button onClick={() => navigate('/calendar')} variant="secondary">
                <Icons.Calendar className="mr-2 h-4 w-4" /> Manage School Calendar
             </Button>
           </div>
        </div>

        {/* User Management Section (Admin Only) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-start mb-4">
             <div>
                <h3 className="text-lg font-bold text-slate-900">User Management</h3>
                <p className="text-sm text-slate-500">Create new accounts for Teachers, Admins, or Finance staff.</p>
             </div>
             <Button onClick={() => setIsUserModalOpen(true)}><Icons.Plus className="mr-2 h-4 w-4" /> Add User</Button>
           </div>
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600">
              <p><strong>Note:</strong> Creating a user here will generate their login credentials. Please share the email and password with them securely.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* School Profile */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-900 mb-4">School Profile</h3>
             <p className="text-sm text-slate-500 mb-4">This name appears on receipts and the application header.</p>
             <div className="space-y-4">
                <Input label="App / School Name" value={appName} onChange={(e:any) => setAppName(e.target.value)} />
                <Button onClick={saveAppProfile}>Save App Name</Button>
             </div>
          </div>

          {/* User Profile */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-bold text-slate-900 mb-4">Your Profile</h3>
             <div className="space-y-4">
                <Input 
                  label="Display Name" 
                  value={displayName} 
                  onChange={(e:any) => setDisplayName(e.target.value)} 
                  disabled={!isEditingProfile}
                />
                <Input label="Email" value={user?.email} disabled={true} className="bg-slate-50" />
                
                {isEditingProfile ? (
                   <div className="flex gap-2">
                     <Button onClick={updateUserProfile}>Save Changes</Button>
                     <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                   </div>
                ) : (
                   <Button variant="secondary" onClick={() => setIsEditingProfile(true)}>Edit Profile</Button>
                )}
             </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-900 mb-4">Post Announcement</h3>
           <div className="space-y-4">
              <Input label="Message" value={msg} onChange={(e:any) => setMsg(e.target.value)} placeholder="Enter important announcement..." />
              <Button onClick={postAnnouncement}>Post to Dashboard</Button>
           </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Create New User">
         <div className="space-y-4">
            <Input label="Full Name" value={newUser.name} onChange={(e:any) => setNewUser({...newUser, name: e.target.value})} icon={Icons.Users} />
            <Input label="Email" type="email" value={newUser.email} onChange={(e:any) => setNewUser({...newUser, email: e.target.value})} icon={Icons.Mail} />
            <Input label="Password" type="password" value={newUser.password} onChange={(e:any) => setNewUser({...newUser, password: e.target.value})} />
            <Select 
               label="Role" 
               value={newUser.role}
               onChange={(e:any) => setNewUser({...newUser, role: e.target.value})}
               options={[
                  {label: 'Teacher', value: UserRole.TEACHER},
                  {label: 'Finance', value: UserRole.FINANCE},
                  {label: 'Admin', value: UserRole.ADMIN}
               ]}
            />
            <Button onClick={handleCreateUser} className="w-full" disabled={creatingUser}>
               {creatingUser ? 'Creating...' : 'Create User'}
            </Button>
         </div>
      </Modal>
    </div>
  );
};