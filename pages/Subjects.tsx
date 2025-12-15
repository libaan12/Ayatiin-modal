import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Button, Input, Modal, Select, Badge } from '../components/UI';
import { useData } from '../hooks/useFirebase';
import { useUI } from '../contexts/UIContext';

export const Subjects = () => {
  const { data: subjects, add, update, remove } = useData<any>('subjects');
  const { showToast } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', level: 'primary' });

  const handleSave = async () => {
    if (!formData.name) return;
    if (editingId) {
      await update(editingId, formData);
      showToast('Subject updated', 'success');
    } else {
      await add(formData);
      showToast('Subject added', 'success');
    }
    closeModal();
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setFormData({ name: s.name, level: s.level });
    setIsOpen(true);
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
      showToast('Subject deleted', 'success');
      setDeleteId(null);
    } catch (err) {
      showToast('Failed to delete subject', 'error');
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: '', level: 'primary' });
  };

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Subjects</h1>
        <Button onClick={() => setIsOpen(true)}><Icons.Plus className="mr-2 h-4 w-4" /> Add Subject</Button>
      </div>
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
           <thead className="bg-slate-50">
             <tr>
               <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Subject Name</th>
               <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Level</th>
               <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-200 bg-white">
             {subjects.map((s:any) => (
               <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                 <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                 <td className="px-6 py-4"><Badge color={s.level === 'both' ? 'blue' : s.level === 'primary' ? 'green' : 'indigo'}>{s.level}</Badge></td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                     <button onClick={() => handleEdit(s)} className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-1.5 rounded-md transition-colors">
                        <Icons.Edit className="h-4 w-4" />
                     </button>
                     <button 
                        type="button"
                        onClick={(e) => promptDelete(e, s.id)} 
                        className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:border-red-300 px-3 py-1 rounded-md text-xs font-bold transition-all shadow-sm"
                     >
                        Delete
                     </button>
                  </div>
                </td>
               </tr>
             ))}
             {subjects.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-slate-500">No subjects added yet.</td></tr>}
           </tbody>
        </table>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} title={editingId ? "Edit Subject" : "Add Subject"}>
         <div className="space-y-4">
           <Input label="Subject Name" value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} />
           <Select label="Level" value={formData.level} onChange={(e:any) => setFormData({...formData, level: e.target.value})} options={[
             {label: 'Primary', value: 'primary'},
             {label: 'Secondary', value: 'secondary'},
             {label: 'Both', value: 'both'}
           ]} />
           <Button onClick={handleSave} className="w-full">{editingId ? "Update Subject" : "Add Subject"}</Button>
         </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div className="space-y-4">
           <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-start">
             <Icons.Trash className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
             <div>
               <h4 className="text-sm font-bold text-red-800">Permanent Action</h4>
               <p className="text-sm text-red-700 mt-1">
                 Are you sure you want to delete this subject? This action cannot be undone.
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