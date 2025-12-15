import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { Layout } from './components/Layout';
import { UserRole } from './types';

// Lazy load pages for code splitting to resolve chunk size warnings
const Login = React.lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Download = React.lazy(() => import('./pages/Download').then(module => ({ default: module.Download })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Students = React.lazy(() => import('./pages/Students').then(module => ({ default: module.Students })));
const Classes = React.lazy(() => import('./pages/Classes').then(module => ({ default: module.Classes })));
const Subjects = React.lazy(() => import('./pages/Subjects').then(module => ({ default: module.Subjects })));
const Exams = React.lazy(() => import('./pages/Exams').then(module => ({ default: module.Exams })));
const Results = React.lazy(() => import('./pages/Results').then(module => ({ default: module.Results })));
const Finance = React.lazy(() => import('./pages/Finance').then(module => ({ default: module.Finance })));
const Timetable = React.lazy(() => import('./pages/Timetable').then(module => ({ default: module.Timetable })));
const Attendance = React.lazy(() => import('./pages/Attendance').then(module => ({ default: module.Attendance })));
const Settings = React.lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Teachers = React.lazy(() => import('./pages/Teachers').then(module => ({ default: module.Teachers })));
const SchoolCalendar = React.lazy(() => import('./pages/SchoolCalendar').then(module => ({ default: module.SchoolCalendar })));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
     <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-primary-600"></div>
  </div>
);

const ProtectedRoute = ({ allowedRoles, children }: any) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children ? children : <Outlet />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/download" element={<Download />} />
        
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
    </Suspense>
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