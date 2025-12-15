import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Button, Select } from '../components/UI';
import { useData } from '../hooks/useFirebase';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, ClassTimetableData } from '../types';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebase';
import { useUI } from '../contexts/UIContext';

export const Timetable = () => {
  const { user } = useAuth();
  const { showToast } = useUI();
  const { data: classes } = useData<any>('classes');
  const { data: subjects } = useData<any>('subjects');
  
  const [selectedClass, setSelectedClass] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [timetableData, setTimetableData] = useState<Record<string, string[]>>({}); // Day -> Array of subject IDs
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];
  const periods = [1, 2, 3, 4, 5, 6, 7]; // 1-4 before break, 5-7 after

  const selectedClassDetails = classes.find((c:any) => c.id === selectedClass);
  // Filter subjects based on selected class level (primary/secondary)
  const availableSubjects = subjects.filter((s:any) => {
    if (!selectedClassDetails) return false;
    return s.level === 'both' || s.level === selectedClassDetails.level;
  });

  const subjectOptions = [{label: 'Free / None', value: ''}, ...availableSubjects.map((s:any) => ({label: s.name, value: s.id}))];

  useEffect(() => {
    if (selectedClass) {
      setLoadingSchedule(true);
      // Fetch timetable for this class
      const ttRef = ref(db, `timetables/${selectedClass}`);
      get(ttRef).then((snapshot) => {
        if (snapshot.exists()) {
           setTimetableData(snapshot.val().schedule || {});
        } else {
           // Initialize empty structure
           const empty: any = {};
           days.forEach(d => empty[d] = Array(8).fill("")); // Index 0 unused, 1-7 used
           setTimetableData(empty);
        }
        setLoadingSchedule(false);
      });
    } else {
      setTimetableData({});
    }
  }, [selectedClass]);

  const handleCellChange = (day: string, periodIndex: number, subjectId: string) => {
    setTimetableData(prev => {
      const daySchedule = prev[day] ? [...prev[day]] : Array(8).fill("");
      daySchedule[periodIndex] = subjectId;
      return { ...prev, [day]: daySchedule };
    });
  };

  const saveTimetable = async () => {
    if (!selectedClass) return;
    try {
      await set(ref(db, `timetables/${selectedClass}`), {
        id: selectedClass,
        schedule: timetableData
      });
      setIsEditing(false);
      showToast('Timetable saved successfully!', 'success');
    } catch (e) {
      showToast('Failed to save timetable', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getSubjectName = (id: string) => {
    if (!id) return '-';
    const sub = subjects.find((s:any) => s.id === id);
    return sub ? sub.name : '-';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 no-print">
         <div>
            <h1 className="text-2xl font-bold text-slate-800">Class Timetable</h1>
            <p className="text-sm text-slate-500">View and manage weekly schedule.</p>
         </div>
         <div className="flex items-center space-x-2">
            <Select 
               className="mb-0 w-56" 
               options={[{label: 'Select Class', value: ''}, ...classes.map((c:any) => ({label: `${c.name} ${c.suffix}`, value: c.id}))]} 
               value={selectedClass}
               onChange={(e:any) => { setSelectedClass(e.target.value); setIsEditing(false); }}
            />
            {selectedClass && user?.role === UserRole.ADMIN && (
              isEditing ? (
                 <Button onClick={saveTimetable}><Icons.CheckCircle className="h-4 w-4 mr-2" /> Save</Button>
              ) : (
                 <Button variant="secondary" onClick={() => setIsEditing(true)}><Icons.Edit className="h-4 w-4 mr-2" /> Edit</Button>
              )
            )}
            <Button variant="outline" onClick={handlePrint}><Icons.Printer className="h-4 w-4 mr-2" /> Print</Button>
         </div>
      </div>
      
      {selectedClass ? (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden print-area border border-slate-200">
          <div className="p-4 bg-indigo-900 text-white text-center font-bold text-lg hidden print-block">
             Ayatiin School - Timetable ({selectedClassDetails?.name} {selectedClassDetails?.suffix})
          </div>
          {loadingSchedule ? <div className="p-10 text-center">Loading schedule...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                   <th className="p-4 border-b-2 border-r border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase text-left w-32">Day</th>
                   {[1,2,3,4].map(p => <th key={p} className="p-4 border-b-2 border-slate-100 bg-slate-50 text-xs font-bold text-slate-600">Period {p}</th>)}
                   <th className="p-4 border-b-2 border-slate-100 bg-amber-50 text-xs font-bold text-amber-600 text-center w-24">BREAK</th>
                   {[5,6,7].map(p => <th key={p} className="p-4 border-b-2 border-slate-100 bg-slate-50 text-xs font-bold text-slate-600">Period {p}</th>)}
                </tr>
              </thead>
              <tbody>
                {days.map(day => (
                  <tr key={day} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 border-b border-r border-slate-100 font-bold text-slate-800 bg-slate-50">{day}</td>
                    {[1,2,3,4].map(p => (
                      <td key={p} className="p-2 border-b border-slate-100 text-sm text-center align-middle">
                        {isEditing ? (
                          <select 
                            className="w-full border-slate-300 rounded text-xs py-1"
                            value={timetableData[day]?.[p] || ''}
                            onChange={(e) => handleCellChange(day, p, e.target.value)}
                          >
                            {subjectOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        ) : (
                          <div className="font-medium text-indigo-900">{getSubjectName(timetableData[day]?.[p])}</div>
                        )}
                      </td>
                    ))}
                    <td className="p-2 border-b border-slate-100 bg-amber-50 text-center relative">
                        <span className="text-xs text-amber-600 font-bold tracking-widest writing-vertical-lr transform rotate-180 absolute inset-0 flex items-center justify-center">BREAK</span>
                    </td>
                    {[5,6,7].map(p => (
                      <td key={p} className="p-2 border-b border-slate-100 text-sm text-center align-middle">
                        {isEditing ? (
                           <select 
                            className="w-full border-slate-300 rounded text-xs py-1"
                            value={timetableData[day]?.[p] || ''}
                            onChange={(e) => handleCellChange(day, p, e.target.value)}
                          >
                            {subjectOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        ) : (
                          <div className="font-medium text-indigo-900">{getSubjectName(timetableData[day]?.[p])}</div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
           <Icons.Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
           <p className="text-slate-500">Please select a class to view its timetable.</p>
        </div>
      )}
    </div>
  );
};