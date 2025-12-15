import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, CalendarEvent } from '../types';
import { useData } from '../hooks/useFirebase';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);
  
  // Fetch data counts
  const { data: students } = useData('students');
  const { data: teachers } = useData('users'); 
  const { data: announcements } = useData('announcements');
  const { data: events } = useData<CalendarEvent>('calendar_events');

  const teacherCount = teachers.filter((t: any) => t.role === UserRole.TEACHER).length;
  
  // Get latest active announcement
  const activeAnnouncement = announcements.find((a: any) => a.active);

  // Filter and sort upcoming events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter(e => new Date(e.start) >= today)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3); // Top 3

  const getBadgeColor = (type: string) => {
      switch(type) {
        case 'holiday': return 'red';
        case 'exam': return 'indigo';
        default: return 'green';
      }
  };

  return (
    <div className="space-y-6">
      {showBanner && activeAnnouncement && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl p-1 shadow-lg animate-fade-in-down">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex justify-between items-center text-white border border-white/20">
             <div className="flex items-center gap-4">
               <div className="bg-white/20 p-2 rounded-full">
                  <Icons.CheckCircle className="h-6 w-6 text-white" />
               </div>
               <div>
                 <span className="block text-xs font-bold text-primary-100 uppercase tracking-wider mb-0.5">Announcement</span>
                 <span className="font-bold text-lg leading-tight">{(activeAnnouncement as any).message}</span>
               </div>
             </div>
             <button onClick={() => setShowBanner(false)} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-full">
               <Icons.X className="h-5 w-5" />
             </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <div className="text-sm text-gray-500 font-medium">Welcome back, {user?.displayName}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary-500 hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Students</p>
                 <p className="text-3xl font-bold text-slate-900 mt-1">{students.length}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-full"><Icons.Users className="h-8 w-8 text-primary-600" /></div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-secondary-500 hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Teachers</p>
                 <p className="text-3xl font-bold text-slate-900 mt-1">{teacherCount}</p>
              </div>
              <div className="p-3 bg-secondary-50 rounded-full"><Icons.Users className="h-8 w-8 text-secondary-500" /></div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-accent-500 hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Attendance</p>
                 <p className="text-3xl font-bold text-slate-900 mt-1">--%</p>
              </div>
              <div className="p-3 bg-accent-50 rounded-full"><Icons.CheckCircle className="h-8 w-8 text-accent-500" /></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <div className="bg-white p-6 rounded-xl shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => navigate('/students?action=add')}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 flex flex-col items-center justify-center text-slate-600 transition-colors cursor-pointer group"
                >
                  <div className="p-2 bg-indigo-50 rounded-full mb-2 group-hover:bg-indigo-100 transition-colors">
                     <Icons.Users className="h-6 w-6 text-indigo-600"/>
                  </div>
                  <span className="text-sm font-bold">Add Student</span>
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/attendance')}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 flex flex-col items-center justify-center text-slate-600 transition-colors cursor-pointer group"
                >
                  <div className="p-2 bg-green-50 rounded-full mb-2 group-hover:bg-green-100 transition-colors">
                    <Icons.CheckCircle className="h-6 w-6 text-green-600"/>
                  </div>
                  <span className="text-sm font-bold">Take Attendance</span>
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/finance')}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 flex flex-col items-center justify-center text-slate-600 transition-colors cursor-pointer group"
                >
                  <div className="p-2 bg-yellow-50 rounded-full mb-2 group-hover:bg-yellow-100 transition-colors">
                    <Icons.DollarSign className="h-6 w-6 text-yellow-600"/>
                  </div>
                  <span className="text-sm font-bold">Collect Fees</span>
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/results')}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 flex flex-col items-center justify-center text-slate-600 transition-colors cursor-pointer group"
                >
                  <div className="p-2 bg-red-50 rounded-full mb-2 group-hover:bg-red-100 transition-colors">
                    <Icons.GraduationCap className="h-6 w-6 text-red-600"/>
                  </div>
                  <span className="text-sm font-bold">Exam Results</span>
                </button>
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming Events</h3>
             <div className="space-y-3">
                 {upcomingEvents.length > 0 ? upcomingEvents.map(event => {
                   const color = getBadgeColor(event.type);
                   // Map badge colors to Tailwind border classes for the list item
                   const borderClass = color === 'red' ? 'border-red-500 bg-red-50' : color === 'indigo' ? 'border-indigo-500 bg-indigo-50' : 'border-green-500 bg-green-50';
                   const textClass = color === 'red' ? 'text-red-900' : color === 'indigo' ? 'text-indigo-900' : 'text-green-900';
                   const month = new Date(event.start).toLocaleString('default', { month: 'short' }).toUpperCase();
                   const day = new Date(event.start).getDate();

                   return (
                     <div key={event.id} className={`flex items-center p-3 rounded-lg border-l-4 ${borderClass}`}>
                        <div className="flex-shrink-0 text-center px-2">
                           <div className={`text-xs font-bold ${color === 'red' ? 'text-red-600' : color === 'indigo' ? 'text-indigo-600' : 'text-green-600'}`}>{month}</div>
                           <div className={`text-xl font-bold ${color === 'red' ? 'text-red-800' : color === 'indigo' ? 'text-indigo-800' : 'text-green-800'}`}>{day}</div>
                        </div>
                        <div className="ml-4">
                           <div className={`text-sm font-bold ${textClass}`}>{event.title}</div>
                           <div className={`text-xs opacity-70 ${textClass}`}>{event.description || new Date(event.start).toLocaleDateString()}</div>
                        </div>
                     </div>
                   );
                 }) : (
                   <p className="text-sm text-slate-500 italic">No upcoming events scheduled.</p>
                 )}
             </div>
          </div>
      </div>
    </div>
  );
};