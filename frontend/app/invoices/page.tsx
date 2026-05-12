'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Receipt,
  FileText,
} from 'lucide-react';

import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';

import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function InvoicesPage() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadInvoices();
  }, [router]);

  const loadInvoices = async () => {
    try {
      const data = await apiClient.getAllInvoices();
      setInvoices(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!confirm('Delete this invoice?')) return;

    try {
      await apiClient.deleteInvoice(invoiceId);

      setInvoices((prev) =>
        prev.filter((inv) => inv.id !== invoiceId)
      );

      setOpenMenuId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete invoice');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    if (searchTerm) {
      filtered = filtered.filter((invoice) =>
        invoice.invoiceNumber
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.customerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(
        (invoice) =>
          (invoice.status || 'DUE') === statusFilter
      );
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceType === typeFilter
      );
    }

    switch (sortBy) {
      case 'latest':
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
        break;

      case 'oldest':
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );
        break;

      case 'amount-high':
        filtered.sort(
          (a, b) =>
            (b.totalAmount || b.total) -
            (a.totalAmount || a.total)
        );
        break;

      case 'amount-low':
        filtered.sort(
          (a, b) =>
            (a.totalAmount || a.total) -
            (b.totalAmount || b.total)
        );
        break;
    }

    return filtered;
  }, [
    invoices,
    searchTerm,
    statusFilter,
    typeFilter,
    sortBy,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center">
        <div className="text-center">

          <div className="h-12 w-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-sm text-gray-500">
            Loading invoices...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb]">

      {/* NAVBAR */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* BREADCRUMBS */}
        <Breadcrumbs />

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Invoices
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage and track all your invoices
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

        {/* STATS */}
        {/* COMPACT STATS */}
<div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">

  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">

    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
      <Receipt className="w-5 h-5 text-blue-600" />
    </div>

    <div>
      <p className="text-xs text-gray-500">
        Total Invoices
      </p>

      <h2 className="text-lg font-semibold text-gray-900">
        {invoices.length}
      </h2>
    </div>
  </div>

  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">

    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
      <FileText className="w-5 h-5 text-green-600" />
    </div>

    <div>
      <p className="text-xs text-gray-500">
        Paid
      </p>

      <h2 className="text-lg font-semibold text-gray-900">
        {
          invoices.filter(
            (i) => i.status === 'PAID'
          ).length
        }
      </h2>
    </div>
  </div>

  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">

    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
      <Receipt className="w-5 h-5 text-orange-600" />
    </div>

    <div>
      <p className="text-xs text-gray-500">
        Revenue
      </p>

      <h2 className="text-lg font-semibold text-gray-900 truncate">
        ₹
        {invoices
          .reduce(
            (sum, inv) =>
              sum +
              (inv.totalAmount || inv.total || 0),
            0
          )
          .toLocaleString('en-IN')}
      </h2>
    </div>
  </div>

  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">

    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
      <FileText className="w-5 h-5 text-red-600" />
    </div>

    <div>
      <p className="text-xs text-gray-500">
        Pending
      </p>

      <h2 className="text-lg font-semibold text-gray-900">
        {
          invoices.filter(
            (i) =>
              (i.status || 'DUE') === 'DUE'
          ).length
        }
      </h2>
    </div>
  </div>

</div>

        {/* FILTER BAR */}
       {/* FILTER BAR */}
<div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6">

  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

    {/* SEARCH */}
    <div>

      <label className="text-xs font-medium text-gray-500 mb-2 block">
        Search
      </label>

      <div className="relative">

        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />

        <input
          type="text"
          placeholder="Invoice or customer..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400"
        />
      </div>
    </div>

    {/* STATUS */}
    <div>

      <label className="text-xs font-medium text-gray-500 mb-2 block">
        Filter By Status
      </label>

      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value)
        }
        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none"
      >
        <option value="ALL">
          All Status
        </option>

        <option value="PAID">
          Paid
        </option>

        <option value="PARTIAL">
          Partial
        </option>

        <option value="DUE">
          Due
        </option>
      </select>
    </div>

    {/* TYPE */}
    <div>

      <label className="text-xs font-medium text-gray-500 mb-2 block">
        Filter By Type
      </label>

      <select
        value={typeFilter}
        onChange={(e) =>
          setTypeFilter(e.target.value)
        }
        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none"
      >
        <option value="ALL">
          All Types
        </option>

        <option value="INTRA">
          INTRA
        </option>

        <option value="INTER">
          INTER
        </option>
      </select>
    </div>

    {/* SORT */}
    <div>

      <label className="text-xs font-medium text-gray-500 mb-2 block">
        Sort By
      </label>

      <select
        value={sortBy}
        onChange={(e) =>
          setSortBy(e.target.value)
        }
        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none"
      >
        <option value="latest">
          Latest First
        </option>

        <option value="oldest">
          Oldest First
        </option>

        <option value="amount-high">
          Highest Amount
        </option>

        <option value="amount-low">
          Lowest Amount
        </option>
      </select>
    </div>

  </div>
</div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          {filteredInvoices.length === 0 ? (
            <div className="py-20 text-center">

              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-7 h-7 text-gray-500" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                No invoices found
              </h3>

              <p className="text-sm text-gray-500 mt-2 mb-5">
                Try changing filters or create a new invoice
              </p>

              <Link
                href="/invoices/new"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl text-sm font-medium transition"
              >
                <Plus className="w-4 h-4" />
                Create Invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-gray-50 border-b border-gray-100">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Invoice
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Type
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredInvoices.map((invoice) => (

                    <tr
                      key={invoice.id}
                      className="hover:bg-gray-50 transition"
                    >

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-primary-600" />
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {invoice.invoiceNumber}
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                              Invoice ID #{invoice.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-gray-900">
                        {invoice.customerName || 'N/A'}
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-500">
                        {formatDate(invoice.createdAt)}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            invoice.status === 'PAID'
                              ? 'bg-green-100 text-green-700'
                              : invoice.status === 'PARTIAL'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {invoice.status || 'DUE'}
                        </span>
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            invoice.invoiceType === 'INTRA'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {invoice.invoiceType}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right font-semibold text-gray-900">
                        {formatCurrency(
                          invoice.totalAmount ||
                            invoice.total
                        )}
                      </td>

                      <td className="px-6 py-5">

                        <div className="relative flex justify-end">

                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === invoice.id
                                  ? null
                                  : invoice.id
                              )
                            }
                            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                          </button>

                          {openMenuId === invoice.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() =>
                                  setOpenMenuId(null)
                                }
                              />

                              <div className="absolute right-0 top-12 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">

                                <Link
                                  href={`/invoices/${invoice.id}`}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 transition"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Link>

                                <Link
                                  href={`/invoices/${invoice.id}/edit`}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 transition"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit Invoice
                                </Link>

                                <button
                                  onClick={() =>
                                    handleDeleteInvoice(
                                      invoice.id
                                    )
                                  }
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm text-red-600 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Invoice
                                </button>

                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}