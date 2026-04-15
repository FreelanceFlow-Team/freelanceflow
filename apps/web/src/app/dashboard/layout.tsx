'use client';

import { ReactNode, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, FileText, User, LogOut, Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          setUserName(`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim());
          setUserEmail(user.email ?? '');
        } catch {
          // ignore
        }
      }
    }
    setIsLoading(false);
  }, [router]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Clients', href: '/dashboard/clients', icon: Users },
    { label: 'Services', href: '/dashboard/services', icon: Briefcase },
    { label: 'Factures', href: '/dashboard/invoices', icon: FileText },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── Top Navbar (profile only) ───────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 h-14">
        <div className="h-full px-4 lg:pl-[272px] flex items-center justify-between">
          {/* Mobile: logo + hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link href="/dashboard" className="text-lg font-bold text-indigo-600">
              FreelanceFlow
            </Link>
          </div>

          {/* Desktop: empty left space (sidebar handles nav) */}
          <div className="hidden lg:block" />

          {/* Right: Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors ${
                pathname.startsWith('/dashboard/profile') ? 'bg-indigo-50' : 'hover:bg-slate-100'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {initials || <User size={16} />}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[140px] truncate">
                {userName || 'Profil'}
              </span>
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {userName || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                </div>

                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User size={16} />
                  Mon profil
                </Link>

                <div className="border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Sidebar Desktop ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200 flex-col">
        <div className="p-6">
          <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
            FreelanceFlow
          </Link>
        </div>

        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ─── Mobile overlay ──────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ─── Sidebar Mobile ──────────────────────────────────────────── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
            FreelanceFlow
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <main className="pt-14 lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
