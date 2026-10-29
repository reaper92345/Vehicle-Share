"use client";
import React, { useEffect, useState } from 'react';
import "./admin.css";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode as jwt_decode } from 'jwt-decode';




// Admin layout – renders a premium sidebar for admin‑only pages.

const AdminSidebar = () => (
  <aside className="admin-sidebar w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4 fixed h-full hidden md:block">
    <h2 className="sidebar-title text-2xl font-bold mb-4">Admin Panel</h2>
    <nav className="sidebar-nav flex flex-col space-y-2">
      <Link href="/admin/dashboard" className="sidebar-link hover:bg-gray-700 p-2 rounded">Dashboard</Link>
      <Link href="/admin/users" className="sidebar-link hover:bg-gray-700 p-2 rounded">Users</Link>
      <Link href="/admin/equipment" className="sidebar-link hover:bg-gray-700 p-2 rounded">Equipment</Link>
      <Link href="/admin/bookings" className="sidebar-link hover:bg-gray-700 p-2 rounded">Rentals & payments</Link>
      <Link href="/admin/analytics" className="sidebar-link hover:bg-gray-700 p-2 rounded">Analytics</Link>
      <Link href="/" className="sidebar-link hover:bg-gray-700 p-2 rounded">Back to site</Link>
    </nav>
  </aside>
);

const OwnerSidebar = () => (
  <aside className="owner-sidebar w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white p-4 fixed h-full hidden md:block">
    <h2 className="sidebar-title text-2xl font-bold mb-4">Owner Panel</h2>
    <nav className="sidebar-nav flex flex-col space-y-2">
      <Link href="/owner/dashboard" className="sidebar-link hover:bg-blue-700 p-2 rounded">Dashboard</Link>
      <Link href="/owner/equipment" className="sidebar-link hover:bg-blue-700 p-2 rounded">My Equipment</Link>
      <Link href="/owner/bookings" className="sidebar-link hover:bg-blue-700 p=2 rounded">Bookings</Link>
    </nav>
  </aside>
);

const RenterSidebar = () => (
  <aside className="renter-sidebar w-64 bg-gradient-to-b from-green-800 to-green-900 text-white p-4 fixed h-full hidden md:block">
    <h2 className="sidebar-title text-2xl font-bold mb-4">Renter Panel</h2>
    <nav className="sidebar-nav flex flex-col space-y-2">
      <Link href="/renter/dashboard" className="sidebar-link hover:bg-green-700 p-2 rounded">Dashboard</Link>
      <Link href="/renter/equipment" className="sidebar-link hover:bg-green-700 p-2 rounded">Explore Equipment</Link>
      <Link href="/renter/bookings" className="sidebar-link hover:bg-green-700 p=2 rounded">My Bookings</Link>
    </nav>
  </aside>
);
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<string>('');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Verify user and initialise theme/role
  useEffect(() => {
    const stored = localStorage.getItem('equipshare_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        // Prefer explicit role, fall back to user_type, then JWT payload
        const explicitRole = user.role ?? user.user_type;
        let resolvedRole = typeof explicitRole === 'string' ? explicitRole.toLowerCase() : '';
        if (!resolvedRole) {
          // Decode token to get role (payload.userType)
          const token = localStorage.getItem('equipshare_token');
          if (token) {
            try {
              const decoded: any = jwt_decode(token);
              resolvedRole = (decoded.userType || decoded.role || '').toString().toLowerCase();
            } catch (e) {
              console.error('Failed to decode JWT for role', e);
            }
          }
        }
        setRole(resolvedRole);
        if (!['admin', 'owner', 'renter'].includes(resolvedRole)) {
          router.replace('/');
        }
      } catch (e) {
        router.replace('/');
      }
    } else {
      router.replace('/login');
    }
    const savedTheme = localStorage.getItem('equipshare_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('equipshare_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('equipshare_theme');
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Render nothing while role is being determined
  if (!role) return null;

  // Mobile header with hamburger
  const MobileHeader = (
    <header className="md:hidden flex items-center justify-between bg-gray-800 text-white p-4">
      <button onClick={toggleSidebar} className="text-2xl">☰</button>
      <span className="text-lg font-bold">{role.charAt(0).toUpperCase() + role.slice(1)} Panel</span>
      <button onClick={toggleTheme} className="px-2 py-1 bg-gray-600 rounded">
        {darkMode ? '☀' : '🌙'}
      </button>
    </header>
  );

  const Sidebar = (
    <>
      {role === 'admin' && <AdminSidebar />}
      {role === 'owner' && <OwnerSidebar />}
      {role === 'renter' && <RenterSidebar />}
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {MobileHeader}
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        {Sidebar}
      </div>
      {/* Mobile overlay drawer */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white z-50 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}
      >
        {Sidebar}
      </div>
      <main className="flex-1 p-4 overflow-auto">{children}</main>
    </div>
  );
}
