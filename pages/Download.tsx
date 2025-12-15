import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';

export const Download = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="https://files.catbox.moe/fsno8w.png" alt="Logo" className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight">Ayatiin</span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors"
          >
            Login to Web Portal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block p-3 rounded-2xl bg-white shadow-xl mb-8 animate-bounce">
            <img src="https://files.catbox.moe/fsno8w.png" alt="App Icon" className="h-20 w-20" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-4">
            Ayatiin <span className="text-primary-600">Model</span>
            <span className="block text-2xl md:text-3xl text-slate-500 font-semibold mt-2">P & S School App</span>
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500">
            Experience the full school management system right in your pocket. Real-time grades, attendance, and notifications for students, parents, and teachers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/ayatin.apk" 
              download
              className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto"
            >
              <Icons.Download className="mr-2 h-6 w-6" />
              Download APK
            </a>
            <button 
               onClick={() => navigate('/login')}
               className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto"
            >
              Access Web Version
            </button>
          </div>
          
          <p className="mt-4 text-xs text-slate-400">
            Version 1.0.0 • Android 8.0+ Required
          </p>
        </div>

        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 opacity-40 pointer-events-none">
           <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
           <div className="absolute top-20 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
           <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                 <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                    <Icons.CheckCircle className="h-6 w-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Track Attendance</h3>
                 <p className="text-slate-500">View daily attendance records and get notified instantly about absence.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                 <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center text-secondary-600 mb-4">
                    <Icons.GraduationCap className="h-6 w-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Exam Results</h3>
                 <p className="text-slate-500">Access report cards and exam performance analytics immediately after release.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                 <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center text-accent-600 mb-4">
                    <Icons.DollarSign className="h-6 w-6" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Fee Management</h3>
                 <p className="text-slate-500">Check outstanding balances and view digital receipts for previous payments.</p>
              </div>
           </div>
        </div>
      </div>

      {/* Install Instructions */}
      <div className="py-16 bg-slate-50">
         <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-8">How to Install</h2>
            <div className="space-y-4">
               <div className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Download the File</h4>
                    <p className="text-sm text-slate-500">Click the "Download APK" button above. You might see a warning that the file might be harmful—this is standard for direct downloads. Click "Download Anyway".</p>
                  </div>
               </div>
               <div className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Open & Install</h4>
                    <p className="text-sm text-slate-500">Open the downloaded `ayatin.apk` file from your notification bar or Downloads folder.</p>
                  </div>
               </div>
               <div className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Enable Permissions</h4>
                    <p className="text-sm text-slate-500">If prompted, enable "Install from Unknown Sources" in your settings for your browser or file manager.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        <p>&copy; {new Date().getFullYear()} Ayatiin Model P & S School. All rights reserved.</p>
      </footer>
    </div>
  );
};