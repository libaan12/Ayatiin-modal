import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { Layout } from './components/Layout';
import { UserRole } from './types';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Classes } from './pages/Classes';
import { Subjects } from './pages/Subjects';
import { Exams } from './pages/Exams';
import { Results } from './pages/Results';
import { Finance } from './pages/Finance';
import { Timetable } from './pages/Timetable';
import { Attendance } from './pages/Attendance';
import { Settings } from './pages/Settings';
import { Teachers } from './pages/Teachers';
import { SchoolCalendar } from './pages/SchoolCalendar';

const ProtectedRoute = ({ allowedRoles, children }: any) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600 font-medium">Loading Application...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children ? children : <Outlet />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><Layout user={user} role={user?.role}><Outlet /></Layout></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        
        <Route path="students" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.TEACHER, UserRole.FINANCE]}><Students /></ProtectedRoute>} />
        <Route path="classes" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}><Classes /></ProtectedRoute>} />
        <Route path="subjects" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><Subjects /></ProtectedRoute>} />
        <Route path="exams" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}><Exams /></ProtectedRoute>} />
        <Route path="results" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}><Results /></ProtectedRoute>} />
        <Route path="finance" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.FINANCE]}><Finance /></ProtectedRoute>} />
        <Route path="timetable" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}><Timetable /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}><Attendance /></ProtectedRoute>} />
        <Route path="teachers" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><Teachers /></ProtectedRoute>} />
        <Route path="calendar" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.TEACHER, UserRole.FINANCE]}><SchoolCalendar /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><Settings /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;