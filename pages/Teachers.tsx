import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Button, Input, Modal } from '../components/UI';
import { useData } from '../hooks/useFirebase';
import { User, UserRole } from '../types';
import { useUI } from '../contexts/UIContext';

export const Teachers = () => {
  const { data: users, add, update, remove, loading } = useData<User>('users');
  const teachers = users.filter(u => u.role === UserRole.TEACHER);
  const { showToast } = useUI();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ displayName: '', email: '', phone: '', password: '' });

  const handleSave = async () => {
    if (!formData.displayName || !formData.email) return alert('Name and Email are required');
    
    try {
      if (editingId) {
         await update(editingId, formData);
         showToast('Teacher updated', 'success');
      } else {
         await add({
           ...formData,
           uid: `temp_${Date.now()}`,
           role: UserRole.TEACHER,
           joinDate: new Date().toISOString()
         } as any);
         showToast('Teacher added (Mock)', 'success');
      }
      closeModal();
    } catch (e) {
      showToast('Error saving teacher', 'error');
    }
  };

  const handleEdit = (t: User) => {
    const idToUse = (t as any).id || t.uid;
    setEditingId(idToUse);
    setFormData({ displayName: t.displayName, email: t.email, phone: t.phone || '', password: '' });
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
      showToast('Teacher deleted', 'success');
      setDeleteId(null);
    } catch (err) {
      showToast('Failed to delete teacher', 'error');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ displayName: '', email: '', phone: '', password: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Teachers</h1>
           <p className="text-sm text-slate-500 mt-1">Manage teaching staff and their details.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}><Icons.Plus className="mr-2 h-4 w-4" /> Add Teacher</Button>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : teachers.map((t) => (
              <tr key={(t as any).id || t.uid} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex items-center">
                     <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold mr-3 border border-primary-200">
                       {(t.displayName || '?').charAt(0)}
                     </div>
                     <div>
                       <div className="text-sm font-medium text-slate-900">{t.displayName}</div>
                       <div className="text-xs text-slate-500">{t.email}</div>
                     </div>
                   </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  <div className="flex items-center"><Icons.Phone className="h-3 w-3 mr-2" /> {t.phone || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                   {t.joinDate ? new Date(t.joinDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2 items-center">
                     <button onClick={() => handleEdit(t)} className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-1.5 rounded-md transition-colors">
                        <Icons.Edit className="h-4 w-4" />
                     </button>
                     <button 
                        type="button"
                        onClick={(e) => promptDelete(e, (t as any).id)} 
                        className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:border-red-300 px-3 py-1 rounded-md text-xs font-bold transition-all shadow-sm"
                     >
                        Delete
                     </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && teachers.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-500">No teachers found.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Teacher" : "Add New Teacher"}>
         <div className="space-y-4">
           <Input label="Full Name" value={formData.displayName} onChange={(e:any) => setFormData({...formData, displayName: e.target.value})} icon={Icons.Users} />
           <Input label="Email Address" type="email" value={formData.email} onChange={(e:any) => setFormData({...formData, email: e.target.value})} icon={Icons.Mail} />
           <Input label="Phone Number" value={formData.phone} onChange={(e:any) => setFormData({...formData, phone: e.target.value})} icon={Icons.Phone} />
           {!editingId && <Input label="Temporary Password" type="password" value={formData.password} onChange={(e:any) => setFormData({...formData, password: e.target.value})} />}
           <Button onClick={handleSave} className="w-full">{editingId ? "Update Teacher" : "Save Teacher"}</Button>
         </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div className="space-y-4">
           <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-start">
             <Icons.Trash className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
             <div>
               <h4 className="text-sm font-bold text-red-800">Permanent Action</h4>
               <p className="text-sm text-red-700 mt-1">
                 Are you sure you want to delete this teacher? This action cannot be undone.
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