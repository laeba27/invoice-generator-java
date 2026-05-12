'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  Plus,
  FileText,
  Receipt,
  IndianRupee,
  Building2,
  LayoutTemplate,
  BarChart3,
  Users,
  ChevronRight,
} from 'lucide-react';

import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';

import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const router = useRouter();

  const [business, setBusiness] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const businessData = await apiClient.getBusiness();

      if (!businessData) {
        router.push('/login');
        return;
      }

      setBusiness(businessData);

      try {
        const invoiceData = await apiClient.getAllInvoices();
        setInvoices(invoiceData || []);
      } catch (err) {
        console.log('No invoices found');
        setInvoices([]);
      }
    } catch (err) {
      console.error(err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-primary-600 animate-spin"></div>

          <p className="mt-4 text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const totalInvoices = invoices.length;

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + (inv.total || 0),
    0
  );

  const recentInvoices = invoices.slice(0, 5);

  const quickActions = [
    {
      title: 'Invoices',
      subtitle: 'Manage invoices',
      href: '/invoices',
      icon: FileText,
    },
    {
      title: 'Templates',
      subtitle: 'Invoice templates',
      href: '/templates',
      icon: LayoutTemplate,
    },
    {
      title: 'Customers',
      subtitle: 'Manage clients',
      href: '/customers',
      icon: Users,
    },
    {
      title: 'Reports',
      subtitle: 'Analytics & stats',
      href: '/reports',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* TOP HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Welcome back. Here's what's happening today.
            </p>
          </div>

          <Link
            href="/invoices/new"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-2xl text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </Link>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {quickActions.map((item, idx) => {
            const Icon = item.icon;

            return (
              <Link
                key={idx}
                href={item.href}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200"
              >
                <div className="flex items-start justify-between">

                  <div>
                    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      {item.subtitle}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400" />

                </div>
              </Link>
            );
          })}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          {/* TOTAL INVOICES */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between mb-4">

              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>

              <span className="text-xs font-medium text-gray-400">
                Total
              </span>
            </div>

            <h2 className="text-3xl font-semibold text-gray-900">
              {totalInvoices}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Total invoices created
            </p>
          </div>

          {/* REVENUE */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between mb-4">

              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>

              <span className="text-xs font-medium text-gray-400">
                Revenue
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 truncate">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Total earnings
            </p>
          </div>

          {/* BUSINESS */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between mb-4">

              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-orange-600" />
              </div>

              <span className="text-xs font-medium text-gray-400">
                Business
              </span>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {business?.businessName}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Registered business
            </p>
          </div>

          {/* GST */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between mb-4">

              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>

              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Active
              </span>
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              GST Registered
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Business verified
            </p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* RECENT INVOICES */}
          <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="flex items-center justify-between p-5 border-b border-gray-100">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Invoices
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Latest generated invoices
                </p>
              </div>

              <Link
                href="/invoices"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition"
              >
                View All
              </Link>
            </div>

            {recentInvoices.length > 0 ? (
              <div className="divide-y divide-gray-100">

                {recentInvoices.map((invoice) => (
                  <Link
                    href={`/invoices/${invoice.id}`}
                    key={invoice.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
                  >

                    <div className="flex items-center gap-4">

                      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-gray-600" />
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          #{invoice.invoiceNumber}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(
                            invoice.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">

                      <p className="font-semibold text-gray-900">
                        ₹{invoice.total?.toLocaleString('en-IN')}
                      </p>

                      <p className="text-xs text-primary-600 mt-1 font-medium">
                        {invoice.invoiceType}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">

                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-7 h-7 text-gray-500" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No invoices yet
                </h3>

                <p className="text-sm text-gray-500 mb-5">
                  Create your first invoice to get started.
                </p>

                <Link
                  href="/invoices/new"
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl text-sm font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">

            {/* BUSINESS INFO */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-600" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Business Info
                  </h2>

                  <p className="text-sm text-gray-500">
                    Registered details
                  </p>
                </div>
              </div>

              <div className="space-y-5">

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Business Name
                  </p>

                  <p className="text-sm font-medium text-gray-900">
                    {business?.businessName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Phone Number
                  </p>

                  <p className="text-sm font-medium text-gray-900">
                    {business?.phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    GST Number
                  </p>

                  <p className="text-sm font-medium text-gray-900 break-all">
                    {business?.gstNumber || 'Not Added'}
                  </p>
                </div>

                <Link
                  href="/profile"
                  className="w-full inline-flex justify-center bg-gray-900 hover:bg-black text-white py-3 rounded-xl text-sm font-medium transition"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">

              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                Revenue Summary
              </h2>

              <div className="space-y-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Total Revenue
                  </span>

                  <span className="font-semibold text-gray-900">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Total Invoices
                  </span>

                  <span className="font-semibold text-gray-900">
                    {totalInvoices}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Status
                  </span>

                  <span className="text-sm font-medium text-green-600">
                    Active
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}