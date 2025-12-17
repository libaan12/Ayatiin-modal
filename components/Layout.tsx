import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icons } from './Icons';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../hooks/useFirebase';

export const Layout = ({ children, user, role }: any) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Fetch App Settings for real-time name update
  const { data: settings } = useData<any>('settings');
  const appSettings = settings.find((s:any) => s.id === 'general') || { appName: 'Ayatiin' };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Icons.Dashboard, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.FINANCE] },
    { name: 'Students', path: '/students', icon: Icons.Users, roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.FINANCE] },
    { name: 'Classes', path: '/classes', icon: Icons.Book, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { name: 'Subjects', path: '/subjects', icon: Icons.Book, roles: [UserRole.ADMIN] },
    { name: 'Attendance', path: '/attendance', icon: Icons.CheckCircle, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { name: 'Timetable', path: '/timetable', icon: Icons.Calendar, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { name: 'Teachers', path: '/teachers', icon: Icons.Users, roles: [UserRole.ADMIN] },
    { name: 'Exams', path: '/exams', icon: Icons.GraduationCap, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { name: 'Results', path: '/results', icon: Icons.GraduationCap, roles: [UserRole.ADMIN, UserRole.TEACHER] },
    { name: 'Finance', path: '/finance', icon: Icons.DollarSign, roles: [UserRole.ADMIN, UserRole.FINANCE] },
    { name: 'Settings', path: '/settings', icon: Icons.Settings, roles: [UserRole.ADMIN] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar - Soft Green Background (bg-primary-50) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary-50 text-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col shadow-xl border-r border-primary-100 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar Header - Solid Green (bg-primary-600) to match main header */}
        <div className="flex items-center justify-center h-16 bg-primary-600 shadow-md px-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
             <img src="https://files.catbox.moe/fsno8w.png" alt="Logo" className="h-8 w-8 bg-white rounded-lg p-1" />
             <h1 className="text-lg font-bold tracking-wider text-white truncate">{appSettings.appName}</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 mt-5 overflow-y-auto custom-scrollbar">
          {filteredNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `group flex items-center px-3 py-3 text-sm font-bold rounded-xl transition-all duration-200 mb-1 ${
                isActive 
                  ? 'bg-secondary-600 text-white shadow-lg translate-x-1' 
                  : 'text-slate-600 hover:bg-white hover:text-primary-600 hover:shadow-sm'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${ ({ isActive }:any) => isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-500'}`} />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-primary-100 bg-primary-50 flex-shrink-0">
           <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm font-bold rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200">
            <Icons.LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Solid Green (bg-primary-600) */}
        <header className="flex justify-between items-center h-16 bg-primary-600 shadow-md px-6 z-10 sticky top-0 flex-shrink-0">
          {/* Hamburger Menu - Visible only on mobile */}
          <button className="md:hidden text-primary-100 hover:text-white focus:outline-none p-2 rounded-md hover:bg-primary-700" onClick={() => setSidebarOpen(true)}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Spacer for desktop when hamburger is hidden */}
          <div className="hidden md:block"></div>

          <div className="flex items-center space-x-4 ml-auto">
             <div className="text-right">
               <div className="text-sm font-bold text-white">{user?.displayName || 'User'}</div>
               <div className="text-xs text-primary-200 uppercase font-bold tracking-wide">{role}</div>
             </div>
             <div className="h-10 w-10 rounded-full bg-white/20 p-0.5 shadow-sm border border-white/30">
               <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-primary-700 font-bold overflow-hidden">
                 {(user?.displayName || 'U').charAt(0)}
               </div>
             </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-6 scroll-smooth">
           <div className="max-w-7xl mx-auto pb-10">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
};