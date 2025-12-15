import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { Button, Input, Modal, Select, Badge } from '../components/UI';
import { useData } from '../hooks/useFirebase';
import { ClassEntity } from '../types';
import { useUI } from '../contexts/UIContext';

export const Classes = () => {
  const navigate = useNavigate();
  const { data: classes, add, update, remove, loading } = useData<ClassEntity>('classes');
  const { data: students } = useData('students');
  const { data: subjects } = useData('subjects');
  const { showToast } = useUI();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({ name: '', suffix: '', level: 'primary', academicYear: '2024-2025', subjectIds: [] });

  const handleSave = async () => {
    if (!formData.name) return;
    try {
      if (editingId) {
        const { id, ...dataToUpdate } = formData;
        await update(editingId, dataToUpdate);
        showToast('Class updated successfully', 'success');
      } else {
        await add(formData);
        showToast('Class created successfully', 'success');
      }
      closeModal();
    } catch (e) {
      console.error("Error saving class:", e);
      showToast('Error saving class', 'error');
    }
  };

  const handleEdit = (e: React.MouseEvent, cls: ClassEntity) => {
    e.stopPropagation();
    setFormData({
      name: cls.name,
      suffix: cls.suffix,
      level: cls.level,
      academicYear: cls.academicYear,
      subjectIds: cls.subjectIds || []
    });
    setEditingId(cls.id);
    setIsModalOpen(true);
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
      showToast('Class deleted', 'success');
      setDeleteId(null);
    } catch (err) {
      showToast('Failed to delete class', 'error');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', suffix: '', level: 'primary', academicYear: '2024-2025', subjectIds: [] });
  };
  
  const getStudentCount = (classId: string) => students.filter((s:any) => s.classId === classId).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Classes</h1>
           <p className="text-sm text-slate-500 mt-1">Manage academic classes and sections.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}><Icons.Plus className="mr-2 h-4 w-4" /> Add Class</Button>
      </div>
      
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 hover:shadow-md transition-shadow group relative">
              <div className="absolute top-3 right-3 flex items-center space-x-2">
                <button onClick={(e) => handleEdit(e, c)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                  <Icons.Edit className="h-4 w-4" />
                </button>
                <button 
                    type="button"
                    onClick={(e) => promptDelete(e, c.id)} 
                    className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:border-red-300 px-3 py-1 rounded-md text-xs font-bold transition-all shadow-sm"
                >
                    Delete
                </button>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start pr-12">
                   <div>
                     <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name} - {c.suffix}</h3>
                     <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{c.level}</span>
                   </div>
                </div>
                <div className="mt-2">
                   <Badge color="blue">{c.academicYear}</Badge>
                </div>
                <div className="mt-4 flex items-center text-sm text-slate-500 font-medium">
                  <Icons.Users className="mr-2 h-4 w-4" /> {getStudentCount(c.id)} Students
                </div>
              </div>
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => navigate(`/attendance?classId=${c.id}&session=before_break`)}
                   className="text-xs text-center py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-green-50 text-green-700 font-bold transition-all hover:border-green-200">
                   AM Attendance
                 </button>
                 <button 
                   onClick={() => navigate(`/attendance?classId=${c.id}&session=after_break`)}
                   className="text-xs text-center py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-indigo-50 text-indigo-700 font-bold transition-all hover:border-indigo-200">
                   PM Attendance
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Class" : "Add New Class"}>
         <div className="space-y-4">
            <Input label="Class Name (e.g. Grade 1)" value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} icon={Icons.Book} />
            <div className="grid grid-cols-2 gap-4">
               <Input label="Suffix (A-P)" value={formData.suffix} onChange={(e:any) => setFormData({...formData, suffix: e.target.value})} />
               <Select 
                 label="Level" 
                 value={formData.level}
                 onChange={(e:any) => setFormData({...formData, level: e.target.value})}
                 options={[{label: 'Primary', value: 'primary'}, {label: 'Secondary', value: 'secondary'}]} 
               />
            </div>
            <Input label="Academic Year" value={formData.academicYear} onChange={(e:any) => setFormData({...formData, academicYear: e.target.value})} icon={Icons.Calendar} />
            
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Subjects</label>
              <div className="max-h-48 overflow-y-auto border border-slate-300 rounded-lg p-3 bg-slate-50">
                {subjects.filter((s:any) => s.level === 'both' || s.level === formData.level).map((sub:any) => (
                  <label key={sub.id} className="flex items-center space-x-3 mb-2 cursor-pointer p-1 hover:bg-slate-100 rounded">
                     <input 
                       type="checkbox" 
                       checked={(formData.subjectIds || []).includes(sub.id)}
                       onChange={(e) => {
                         const current = formData.subjectIds || [];
                         if (e.target.checked) setFormData({...formData, subjectIds: [...current, sub.id]});
                         else setFormData({...formData, subjectIds: current.filter((id:string) => id !== sub.id)});
                       }}
                       className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4 border-slate-300" 
                     />
                     <span className="text-sm font-medium text-slate-700">{sub.name}</span>
                  </label>
                ))}
                {subjects.length === 0 && <p className="text-xs text-slate-400">No subjects available for this level.</p>}
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">{editingId ? "Update Class" : "Create Class"}</Button>
         </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div className="space-y-4">
           <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-start">
             <Icons.Trash className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
             <div>
               <h4 className="text-sm font-bold text-red-800">Permanent Action</h4>
               <p className="text-sm text-red-700 mt-1">
                 Are you sure you want to delete this class? This action cannot be undone.
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