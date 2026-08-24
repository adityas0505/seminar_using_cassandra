import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building2, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdminPath = window.location.pathname.startsWith('/admin');
  
  // Use admin session if on admin path, otherwise use standard user session
  const activeUser = isAdminPath ? admin : user;

  const handleLogout = () => {
    const role = isAdminPath ? 'admin' : 'user';
    logout(role);
    navigate(isAdminPath ? '/admin/login' : '/login');
  };

  return (
    <nav className="bg-dark-surface/95 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.8)] border-b-2 border-primary-500/50 shadow-[0_10px_30px_rgba(6,182,212,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-fuchsia-400 font-black text-2xl tracking-tighter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Building2 className="mr-2 text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,1)]" />
              BookMy<span className="font-light text-white">Hall</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {activeUser ? (
              <>
                {!isAdminPath && <Link to="/halls" className="text-gray-300 hover:text-primary-400 font-medium tracking-wide transition-colors">HALLS</Link>}
                {activeUser.role === 'admin' ? (
                  <Link to="/admin" className="text-accent-300 hover:text-white font-bold tracking-wider transition-colors neon-text drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">ADMIN CORE</Link>
                ) : (
                  <Link to="/dashboard" className="text-primary-300 hover:text-white font-bold tracking-wider transition-colors drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">MY BOOKINGS</Link>
                )}
                <div className="flex items-center ml-4 space-x-2 bg-dark-surface/80 border border-primary-500/30 px-4 py-1.5 rounded-full text-primary-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                  <UserIcon size={16} />
                  <span className="text-sm font-bold tracking-wider">{activeUser.name.toUpperCase()}</span>
                  {activeUser.role === 'admin' && <span className="text-[10px] bg-accent-500/20 text-accent-400 px-1.5 rounded ml-1 border border-accent-500/30">ADM</span>}
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-500/10 transition-all shadow-[0_0_0_rgba(248,113,113,0)] hover:shadow-[0_0_15px_rgba(248,113,113,0.4)]"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-primary-400 font-medium tracking-wide transition-colors">LOGIN</Link>
                <Link to="/register" className="bg-primary-600/20 border border-primary-500 text-primary-400 px-5 py-2 rounded-lg hover:bg-primary-600 hover:text-white transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] font-bold tracking-widest text-sm">
                   INITIALIZE
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
