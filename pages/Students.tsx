import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { Button, Input, Modal, Select, Badge } from '../components/UI';
import { useData } from '../hooks/useFirebase';
import * as Utils from '../utils';
import { Student } from '../types';
import { useUI } from '../contexts/UIContext';

export const Students = () => {
  const { data: students, add, update, remove, loading } = useData<Student>('students');
  const { data: classes } = useData<any>('classes');
  const { showToast } = useUI();
  
  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  
  // State for Delete Modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Student>>({ 
    fullName: '', rollNumber: '', classId: '', parentName: '', parentContact: '' 
  });

  // Auto-open modal if ?action=add is present
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleSave = async () => {
    if (!formData.fullName || !formData.classId) return alert("Name and Class are required");
    try {
      if (editingId) {
        await update(editingId, formData);
        showToast('Student updated', 'success');
      } else {
        await add(formData as Student);
        showToast('Student added successfully', 'success');
      }
      closeModal();
    } catch (e) {
      showToast('Error saving student', 'error');
    }
  };

  const handleEdit = (e: React.MouseEvent, s: Student) => {
    e.stopPropagation();
    setEditingId(s.id);
    setFormData(s);
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
      showToast('Student deleted successfully', 'success');
      setDeleteId(null);
    } catch (err: any) {
      console.error("Delete failed:", err);
      showToast('Failed to delete student', 'error');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ fullName: '', rollNumber: '', classId: '', parentName: '', parentContact: '' });
  };

  const downloadTemplate = () => {
    const templateData = [
      { "Full Name": "John Doe", "Roll Number": "101", "Class": "class_id_here", "Parent Name": "Jane Doe", "Parent Contact": "555-0101" },
      { "Full Name": "Alice Smith", "Roll Number": "102", "Class": "class_id_here", "Parent Name": "Bob Smith", "Parent Contact": "555-0102" }
    ];
    Utils.exportToExcel(templateData, 'student_upload_template');
  };

  const handleBulkUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt: any) => {
      try {
        const arrayBuffer = evt.target.result;
        const wb = (window as any).XLSX.read(arrayBuffer, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = (window as any).XLSX.utils.sheet_to_json(ws);
        
        if (confirm(`Are you sure you want to upload ${data.length} students?`)) {
          let count = 0;
          for (const row of data) {
            await add({
              fullName: row['Full Name'] || row['Name'],
              rollNumber: row['Roll Number'] || '',
              classId: row['Class'] || '',
              parentName: row['Parent Name'] || '',
              parentContact: row['Parent Contact'] || ''
            } as Student);
            count++;
          }
          showToast(`Bulk upload complete. ${count} students added.`, 'success');
          setShowBulkUpload(false);
          e.target.value = null; // Reset file input
        }
      } catch (err) {
        showToast('Error parsing file. Please check format.', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredStudents = students.filter(s => 
    (s.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.rollNumber || '').includes(searchTerm)
  );

  const classOptions = classes.map((c:any) => ({ label: `${c.name} ${c.suffix}`, value: c.id }));

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <div className="flex flex-wrap gap-2 items-center">
           <div className="relative">
             <input 
               type="text" 
               placeholder="Search..." 
               className="pl-8 pr-4 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-900 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
             <Icons.Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-3" />
           </div>
           
           <Button 
             variant={showBulkUpload ? 'primary' : 'outline'} 
             onClick={() => setShowBulkUpload(!showBulkUpload)}
           >
             <Icons.Users className="mr-2 h-4 w-4" /> Bulk Import
           </Button>
           
           <Button onClick={() => Utils.exportToExcel(students, 'students')} variant="outline"><Icons.Download className="mr-2 h-4 w-4" /> Export</Button>
           <Button onClick={() => setIsModalOpen(true)}><Icons.Plus className="mr-2 h-4 w-4" /> Add Student</Button>
        </div>
      </div>

      {/* Bulk Upload Section */}
      {showBulkUpload && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-primary-200 mb-6 animate-fade-in-down">
          <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="text-lg font-bold text-slate-900">Bulk Student Import</h3>
               <p className="text-sm text-slate-500 mt-1">Upload an Excel (.xlsx) file to add multiple students at once.</p>
             </div>
             <button onClick={() => setShowBulkUpload(false)} className="text-slate-400 hover:text-slate-600"><Icons.X className="h-5 w-5" /></button>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4">
             <p className="font-bold mb-1">Instructions:</p>
             <ul className="list-disc list-inside space-y-1">
               <li>Download the template first to see the required format.</li>
               <li>Ensure "Class" column contains the exact Class ID (you can copy IDs from Classes page or URL).</li>
               <li>Required columns: <strong>Full Name</strong>, <strong>Class</strong>.</li>
             </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
             <Button variant="outline" onClick={downloadTemplate}>
               <Icons.Download className="mr-2 h-4 w-4" /> Download Template
             </Button>
             
             <div className="relative flex-1 w-full">
               <input 
                 type="file" 
                 className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer border border-slate-300 rounded-lg"
                 accept=".xlsx, .xls" 
                 onChange={handleBulkUpload} 
               />
             </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm overflow-hidden rounded-xl border border-slate-200">
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Roll No</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Info</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-slate-200">
               {loading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : filteredStudents.map((s) => {
                 const className = classes.find((c:any) => c.id === s.classId);
                 return (
                   <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{s.rollNumber || 'N/A'}</td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                            {(s.fullName || '?').charAt(0)}
                          </div>
                          <div className="text-sm font-medium text-slate-900">{s.fullName || 'Unknown'}</div>
                        </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                       <Badge color="blue">{className ? `${className.name} ${className.suffix}` : 'N/A'}</Badge>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{s.parentName}</div>
                        <div className="text-xs text-slate-500">{s.parentContact}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                       <div className="flex space-x-2 items-center">
                         <button onClick={(e) => handleEdit(e, s)} className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-1.5 rounded-md transition-colors" title="Edit">
                           <Icons.Edit className="h-4 w-4" />
                         </button>
                         <button 
                           type="button"
                           onClick={(e) => promptDelete(e, s.id)} 
                           className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:border-red-300 px-3 py-1 rounded-md text-xs font-bold transition-all shadow-sm" 
                           title={`Delete ${s.fullName}`}
                         >
                           Delete
                         </button>
                       </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
         </div>
         {!loading && filteredStudents.length === 0 && <div className="p-10 text-center text-slate-500">No students found.</div>}
      </div>

      {/* Edit/Add Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Student" : "Add New Student"}>
        <div className="space-y-4">
          <Input label="Full Name" value={formData.fullName} onChange={(e:any) => setFormData({...formData, fullName: e.target.value})} icon={Icons.Users} />
          <div className="grid grid-cols-2 gap-4">
             <Input label="Roll Number" value={formData.rollNumber} onChange={(e:any) => setFormData({...formData, rollNumber: e.target.value})} />
             <Select 
               label="Class" 
               value={formData.classId}
               onChange={(e:any) => setFormData({...formData, classId: e.target.value})}
               options={[{label: 'Select Class', value: ''}, ...classOptions]} 
               icon={Icons.Book}
             />
          </div>
          <Input label="Parent Name" value={formData.parentName} onChange={(e:any) => setFormData({...formData, parentName: e.target.value})} icon={Icons.Users} />
          <Input label="Parent Contact" value={formData.parentContact} onChange={(e:any) => setFormData({...formData, parentContact: e.target.value})} icon={Icons.Phone} />
          <Button onClick={handleSave} className="w-full">{editingId ? 'Update Student' : 'Save Student'}</Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div className="space-y-4">
           <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-start">
             <Icons.Trash className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
             <div>
               <h4 className="text-sm font-bold text-red-800">Permanent Action</h4>
               <p className="text-sm text-red-700 mt-1">
                 Are you sure you want to delete this student? This action cannot be undone and will remove all associated data.
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