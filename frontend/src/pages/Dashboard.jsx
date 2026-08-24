import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Calendar as CalendarIcon, Clock, MapPin, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history'

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Approved</span>;
      case 'Rejected':
        return <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Rejected</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Cancelled</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

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

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : historyBookings;

  return (
    <div className="relative z-10">
      <h1 className="text-3xl font-bold text-white mb-8 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
        MY BOOKINGS
      </h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-gray-800">
        <button
          className={`pb-4 px-4 font-bold tracking-wider transition-all border-b-2 ${
            activeTab === 'upcoming' 
              ? 'border-primary-500 text-primary-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' 
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          <div className="flex items-center"><CalendarIcon size={18} className="mr-2"/> UPCOMING</div>
        </button>
        <button
          className={`pb-4 px-4 font-bold tracking-wider transition-all border-b-2 ${
            activeTab === 'history' 
              ? 'border-primary-500 text-primary-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' 
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('history')}
        >
          <div className="flex items-center"><Clock size={18} className="mr-2"/> BOOKING HISTORY</div>
        </button>
      </div>

      {displayedBookings.length === 0 ? (
        <div className="glass-panel rounded-xl p-8 text-center border border-primary-500/20">
          <CalendarIcon size={48} className="mx-auto text-primary-500/50 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 tracking-wider">NO BOOKINGS FOUND</h3>
          <p className="text-gray-500 mt-2">
            {activeTab === 'upcoming' ? "You haven't initialized any upcoming seminar hall bookings yet." : "You have no past bookings."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBookings.map((booking) => (
            <div key={booking._id} className="glass-panel rounded-xl border border-primary-500/20 p-6 flex flex-col h-full hover:border-primary-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-lg font-bold text-white truncate pr-2 tracking-wide">
                  {booking.hallId ? booking.hallId.name.toUpperCase() : 'UNKNOWN HALL'}
                </h3>
                {getStatusBadge(booking.status)}
              </div>
              
              <div className="space-y-3 mb-6 flex-grow text-sm text-gray-400 relative z-10 font-mono">
                <div className="flex items-center">
                  <MapPin size={16} className="text-primary-500 mr-3" />
                  <span>{booking.hallId ? booking.hallId.location : 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon size={16} className="text-primary-500 mr-3" />
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="text-primary-500 mr-3" />
                  <span>{booking.startTime} - {booking.endTime}</span>
                </div>
                <div className="pt-2 border-t border-white/5 mt-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Purpose</p>
                  <p className="text-gray-300 italic text-xs leading-relaxed">{booking.purpose}</p>
                </div>
              </div>

              {activeTab === 'upcoming' && (booking.status === 'Pending' || booking.status === 'Approved') && (
                <button
                  onClick={() => handleCancel(booking._id)}
                  className="w-full mt-auto py-2 flex items-center justify-center text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all font-bold tracking-wider text-sm shadow-[0_0_10px_rgba(248,113,113,0)] hover:shadow-[0_0_15px_rgba(248,113,113,0.3)] relative z-10"
                >
                  <Trash2 size={16} className="mr-2" /> CANCEL BOOKING
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
