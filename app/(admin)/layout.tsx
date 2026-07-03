'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, ShoppingBag, FolderTree, ClipboardList, Gift, 
  Image, HelpCircle, CreditCard, Users, LogOut, Loader2, Settings
} from 'lucide-react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { mongoAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !mongoAdmin) {
      router.push('/login');
    }
  }, [mongoAdmin, loading, router]);

  if (loading || !mongoAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-55">
        <Loader2 className="animate-spin text-black" size={32} />
      </div>
    );
  }

  const isSuperAdmin = mongoAdmin?.role?.name === 'Super Admin';

  const navLinks = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Orders Desk', href: '/admin/orders', icon: ClipboardList },
    { label: 'Coupons Manager', href: '/admin/coupons', icon: Gift },
    { label: 'Banners Promo', href: '/admin/banners', icon: Image },
    { label: 'Support Desk', href: '/admin/support', icon: HelpCircle },
    { label: 'Payments Logs', href: '/admin/payments', icon: CreditCard },
    { label: 'Customers', href: '/admin/customers', icon: Users },
  ];

  if (isSuperAdmin) {
    navLinks.push(
      { label: 'Staff Directory', href: '/admin/staff', icon: Users },
      { label: 'Store Settings', href: '/admin/settings', icon: Settings }
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* Sidebar navigation */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0 px-6">
            <span className="text-xl font-black tracking-wider text-black">SASH PARTNER</span>
          </div>
          
          {/* Nav Links */}
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-4 pb-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Admin Profile & Sign Out footer */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-1 group block">
              <div className="flex items-center">
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-800 truncate">{mongoAdmin.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{mongoAdmin.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase rounded cursor-pointer transition-colors"
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Admin Panel frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between h-14 bg-white border-b border-gray-200 px-4 shrink-0">
          <span className="text-base font-black tracking-wide">SASH PARTNER</span>
          <button onClick={logout} className="text-xs font-bold text-red-600 cursor-pointer">
            Sign Out
          </button>
        </header>

        {/* Mobile navigation slider */}
        <div className="md:hidden flex overflow-x-auto gap-2 py-2 px-4 bg-white border-b border-gray-200 shrink-0">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded shrink-0 border ${
                pathname === link.href || (link.href !== '/admin/dashboard' && pathname.startsWith(link.href))
                  ? 'bg-black text-white border-black'
                  : 'text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {link.label.split(' ')[0]}
            </Link>
          ))}
        </div>

        {/* Viewport viewport */}
        <main className="flex-grow overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-lg p-6 shadow-sm min-h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
