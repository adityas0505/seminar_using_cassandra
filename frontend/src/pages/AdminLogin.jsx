import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      
      if (res.user.role !== 'admin') {
        logout();
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      toast.success('Admin logged in successfully');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 relative z-10 bg-dark-bg">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md neon-glow-accent relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-600 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <div className="flex justify-center mb-6 text-accent-500 relative z-10">
          <ShieldCheck size={56} className="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
        </div>
        <h2 className="text-3xl font-bold text-center text-white mb-6 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-primary-500">
          Admin Portal
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Admin Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@system.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-accent-600 to-accent-500 text-white font-bold tracking-wider py-3.5 rounded-xl hover:from-accent-500 hover:to-accent-400 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] mt-6 transform hover:-translate-y-0.5"
          >
            ACCESS SYSTEM
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-gray-800/50 text-center text-gray-500 text-xs tracking-widest uppercase">
          &copy; {new Date().getFullYear()} VVCE SECURE ACCESS
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
