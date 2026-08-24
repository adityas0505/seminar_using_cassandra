import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';

const BookingModal = ({ hall, onClose }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/bookings', {
        hallId: hall._id,
        date,
        startTime,
        endTime,
        purpose
      });
      toast.success('BOOKING REQUEST INITIALIZED');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to request booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel border border-primary-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-primary-400 transition-colors p-2"
        >
          <X size={20} />
        </button>
        
        <div className="bg-gradient-to-r from-primary-900/40 to-transparent px-8 py-6 border-b border-primary-500/20">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Initialize <span className="text-primary-400">Booking</span></h2>
          <p className="text-[10px] font-bold text-primary-500/60 mt-1 tracking-widest uppercase">{hall.name} // {hall.location}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1">Mission Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] outline-none transition-all"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1">Start Time</label>
              <input
                type="time"
                required
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] outline-none transition-all"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1">End Time</label>
              <input
                type="time"
                required
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] outline-none transition-all"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1">Purpose of Booking</label>
            <textarea
              required
              rows="3"
              placeholder="Describe the objective of this session..."
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] outline-none transition-all resize-none"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            ></textarea>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-black tracking-widest text-xs py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all uppercase ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              {loading ? 'Processing Data...' : 'Execute Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
