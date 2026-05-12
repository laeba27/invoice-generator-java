'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="h-16 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-10">

            {/* LOGO */}
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-2.5 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  InvoiceFlow
                </h1>

                <p className="text-xs text-gray-500">
                  Invoice Management
                </p>
              </div>
            </Link>

            {/* NAV LINKS */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Dashboard
              </Link>

              <Link
                href="/profile"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Profile
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative" ref={dropdownRef}>

            <button
              onClick={() =>
                setIsDropdownOpen(!isDropdownOpen)
              }
              className="flex items-center gap-3 pl-2 pr-3 py-2 rounded-xl hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
                {user?.name ? getInitials(user.name) : 'U'}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'User'}
                </p>

                <p className="text-xs text-gray-500 truncate max-w-[140px]">
                  {user?.email || ''}
                </p>
              </div>

              <svg
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* DROPDOWN */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">

                <div className="px-4 py-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>

                <div className="p-2">

                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>

                    <span className="text-sm text-gray-700">
                      Profile Settings
                    </span>
                  </Link>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7"
                      />
                    </svg>

                    <span className="text-sm text-gray-700">
                      Dashboard
                    </span>
                  </Link>

                  <div className="my-2 border-t border-gray-100"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 transition"
                  >
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7"
                      />
                    </svg>

                    <span className="text-sm text-red-500">
                      Logout
                    </span>
                  </button>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}