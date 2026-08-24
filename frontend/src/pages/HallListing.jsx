import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { MapPin, Users, CalendarDays, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import BookingModal from '../components/BookingModal';

const HallListing = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHall, setSelectedHall] = useState(null);

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const res = await api.get('/halls');
      setHalls(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch seminar halls');
    } finally {
      setLoading(false);
    }
  };

  const filteredHalls = halls.filter(hall => 
    hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hall.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            SEMINAR_<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">HALLS</span>
          </h1>
          <p className="text-gray-400 font-medium tracking-wide">SELECT YOUR VENUE FOR DEPLOYMENT</p>
        </div>
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="FILTER BY NAME OR LOCATION..."
            className="w-full px-5 py-3 rounded-xl border-primary-500/30 focus:border-primary-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] outline-none transition-all text-sm font-bold tracking-widest"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredHalls.map((hall) => (
          <div key={hall._id} className="glass-panel rounded-2xl overflow-hidden border border-white/5 group hover:border-primary-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="h-56 relative overflow-hidden bg-dark-surface/50">
              {hall.image ? (
                <img src={hall.image} alt={hall.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary-500/20">
                  <Building2 size={80} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent opacity-60"></div>
              
              <div className="absolute top-4 right-4">
                {hall.status === 'active' ? (
                  <span className="bg-green-500/10 text-green-400 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full border border-green-500/30 flex items-center backdrop-blur-md">
                    <CheckCircle2 size={12} className="mr-1.5" /> ONLINE
                  </span>
                ) : (
                  <span className="bg-red-500/10 text-red-400 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full border border-red-500/30 flex items-center backdrop-blur-md">
                    <XCircle size={12} className="mr-1.5" /> OFFLINE
                  </span>
                )}
              </div>
              
              <div className="absolute bottom-4 left-6">
                 <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-lg">{hall.name.toUpperCase()}</h3>
              </div>
            </div>
            
            <div className="p-6 pt-4">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-1 uppercase">Location</p>
                  <p className="text-sm font-bold text-gray-200 flex items-center truncate">
                    <MapPin size={14} className="mr-1.5 text-primary-500" /> {hall.location}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] font-bold text-gray-500 tracking-widest mb-1 uppercase">Capacity</p>
                  <p className="text-sm font-bold text-gray-200 flex items-center">
                    <Users size={14} className="mr-1.5 text-primary-500" /> {hall.capacity} PAX
                  </p>
                </div>
              </div>
              
              <button
                disabled={hall.status !== 'active'}
                onClick={() => setSelectedHall(hall)}
                className={`w-full py-4 rounded-xl flex justify-center items-center font-black tracking-[0.2em] uppercase text-xs transition-all ${
                  hall.status === 'active' 
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-[1.02]' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
              >
                <CalendarDays size={18} className="mr-2" />
                {hall.status === 'active' ? 'Initialize Booking' : 'System Offline'}
              </button>
            </div>
          </div>
        ))}
        {filteredHalls.length === 0 && (
          <div className="col-span-full text-center py-24 glass-panel rounded-3xl border border-white/5">
            <p className="text-gray-500 font-bold tracking-widest uppercase">No matching halls detected in matrix.</p>
          </div>
        )}
      </div>

      {selectedHall && (
        <BookingModal hall={selectedHall} onClose={() => setSelectedHall(null)} />
      )}
    </div>
  );
};

export default HallListing;
