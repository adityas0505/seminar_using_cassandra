import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Building2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      
      if (res.user.role === 'admin') {
        logout();
        toast.error('Admins must log in through the admin portal (/admin/login).');
        return;
      }

      toast.success('Logged in successfully');
      navigate('/halls');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 relative z-10 bg-dark-bg">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md neon-glow relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary-600 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <div className="flex justify-center mb-6 text-primary-500 relative z-10">
          <Building2 size={56} className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        </div>
        <h2 className="text-3xl font-bold text-center text-white mb-6 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@system.com"
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
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold tracking-wider py-3.5 rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] mt-6 transform hover:-translate-y-0.5"
          >
            SYSTEM LOGIN
          </button>
        </form>
        <p className="mt-8 text-center text-gray-400 relative z-10">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold hover:underline decoration-primary-400 underline-offset-4 transition-all">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
