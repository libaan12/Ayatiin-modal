import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Button, Input, Modal, Select, Badge } from '../components/UI';
import { useData } from '../hooks/useFirebase';
import { CalendarEvent, UserRole } from '../types';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';

export const SchoolCalendar = () => {
  const { user } = useAuth();
  const { data: events, add, remove, loading } = useData<CalendarEvent>('calendar_events');
  const { showToast } = useUI();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '', start: '', type: 'event', description: ''
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const handleAdd = async () => {
    if (!formData.title || !formData.start) return alert('Title and Date are required');
    await add(formData as CalendarEvent);
    showToast('Event added', 'success');
    setIsModalOpen(false);
    setFormData({ title: '', start: '', type: 'event', description: '' });
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
      showToast('Event deleted', 'success');
      setDeleteId(null);
    } catch (err) {
      showToast('Failed to delete event', 'error');
    }
  };

  const getBadgeColor = (type: string) => {
    switch(type) {
      case 'holiday': return 'red';
      case 'exam': return 'indigo';
      default: return 'green';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">School Calendar</h1>
           <p className="text-sm text-gray-500 mt-1">Upcoming events, holidays, and exams.</p>
        </div>
        {isAdmin && <Button onClick={() => setIsModalOpen(true)}><Icons.Plus className="mr-2 h-4 w-4" /> Add Event</Button>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event List */}
        <div className="lg:col-span-2 space-y-4">
           {loading ? <div>Loading events...</div> : sortedEvents.map(event => (
             <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                   <div className={`flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-sm ${event.type === 'holiday' ? 'bg-red-500' : event.type === 'exam' ? 'bg-indigo-500' : 'bg-green-500'}`}>
                      <span className="text-xs uppercase opacity-80">{new Date(event.start).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-2xl">{new Date(event.start).getDate()}</span>
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.description || 'No details provided.'}</p>
                      <div className="mt-2">
                        <Badge color={getBadgeColor(event.type)}>{event.type.toUpperCase()}</Badge>
                      </div>
                   </div>
                </div>
                {isAdmin && (
                  <div className="mt-4 md:mt-0 flex justify-end">
                     <button 
                        type="button"
                        onClick={(e) => promptDelete(e, event.id)} 
                        className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:border-red-300 px-3 py-1 rounded-md text-xs font-bold transition-all shadow-sm"
                     >
                        Delete
                     </button>
                  </div>
                )}
             </div>
           ))}
           {!loading && sortedEvents.length === 0 && <div className="text-center py-10 bg-white rounded-xl border border-dashed text-gray-500">No upcoming events found.</div>}
        </div>
        
        {/* Simple Month View (Static/Visual for now) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
           <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
             <Icons.Calendar className="mr-2 h-5 w-5 text-indigo-500" /> 
             {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
           </h3>
           <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="font-bold text-gray-400 py-2">{d}</div>)}
              {Array.from({length: 35}, (_, i) => {
                 const day = i - 2; // Offset for demo
                 const isToday = day === new Date().getDate();
                 
                 return (
                   <div key={i} className={`py-2 rounded-full ${day > 0 && day <= 31 ? 'text-gray-700' : 'text-gray-200'} ${isToday ? 'bg-primary-600 text-white font-bold' : ''}`}>
                     {day > 0 && day <= 31 ? day : ''}
                   </div>
                 );
              })}
           </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Calendar Event">
        <div className="space-y-4">
           <Input label="Event Title" value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} icon={Icons.Book} />
           <Input label="Date" type="date" value={formData.start} onChange={(e:any) => setFormData({...formData, start: e.target.value})} />
           <Select 
             label="Event Type" 
             value={formData.type} 
             onChange={(e:any) => setFormData({...formData, type: e.target.value})}
             options={[
               {label: 'General Event', value: 'event'},
               {label: 'Holiday', value: 'holiday'},
               {label: 'Examination', value: 'exam'}
             ]}
           />
           <Input label="Description" value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} />
           <Button onClick={handleAdd} className="w-full">Add Event</Button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion">
        <div className="space-y-4">
           <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-start">
             <Icons.Trash className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
             <div>
               <h4 className="text-sm font-bold text-red-800">Permanent Action</h4>
               <p className="text-sm text-red-700 mt-1">
                 Are you sure you want to delete this event? This action cannot be undone.
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