import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { Button, Input, Select, Badge } from '../components/UI';
import { useData } from '../hooks/useFirebase';
import { AttendanceRecord } from '../types';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';
import { useUI } from '../contexts/UIContext';

export const Attendance = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useUI();
  const initialClassId = searchParams.get('classId') || '';
  const initialSession = searchParams.get('session') || 'before_break';
  
  const [selectedClass, setSelectedClass] = useState(initialClassId);
  const [session, setSession] = useState(initialSession);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { data: classes } = useData<any>('classes');
  const { data: students } = useData<any>('students');
  const { data: records } = useData<AttendanceRecord>('attendance');

  const [attendanceState, setAttendanceState] = useState<Record<string, 'present'|'absent'|'late'>>({});

  const classStudents = students.filter((s:any) => s.classId === selectedClass);
  const classOptions = classes.map((c:any) => ({ label: `${c.name} ${c.suffix}`, value: c.id }));

  useEffect(() => {
    // Load existing attendance for this date/class/session
    const existing = records.filter((r:any) => 
      r.date === date && 
      r.classId === selectedClass && 
      r.session === session
    );
    
    const newState: any = {};
    if (existing.length > 0) {
      existing.forEach((r:any) => {
        newState[r.studentId] = r.status;
      });
    } else {
      // Default to present
      classStudents.forEach((s:any) => {
        newState[s.id] = 'present';
      });
    }
    setAttendanceState(newState);
  }, [selectedClass, session, date, records.length, classStudents.length]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    if (!selectedClass) {
      showToast('Please select a class first', 'error');
      return;
    }
    
    try {
      // Using set to overwrite/create records with predictable IDs based on Date-Session-Student
      const promises = classStudents.map((s:any) => {
        const id = `${date}-${session}-${s.id}`;
        return set(ref(db, `attendance/${id}`), {
          id,
          date,
          studentId: s.id,
          classId: selectedClass,
          session,
          status: attendanceState[s.id] || 'present'
        });
      });

      await Promise.all(promises);
      showToast('Attendance Saved Successfully', 'success');
    } catch (e) {
      showToast('Failed to save attendance', 'error');
    }
  };

  // Stats for the current view
  const presentCount = Object.values(attendanceState).filter(s => s === 'present').length;
  const absentCount = Object.values(attendanceState).filter(s => s === 'absent').length;
  const lateCount = Object.values(attendanceState).filter(s => s === 'late').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
       <div className="flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-bold text-slate-800">Daily Attendance</h1>
            <p className="text-slate-500 text-sm mt-1">Manage student attendance efficiently.</p>
         </div>
         <div className="bg-indigo-50 px-4 py-2 rounded-lg text-indigo-700 font-medium text-sm flex items-center border border-indigo-100">
           <Icons.Calendar className="h-4 w-4 mr-2" />
           {new Date(date).toDateString()}
         </div>
       </div>

       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Select 
               label="Class" 
               options={[{label: 'Select Class', value: ''}, ...classOptions]} 
               value={selectedClass}
               onChange={(e:any) => setSelectedClass(e.target.value)}
               icon={Icons.Book}
             />
             <Select 
               label="Session" 
               options={[{label: 'Before Break', value: 'before_break'}, {label: 'After Break', value: 'after_break'}]} 
               value={session}
               onChange={(e:any) => setSession(e.target.value)}
               icon={Icons.Clock}
             />
             <Input 
               label="Date"
               type="date" 
               value={date} 
               onChange={(e:any) => setDate(e.target.value)}
             />
          </div>
       </div>
       
       {selectedClass ? (
         <>
           <div className="flex gap-4 mb-4">
             <Badge color="green" className="text-sm px-3 py-1">Present: {presentCount}</Badge>
             <Badge color="red" className="text-sm px-3 py-1">Absent: {absentCount}</Badge>
             <Badge color="yellow" className="text-sm px-3 py-1">Late: {lateCount}</Badge>
           </div>

           <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-200">
                 <thead className="bg-slate-50">
                   <tr>
                     <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Roll No</th>
                     <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                     <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-slate-200">
                   {classStudents.map((s:any) => {
                     const status = attendanceState[s.id] || 'present';
                     return (
                       <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{s.rollNumber}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                           <div className="flex items-center">
                             <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold mr-3">
                                {(s.fullName || '?').charAt(0)}
                             </div>
                             {s.fullName}
                           </div>
                         </td>
                         
                         <td className="px-6 py-4 whitespace-nowrap text-center">
                           <div className="flex justify-center bg-slate-100 rounded-lg p-1 w-fit mx-auto">
                             <button
                               onClick={() => handleStatusChange(s.id, 'present')}
                               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${status === 'present' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                             >
                               Present
                             </button>
                             <button
                               onClick={() => handleStatusChange(s.id, 'absent')}
                               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${status === 'absent' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                             >
                               Absent
                             </button>
                             <button
                               onClick={() => handleStatusChange(s.id, 'late')}
                               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${status === 'late' ? 'bg-white text-yellow-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                             >
                               Late
                             </button>
                           </div>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
             {classStudents.length === 0 && <div className="p-10 text-center text-slate-500">No students in this class.</div>}
           </div>
           
           {classStudents.length > 0 && (
             <div className="flex justify-end pt-4">
                <Button onClick={saveAttendance} className="w-full sm:w-auto shadow-lg text-base px-8 py-3">
                   <Icons.CheckCircle className="mr-2 h-5 w-5" /> Save Attendance
                </Button>
             </div>
           )}
         </>
       ) : (
         <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
           <Icons.Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
           <p className="text-slate-500">Please select a class to take attendance.</p>
         </div>
       )}
    </div>
  );
};