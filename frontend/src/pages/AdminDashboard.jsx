import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Building2, Calendar, Check, X, Trash2, Plus, Edit2, Clock, LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings'); // bookings | halls
  const [bookingLogTab, setBookingLogTab] = useState('upcoming'); // upcoming | history
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlots] = useState([
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ]);

  // New Hall Form State
  const [showHallForm, setShowHallForm] = useState(false);
  const [editingHallId, setEditingHallId] = useState(null);
  const [hallForm, setHallForm] = useState({ name: '', capacity: '', location: '', status: 'active', image: '' });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hallsRes, bookingsRes] = await Promise.all([
        api.get('/halls'),
        api.get('/bookings/all')
      ]);
      setHalls(hallsRes.data.data);
      setBookings(bookingsRes.data.data);
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // --- Booking Actions ---
  const handleBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status.toLowerCase()}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete booking');
    }
  };

  // --- Hall Actions ---
  const handleHallSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', hallForm.name);
    formData.append('capacity', hallForm.capacity);
    formData.append('location', hallForm.location);
    formData.append('status', hallForm.status);
    
    if (imageFile) {
      formData.append('image', imageFile);
    } else {
      formData.append('image', hallForm.image);
    }

    try {
      if (editingHallId) {
        await api.put(`/halls/${editingHallId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Hall updated successfully');
      } else {
        await api.post('/halls', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Hall created successfully');
      }
      setHallForm({ name: '', capacity: '', location: '', status: 'active', image: '' });
      setImageFile(null);
      setShowHallForm(false);
      setEditingHallId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save hall');
    }
  };

  const handleEditHall = (hall) => {
    setHallForm({ name: hall.name, capacity: hall.capacity, location: hall.location, status: hall.status, image: hall.image || '' });
    setImageFile(null);
    setEditingHallId(hall._id);
    setShowHallForm(true);
  };

  const handleDeleteHall = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hall? This may affect existing bookings.')) return;
    try {
      await api.delete(`/halls/${id}`);
      toast.success('Hall deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete hall');
    }
  };

  const now = new Date();
  const upcomingBookings = [];
  const historyBookings = [];

  bookings.forEach(booking => {
    if (!booking || !booking.date || !booking.endTime) {
      historyBookings.push(booking); // fallback
      return;
    }
    
    try {
      const dateObj = new Date(booking.date);
      if (isNaN(dateObj.getTime())) {
        historyBookings.push(booking);
        return;
      }
      
      const bookingDateStr = dateObj.toISOString().split('T')[0];
      const bookingDateTime = new Date(`${bookingDateStr}T${booking.endTime}:00`);
      
      if (bookingDateTime < now || booking.status === 'Cancelled' || booking.status === 'Rejected') {
        historyBookings.push(booking);
      } else {
        upcomingBookings.push(booking);
      }
    } catch (e) {
      console.error('Error parsing booking dates:', e);
      historyBookings.push(booking);
    }
  });

  const displayedBookings = bookingLogTab === 'upcoming' ? upcomingBookings : historyBookings;

  return (
    <div className="relative z-10">
      <h1 className="text-3xl font-bold text-white mb-8 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600">
        ADMIN CORE
      </h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-800">
        <button
          className={`pb-4 px-4 font-bold tracking-wider transition-all border-b-2 ${
            activeTab === 'bookings' 
              ? 'border-accent-500 text-accent-400 neon-text' 
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('bookings')}
        >
          <div className="flex items-center"><Calendar size={18} className="mr-2"/> BOOKING LOGS</div>
        </button>
        <button
          className={`pb-4 px-4 font-bold tracking-wider transition-all border-b-2 ${
            activeTab === 'halls' 
              ? 'border-accent-500 text-accent-400 neon-text' 
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('halls')}
        >
          <div className="flex items-center"><Building2 size={18} className="mr-2"/> HALL MATRIX</div>
        </button>
        <button
          className={`pb-4 px-4 font-bold tracking-wider transition-all border-b-2 ${
            activeTab === 'schedule' 
              ? 'border-accent-500 text-accent-400 neon-text' 
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('schedule')}
        >
          <div className="flex items-center"><Clock size={18} className="mr-2"/> SCHEDULE MATRIX</div>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">Loading...</div>
      ) : activeTab === 'bookings' ? (
        // --- Bookings View ---
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setBookingLogTab('upcoming')}
              className={`px-4 py-2 text-xs font-bold rounded-lg tracking-wider transition-all ${
                bookingLogTab === 'upcoming' 
                  ? 'bg-accent-500/20 text-accent-400 border border-accent-500/50' 
                  : 'bg-dark-surface text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              UPCOMING & REQUESTS
            </button>
            <button
              onClick={() => setBookingLogTab('history')}
              className={`px-4 py-2 text-xs font-bold rounded-lg tracking-wider transition-all ${
                bookingLogTab === 'history' 
                  ? 'bg-accent-500/20 text-accent-400 border border-accent-500/50' 
                  : 'bg-dark-surface text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              PAST HISTORY
            </button>
          </div>
          
          <div className="glass-panel rounded-xl overflow-hidden border border-accent-500/20">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-dark-surface/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Hall</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Purpose</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {displayedBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-dark-surface/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-200">{booking.userId ? booking.userId.name : 'UNKNOWN'}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">{booking.userId ? booking.userId.email : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                      {booking.hallId ? booking.hallId.name : 'UNKNOWN HALL'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                      <div>{new Date(booking.date).toLocaleDateString()}</div>
                      <div className="text-gray-500 text-xs mt-1">{booking.startTime} - {booking.endTime}</div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-400 max-w-[150px] truncate" title={booking.purpose}>{booking.purpose}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold tracking-wider rounded-full border 
                        ${booking.status === 'Approved' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 
                          booking.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                          booking.status === 'Cancelled' ? 'bg-gray-800 text-gray-400 border-gray-600' : 
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}
                      >
                        {booking.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      {booking.status === 'Pending' && bookingLogTab === 'upcoming' && (
                        <>
                          <button onClick={() => handleBookingStatus(booking._id, 'Approved')} className="text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 p-2 rounded-lg transition-colors shadow-[0_0_10px_rgba(74,222,128,0.1)] hover:shadow-[0_0_15px_rgba(74,222,128,0.3)]" title="Approve"><Check size={16} /></button>
                          <button onClick={() => handleBookingStatus(booking._id, 'Rejected')} className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 p-2 rounded-lg transition-colors shadow-[0_0_10px_rgba(248,113,113,0.1)] hover:shadow-[0_0_15px_rgba(248,113,113,0.3)]" title="Reject"><X size={16} /></button>
                        </>
                      )}
                      <button onClick={() => handleDeleteBooking(booking._id)} className="text-gray-500 hover:text-red-500 p-2 transition-colors" title="Delete"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {displayedBookings.length === 0 && (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500 tracking-widest text-sm">NO BOOKINGS FOUND.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      ) : activeTab === 'schedule' ? (
        // --- Schedule View ---
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-200 tracking-wider">SCHEDULE MATRIX</h2>
              <p className="text-xs text-gray-500 mt-1 font-mono uppercase tracking-widest">Real-time allocation visualization</p>
            </div>
            <div className="flex items-center space-x-3 bg-dark-surface p-2 rounded-xl border border-gray-800">
              <span className="text-xs font-bold text-gray-400 px-3">SELECT DATE:</span>
              <input 
                type="date" 
                className="bg-dark-bg text-white border-none rounded-lg px-4 py-2 text-sm font-bold focus:ring-1 focus:ring-accent-500 outline-none"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-accent-500/10 shadow-2xl overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Header row with time slots */}
              <div className="grid grid-cols-[200px_repeat(13,1fr)] bg-dark-surface/80 border-b border-gray-800">
                <div className="p-4 text-xs font-black text-gray-500 tracking-widest border-r border-gray-800 bg-black/20">HALL IDENTIFIER</div>
                {timeSlots.map(time => (
                  <div key={time} className="p-4 text-[10px] font-black text-gray-400 text-center border-r border-gray-800/50">
                    {time}
                  </div>
                ))}
              </div>

              {/* Hall rows */}
              {halls.map(hall => (
                <div key={hall._id} className="grid grid-cols-[200px_repeat(13,1fr)] border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
                  <div className="p-4 border-r border-gray-800 bg-black/10 flex flex-col justify-center">
                    <span className="text-sm font-bold text-gray-200 group-hover:text-accent-400 transition-colors">{hall.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono mt-1 tracking-tighter uppercase">{hall.location}</span>
                  </div>
                  
                  {timeSlots.map(time => {
                    // Check if there's a booking for this hall at this time
                    const hour = parseInt(time.split(':')[0]);
                    const bookingAtTime = bookings.find(b => {
                      if (!b.hallId || b.hallId._id !== hall._id) return false;
                      if (b.status === 'Rejected' || b.status === 'Cancelled') return false;
                      
                      const bDate = new Date(b.date).toISOString().split('T')[0];
                      if (bDate !== selectedDate) return false;

                      const startH = parseInt(b.startTime.split(':')[0]);
                      const endH = parseInt(b.endTime.split(':')[0]);
                      return hour >= startH && hour < endH;
                    });

                    return (
                      <div key={time} className="h-16 border-r border-gray-800/30 relative">
                        {bookingAtTime && (
                          <div className={`absolute inset-1 rounded-md flex flex-col items-center justify-center p-1 text-center overflow-hidden border transition-all hover:scale-105 z-10 
                            ${bookingAtTime.status === 'Approved' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)] animate-pulse'}`}
                            title={`Purpose: ${bookingAtTime.purpose}`}
                          >
                            <span className="text-[8px] font-black leading-none truncate w-full">{bookingAtTime.userId?.name.toUpperCase()}</span>
                            <span className="text-[7px] opacity-70 font-bold mt-1 truncate w-full px-1">{bookingAtTime.purpose}</span>
                            <span className="text-[6px] opacity-60 font-mono mt-0.5">{bookingAtTime.startTime}-{bookingAtTime.endTime}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex items-center space-x-6 text-[10px] font-bold tracking-widest text-gray-500">
            <div className="flex items-center"><div className="w-3 h-3 bg-green-500/20 border border-green-500/30 rounded mr-2"></div> APPROVED</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-yellow-500/20 border border-yellow-500/30 rounded mr-2"></div> PENDING APPROVAL</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-gray-800 border border-gray-700 rounded mr-2"></div> AVAILABLE</div>
          </div>
        </div>
      ) : (
        // --- Halls View ---
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-200 tracking-wider">HALL MATRIX</h2>
            <button 
              onClick={() => { setShowHallForm(!showHallForm); setEditingHallId(null); setHallForm({ name: '', capacity: '', location: '', status: 'active', image: '' }); }}
              className="bg-accent-600/20 border border-accent-500 hover:bg-accent-600 text-accent-400 hover:text-white px-5 py-2.5 rounded-lg text-sm font-bold tracking-widest transition-all flex items-center shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]"
            >
              {showHallForm ? <><X size={16} className="mr-2"/> CANCEL</> : <><Plus size={16} className="mr-2"/> ALLOCATE NEW HALL</>}
            </button>
          </div>

          {showHallForm && (
            <div className="glass-panel p-6 rounded-xl border border-accent-500/30 mb-8 animate-in fade-in slide-in-from-top-4 neon-glow-accent">
              <h3 className="text-lg font-bold text-white mb-4 tracking-wider">{editingHallId ? 'RECONFIGURE HALL' : 'ALLOCATE NEW HALL'}</h3>
              <form onSubmit={handleHallSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1">DESIGNATION</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl focus:border-accent-500 focus:shadow-[0_0_10px_rgba(168,85,247,0.2)] outline-none transition-all"
                    value={hallForm.name} onChange={(e) => setHallForm({...hallForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1">CAPACITY</label>
                  <input type="number" required className="w-full px-4 py-3 rounded-xl focus:border-accent-500 focus:shadow-[0_0_10px_rgba(168,85,247,0.2)] outline-none transition-all"
                    value={hallForm.capacity} onChange={(e) => setHallForm({...hallForm, capacity: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1">COORDINATES</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-xl focus:border-accent-500 focus:shadow-[0_0_10px_rgba(168,85,247,0.2)] outline-none transition-all"
                    value={hallForm.location} onChange={(e) => setHallForm({...hallForm, location: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1">SYSTEM STATUS</label>
                  <select className="w-full px-4 py-3 rounded-xl focus:border-accent-500 focus:shadow-[0_0_10px_rgba(168,85,247,0.2)] outline-none transition-all"
                    value={hallForm.status} onChange={(e) => setHallForm({...hallForm, status: e.target.value})}>
                    <option value="active">ONLINE</option>
                    <option value="inactive">OFFLINE</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1">IMAGE URL (OPTIONAL)</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl focus:border-accent-500 focus:shadow-[0_0_10px_rgba(168,85,247,0.2)] outline-none transition-all"
                    placeholder="https://images.unsplash.com/..."
                    value={hallForm.image} onChange={(e) => setHallForm({...hallForm, image: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 tracking-wider mb-1">OR UPLOAD FILE</label>
                  <input type="file" accept="image/*" className="w-full px-4 py-3 rounded-xl border border-dashed border-gray-700 bg-dark-surface/50 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-accent-600/20 file:text-accent-400 hover:file:bg-accent-600/30 transition-all"
                    onChange={(e) => setImageFile(e.target.files[0])} />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="bg-gradient-to-r from-accent-600 to-accent-500 text-white px-8 py-3 rounded-xl font-bold tracking-widest hover:from-accent-500 hover:to-accent-400 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    {editingHallId ? 'UPDATE MATRIX' : 'SAVE ALLOCATION'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {halls.map((hall) => (
              <div key={hall._id} className="glass-panel p-6 rounded-xl border border-accent-500/20 hover:border-accent-500/50 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white tracking-wide">{hall.name.toUpperCase()}</h3>
                  <span className={`px-2 py-1 text-xs font-bold tracking-wider rounded-full border ${hall.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-gray-800 text-gray-400 border-gray-600'}`}>
                    {hall.status === 'active' ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
                {hall.image && (
                  <div className="w-full h-32 rounded-lg mb-4 overflow-hidden border border-gray-800">
                    <img src={hall.image} alt={hall.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
                <div className="text-sm text-gray-400 space-y-2 mb-6 font-mono">
                  <p><strong className="text-gray-300">CAPACITY:</strong> {hall.capacity}</p>
                  <p><strong className="text-gray-300">LOCATION:</strong> {hall.location}</p>
                </div>
                <div className="flex justify-between space-x-3 pt-4 border-t border-gray-800">
                  <button onClick={() => handleEditHall(hall)} className="flex-1 flex justify-center items-center text-accent-400 hover:text-white bg-accent-500/10 hover:bg-accent-500/30 border border-accent-500/30 py-2 rounded-lg transition-all text-xs font-bold tracking-widest" title="Edit">
                    <Edit2 size={14} className="mr-2"/> EDIT
                  </button>
                  <button onClick={() => handleDeleteHall(hall._id)} className="flex-1 flex justify-center items-center text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 py-2 rounded-lg transition-all text-xs font-bold tracking-widest" title="Delete">
                    <Trash2 size={14} className="mr-2"/> DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
