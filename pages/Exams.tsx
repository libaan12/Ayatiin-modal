import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { Button, Input, Modal, Select, Badge } from '../components/UI';
import { useData } from '../hooks/useFirebase';
import { Exam } from '../types';
import { useUI } from '../contexts/UIContext';

export const Exams = () => {
  const navigate = useNavigate();
  const { showToast } = useUI();
  const { data: exams, add, update, remove, loading } = useData<Exam>('exams');
  const { data: classes } = useData<any>('classes');
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Exam>>({
    name: '', date: '', maxMarks: 100, passMarks: 50, classIds: []
  });

  const handleSchedule = async () => {
    if (!formData.name || !formData.date || formData.classIds?.length === 0) return alert('Fill all required fields');
    
    try {
      if (editingId) {
        await update(editingId, formData);
        showToast('Exam updated successfully', 'success');
      } else {
        await add(formData as Exam);
        showToast('Exam scheduled successfully', 'success');
      }
      closeModal();
    } catch (e) {
      showToast('Error saving exam', 'error');
    }
  };

  const promptDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await remove(deleteId);
      showToast('Exam deleted', 'success');
      setDeleteId(null);
    } catch (err) {
      showToast('Failed to delete exam', 'error');
    }
  };

  const handleEdit = (e: React.MouseEvent, exam: Exam) => {
    e.stopPropagation();
    setEditingId(exam.id);
    setFormData(exam);
    setIsOpen(true);
  };

  const handleClassCheck = (classId: string, checked: boolean) => {
    let ids = formData.classIds || [];
    if (checked) ids.push(classId);
    else ids = ids.filter(id => id !== classId);
    setFormData({ ...formData, classIds: ids });
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: '', date: '', maxMarks: 100, passMarks: 50, classIds: [] });
  };

  const goToResults = (examId: string) => {
    navigate(`/results?examId=${examId}`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Exams</h1>
        <Button onClick={() => setIsOpen(true)}><Icons.Plus className="mr-2 h-4 w-4" /> Schedule Exam</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading && <p>Loading...</p>}
         {exams.map(exam => (
           <div key={exam.id} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow relative group">
              <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => handleEdit(e, exam)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"><Icons.Edit className="h-4 w-4"/></button>
                 <button 
                    type="button"
                    onClick={(e) => promptDelete(e, exam.id)} 
                    className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:border-red-300 px-2 py-1 rounded text-xs font-bold transition-all shadow-sm"
                 >
                    Delete
                 </button>
              </div>

              <div className="flex justify-between items-start mb-4 pr-20">
                 <div>
                   <h3 className="text-lg font-bold text-slate-900 leading-tight">{exam.name}</h3>
                   <p className="text-sm text-slate-500 mt-1">{new Date(exam.date).toDateString()}</p>
                 </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                   <Badge color="indigo">Max: {exam.maxMarks}</Badge>
                   <Badge color="green">Pass: {exam.passMarks}</Badge>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Participating Classes</p>
                <div className="flex flex-wrap gap-1">
                   {(exam.classIds || []).map(cid => {
                     const cls = classes.find((c:any) => c.id === cid);
                     return cls ? <span key={cid} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">{cls.name}{cls.suffix}</span> : null;
                   })}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                 <button onClick={() => goToResults(exam.id)} className="w-full py-2 flex items-center justify-center text-sm text-indigo-600 font-bold bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    View Results &rarr;
                 </button>
              </div>
           </div>
         ))}
         {!loading && exams.length === 0 && <div className="col-span-3 text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed">No exams scheduled.</div>}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} title={editingId ? "Edit Exam" : "Schedule New Exam"}>
        <div className="space-y-4">
          <Input label="Exam Name" placeholder="e.g. Midterm 2024" value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
          <Input label="Date" type="date" value={formData.date} onChange={(e:any) => setFormData({...formData, date: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Max Marks" type="number" value={formData.maxMarks} onChange={(e:any) => setFormData({...formData, maxMarks: parseInt(e.target.value)})} />
            <Input label="Pass Marks" type="number" value={formData.passMarks} onChange={(e:any) => setFormData({...formData, passMarks: parseInt(e.target.value)})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Select Classes</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-300 p-2 rounded-md bg-white">
               {classes.map((c:any) => (
                 <label key={c.id} className="flex items-center space-x-3 p-1 hover:bg-slate-50 rounded cursor-pointer">
                   <input 
                     type="checkbox" 
                     className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300" 
                     checked={(formData.classIds || []).includes(c.id)}
                     onChange={(e) => handleClassCheck(c.id, e.target.checked)}
                   />
                   <span className="text-sm text-slate-700 font-medium">{c.name} - {c.suffix}</span>
                 </label>
               ))}
            </div>
          </div>
          <Button className="w-full mt-2" onClick={handleSchedule}>{editingId ? 'Update Exam' : 'Schedule Exam'}</Button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div className="space-y-4">
           <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-start">
             <Icons.Trash className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
             <div>
               <h4 className="text-sm font-bold text-red-800">Permanent Action</h4>
               <p className="text-sm text-red-700 mt-1">
                 Are you sure you want to delete this exam? This action cannot be undone.
               </p>
             </div>
           </div>
           
           <div className="flex gap-3 mt-4">
             <Button 
               variant="outline" 
               onClick={() => setDeleteId(null)} 
               className="flex-1"
             >
               Cancel
             </Button>
             <Button 
               variant="danger" 
               onClick={confirmDelete} 
               className="flex-1"
             >
               Yes, Delete
             </Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};