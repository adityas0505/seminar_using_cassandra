import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-gray-100">
      <Navbar />
      <main className="flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>
      <footer className="glass-panel border-t-0 py-6 text-center text-gray-500 text-sm tracking-widest uppercase mt-auto">
        &copy; {new Date().getFullYear()} <span className="text-primary-500">Seminar</span><span className="text-accent-500">Book</span> SYSTEM.
      </footer>
    </div>
  );
};

export default Layout;
