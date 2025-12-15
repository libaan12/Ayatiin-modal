import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Button, Input, Select, Badge, Modal } from '../components/UI';
import { useData } from '../hooks/useFirebase';
import { useUI } from '../contexts/UIContext';
import { FeeRecord } from '../types';

export const Finance = () => {
  const { data: fees, add, remove } = useData<FeeRecord>('fees');
  const { data: students } = useData<any>('students');
  const { data: classes } = useData<any>('classes');
  const { data: settings } = useData<any>('settings');
  const { showToast } = useUI();

  // State: selectedMonth is YYYY-MM string
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const appSettings = settings.find((s:any) => s.id === 'general') || { appName: 'Ayatiin School' };

  // Collect Fee Modal State
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [feeForm, setFeeForm] = useState({ amount: 100, type: 'Cash', note: '' });

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Filter fees strictly by the selected YYYY-MM string
  const currentMonthFees = fees.filter(f => f.month === selectedMonth);
  
  const totalCollected = currentMonthFees.reduce((acc, curr) => acc + (parseInt(curr.amount as any) || 0), 0);
  const paidStudentsCount = currentMonthFees.length;
  const totalStudents = students.length;
  const pendingStudents = totalStudents - paidStudentsCount;

  const openCollectModal = (studentId: string) => {
    setSelectedStudentId(studentId);
    setFeeForm({ amount: 100, type: 'Cash', note: '' });
    setCollectModalOpen(true);
  };

  const handleCollectFee = async () => {
    if (!selectedStudentId || feeForm.amount <= 0) return alert('Invalid Amount');
    
    try {
      const newFee: Omit<FeeRecord, 'id'> = {
        studentId: selectedStudentId,
        month: selectedMonth, // Store YYYY-MM directly
        amount: feeForm.amount,
        status: 'paid',
        datePaid: new Date().toISOString(),
        paymentType: feeForm.type,
        note: feeForm.note,
        schoolNameSnapshot: appSettings.appName
      };
      
      const newKey = await add(newFee);
      showToast('Fee collected successfully', 'success');
      setCollectModalOpen(false);
      
      openReceipt({...newFee, id: newKey});
    } catch (e) {
      showToast('Error processing fee', 'error');
    }
  };

  const openReceipt = (feeRecord: any) => {
    const student = students.find((s:any) => s.id === feeRecord.studentId);
    const cls = classes.find((c:any) => c.id === student?.classId);
    
    // Format YYYY-MM to readable "Month Year" for receipt
    const [year, month] = feeRecord.month.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1);
    const readableMonth = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });

    setReceiptData({
      ...feeRecord,
      readableMonth,
      studentName: student?.fullName,
      rollNumber: student?.rollNumber,
      className: cls ? `${cls.name} ${cls.suffix}` : 'N/A',
      schoolName: appSettings.appName
    });
    setReceiptModalOpen(true);
  };

  const printReceipt = () => {
    const printContent = document.getElementById('receipt-area');
    const win = window.open('', '', 'height=700,width=700');
    if(win && printContent) {
        win.document.write('<html><head><title>Receipt</title>');
        win.document.write('<script src="https://cdn.tailwindcss.com"></script>'); 
        win.document.write('</head><body >');
        win.document.write(printContent.innerHTML);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
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
      showToast('Payment record deleted', 'success');
      setDeleteId(null);
    } catch (err) {
      showToast('Failed to delete record', 'error');
    }
  };

  const formatMonthDisplay = (yyyy_mm: string) => {
     if(!yyyy_mm) return '';
     const [year, month] = yyyy_mm.split('-');
     const date = new Date(parseInt(year), parseInt(month) - 1);
     return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Finance & Fees</h1>
        
        {/* Styled Month Selector */}
        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex items-center min-w-[200px]">
           <div className="bg-indigo-50 px-3 py-2 rounded-md border border-indigo-100 mr-3">
             <Icons.Calendar className="h-5 w-5 text-indigo-600" />
           </div>
           <div className="flex flex-col flex-1">
             <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Select Month</span>
             <input 
               type="month" 
               value={selectedMonth} 
               onChange={(e) => setSelectedMonth(e.target.value)} 
               className="text-sm font-bold text-slate-800 outline-none bg-transparent cursor-pointer w-full" 
             />
           </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
           <h4 className="text-slate-500 text-xs font-bold uppercase">Collected ({formatMonthDisplay(selectedMonth)})</h4>
           <p className="text-3xl font-bold text-slate-900 mt-2">${totalCollected}</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
           <h4 className="text-slate-500 text-xs font-bold uppercase">Estimated Income</h4>
           <p className="text-3xl font-bold text-slate-900 mt-2">${totalStudents * 100}</p> 
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
           <h4 className="text-slate-500 text-xs font-bold uppercase">Pending Students</h4>
           <div className="flex justify-between items-end mt-2">
              <p className="text-3xl font-bold text-slate-900">{pendingStudents}</p>
              <div className="text-right">
                <span className="block text-xs text-slate-400">Paid: {paidStudentsCount}</span>
                <span className="block text-xs text-slate-400">Total: {totalStudents}</span>
              </div>
           </div>
         </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
         <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Fee Collection List</h3>
            <Badge color="indigo">{formatMonthDisplay(selectedMonth)}</Badge>
         </div>
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-white">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Roll No</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Student</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Class</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                 <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-200 bg-white">
               {students.map((s:any) => {
                 const cls = classes.find((c:any) => c.id === s.classId);
                 // Check if fee exists for this student AND this exact YYYY-MM month
                 const feeRecord = fees.find(f => f.studentId === s.id && f.month === selectedMonth);
                 const status = feeRecord ? 'paid' : 'unpaid';
                 
                 return (
                   <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 text-sm text-slate-500 font-mono">{s.rollNumber}</td>
                     <td className="px-6 py-4 font-medium text-slate-900">{s.fullName}</td>
                     <td className="px-6 py-4 text-sm text-slate-500">{cls ? cls.name + cls.suffix : ''}</td>
                     <td className="px-6 py-4">
                        <Badge color={status === 'paid' ? 'green' : 'red'}>{status.toUpperCase()}</Badge>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                       {status === 'unpaid' ? (
                         <button onClick={() => openCollectModal(s.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-xs font-bold shadow-sm transition-colors">
                           Collect Fee
                         </button>
                       ) : (
                         <div className="flex items-center space-x-2">
                           <button onClick={() => openReceipt(feeRecord)} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm flex items-center transition-colors">
                             <Icons.Printer className="h-3 w-3 mr-1" /> Receipt
                           </button>
                           <button 
                             type="button"
                             onClick={(e) => promptDelete(e, feeRecord?.id)} 
                             className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:border-red-300 px-2 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm"
                             title="Delete Payment"
                           >
                             Delete
                           </button>
                         </div>
                       )}
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
         </div>
      </div>

      {/* Collect Fee Modal */}
      <Modal isOpen={collectModalOpen} onClose={() => setCollectModalOpen(false)} title="Collect Fee">
         <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4 flex items-center">
               <Icons.Calendar className="h-4 w-4 mr-2" />
               Collecting for: <strong className="ml-1 uppercase">{formatMonthDisplay(selectedMonth)}</strong>
            </div>
            <Input label="Amount ($)" type="number" value={feeForm.amount} onChange={(e:any) => setFeeForm({...feeForm, amount: parseInt(e.target.value)})} />
            <Select 
               label="Payment Type" 
               options={[{label: 'Cash', value: 'Cash'}, {label: 'eCash / Online', value: 'eCash'}]} 
               value={feeForm.type}
               onChange={(e:any) => setFeeForm({...feeForm, type: e.target.value})}
            />
            <Input label="Note (Optional)" value={feeForm.note} onChange={(e:any) => setFeeForm({...feeForm, note: e.target.value})} />
            <Button onClick={handleCollectFee} className="w-full">Confirm & Collect</Button>
         </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal isOpen={receiptModalOpen} onClose={() => setReceiptModalOpen(false)} title="Payment Receipt">
        {receiptData && (
          <div>
            <div id="receipt-area" className="p-8 bg-white border border-slate-200 rounded-lg mb-4">
               <div className="text-center border-b-2 border-slate-100 pb-6 mb-6">
                  <h2 className="text-3xl font-extrabold text-slate-800">{receiptData.schoolName || 'Ayatiin School'}</h2>
                  <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mt-2 font-bold">Official Fee Receipt</p>
               </div>
               
               <div className="grid grid-cols-2 gap-6 text-sm mb-6">
                  <div>
                    <span className="block text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Student Name</span>
                    <span className="font-bold text-slate-800 text-lg">{receiptData.studentName}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Date Paid</span>
                    <span className="font-bold text-slate-800">{new Date(receiptData.datePaid).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Class / Roll No</span>
                    <span className="font-bold text-slate-800">{receiptData.className} <span className="text-slate-400">#</span>{receiptData.rollNumber}</span>
                  </div>
                   <div className="text-right">
                    <span className="block text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Receipt ID</span>
                    <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs">{receiptData.id?.substring(1,9).toUpperCase()}</span>
                  </div>
               </div>
               
               <div className="bg-slate-50 p-4 rounded-lg mb-4 flex justify-between items-center border border-slate-100">
                  <div>
                     <span className="block text-xs text-slate-400 uppercase font-bold">Month</span>
                     <span className="font-bold text-slate-900 text-lg">{receiptData.readableMonth}</span>
                  </div>
                  <div className="text-right">
                     <span className="block text-xs text-slate-400 uppercase font-bold">Method</span>
                     <Badge color="blue">{receiptData.paymentType}</Badge>
                  </div>
               </div>
               
               <div className="flex justify-between items-end py-4 border-t-2 border-slate-100 mt-4">
                  <span className="text-xl font-bold text-slate-800">Total Paid</span>
                  <span className="text-4xl font-extrabold text-primary-600">${receiptData.amount}</span>
               </div>
               
               <div className="text-center mt-8 pt-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Thank you for your timely payment</p>
                  <p className="text-[10px] text-slate-300 mt-1">Generated by Ayatiin System</p>
               </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={printReceipt} className="flex-1" variant="secondary"><Icons.Printer className="h-4 w-4 mr-2" /> Print Receipt</Button>
              <Button onClick={() => setReceiptModalOpen(false)} className="flex-1" variant="outline">Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div className="space-y-4">
           <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-start">
             <Icons.Trash className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
             <div>
               <h4 className="text-sm font-bold text-red-800">Permanent Action</h4>
               <p className="text-sm text-red-700 mt-1">
                 Are you sure you want to delete this payment record? This action cannot be undone.
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