import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Select, Badge } from '../components/UI';
import { useData } from '../hooks/useFirebase';
import { useUI } from '../contexts/UIContext';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebase';
import { Icons } from '../components/Icons';

export const Results = () => {
   const [searchParams] = useSearchParams();
   const { showToast } = useUI();
   
   const { data: exams } = useData<any>('exams');
   const { data: classes } = useData<any>('classes');
   const { data: subjects } = useData<any>('subjects');
   const { data: students } = useData<any>('students');
   
   const [selectedExam, setSelectedExam] = useState(searchParams.get('examId') || '');
   const [selectedClass, setSelectedClass] = useState('');
   const [selectedSubject, setSelectedSubject] = useState('');
   const [marks, setMarks] = useState<Record<string, number>>({});
   const [loadingMarks, setLoadingMarks] = useState(false);

   // Filter
   const exam = exams.find((e:any) => e.id === selectedExam);
   // Only show classes associated with this exam
   const examClasses = classes.filter((c:any) => (exam?.classIds || []).includes(c.id));
   // Only show students in the selected class
   const classStudents = students.filter((s:any) => s.classId === selectedClass);
   
   // Filter subjects based on selected class level
   const selectedClassDetails = classes.find((c:any) => c.id === selectedClass);
   const availableSubjects = subjects.filter((s:any) => {
      if(!selectedClassDetails) return false;
      return s.level === 'both' || s.level === selectedClassDetails.level;
   });

   useEffect(() => {
     if (selectedExam && selectedClass && selectedSubject) {
       setLoadingMarks(true);
       const resultsPath = `results/${selectedExam}/${selectedClass}/${selectedSubject}`;
       get(ref(db, resultsPath)).then(snapshot => {
         if (snapshot.exists()) {
           setMarks(snapshot.val());
         } else {
           setMarks({});
         }
         setLoadingMarks(false);
       });
     }
   }, [selectedExam, selectedClass, selectedSubject]);

   const handleMarkChange = (studentId: string, val: string) => {
     const num = parseInt(val);
     setMarks(prev => ({...prev, [studentId]: isNaN(num) ? 0 : num}));
   };

   const saveResults = async () => {
     if (!selectedExam || !selectedClass || !selectedSubject) return;
     try {
       const resultsPath = `results/${selectedExam}/${selectedClass}/${selectedSubject}`;
       await set(ref(db, resultsPath), marks);
       showToast('Results saved successfully', 'success');
     } catch (e) {
       showToast('Error saving results', 'error');
     }
   };

   const getStatus = (obtained: number) => {
      if (!exam) return '-';
      return obtained >= exam.passMarks ? 'PASS' : 'FAIL';
   };

   const getPercentage = (obtained: number) => {
      if (!exam || !exam.maxMarks) return 0;
      return Math.round((obtained / exam.maxMarks) * 100);
   };

   return (
     <div>
       <h1 className="text-2xl font-bold text-gray-800 mb-6">Exam Results</h1>
       <div className="bg-white p-6 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-100">
          <Select 
            label="Exam" 
            options={[{label: 'Select Exam', value: ''}, ...exams.map((e:any) => ({label: e.name, value: e.id}))]} 
            value={selectedExam}
            onChange={(e:any) => { setSelectedExam(e.target.value); setSelectedClass(''); }}
          />
          <Select 
            label="Class" 
            options={[{label: 'Select Class', value: ''}, ...examClasses.map((c:any) => ({label: `${c.name} ${c.suffix}`, value: c.id}))]} 
            value={selectedClass}
            onChange={(e:any) => setSelectedClass(e.target.value)}
            disabled={!selectedExam}
          />
          <Select 
            label="Subject" 
            options={[{label: 'Select Subject', value: ''}, ...availableSubjects.map((s:any) => ({label: s.name, value: s.id}))]} 
            value={selectedSubject}
            onChange={(e:any) => setSelectedSubject(e.target.value)}
            disabled={!selectedClass}
          />
       </div>
       
       {selectedExam && selectedClass && selectedSubject ? (
         <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
               <span className="text-sm font-bold text-gray-600">Max Marks: {exam?.maxMarks} | Pass Marks: {exam?.passMarks}</span>
               <Badge color="blue">{classStudents.length} Students</Badge>
            </div>
            <div className="overflow-x-auto">
              {loadingMarks ? <div className="p-8 text-center">Loading marks...</div> : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Roll No</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase w-32">Obtained Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {classStudents.map((s:any) => {
                      const obtained = marks[s.id] || 0;
                      const status = getStatus(obtained);
                      const percent = getPercentage(obtained);
                      return (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-500">{s.rollNumber}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{s.fullName}</td>
                          <td className="px-6 py-4">
                            <input 
                              type="number" 
                              min="0" 
                              max={exam?.maxMarks} 
                              value={marks[s.id] !== undefined ? marks[s.id] : ''} 
                              onChange={(e) => handleMarkChange(s.id, e.target.value)}
                              className="border border-gray-300 bg-white text-slate-900 rounded-md p-2 w-24 focus:ring-primary-500 focus:border-primary-500 text-center font-bold" 
                              placeholder="0" 
                            />
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-700">{percent}%</td>
                          <td className="px-6 py-4">
                            <Badge color={status === 'PASS' ? 'green' : 'red'}>{status}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                    {classStudents.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">No students in this class.</td></tr>}
                </tbody>
              </table>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end">
               <Button onClick={saveResults} className="px-8">Save Results</Button>
            </div>
         </div>
       ) : (
         <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-500">
            <Icons.GraduationCap className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>Select Exam, Class and Subject to enter marks.</p>
         </div>
       )}
     </div>
   );
};