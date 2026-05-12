'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import dynamic from 'next/dynamic';
import Breadcrumbs from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';
import {
  ArrowLeft,
  Pencil,
  Printer,
} from 'lucide-react';

// Dynamically import templates to avoid SSR issues
const StandardTemplate = dynamic(() => import('@/components/templates/StandardTemplate'), { ssr: false });
const ClassyTemplate = dynamic(() => import('@/components/templates/ClassyTemplate'), { ssr: false });
const ModernTemplate = dynamic(() => import('@/components/templates/ModernTemplate'), { ssr: false });

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [templateSettings, setTemplateSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceId: '',
    bankName: '',
    accountDetails: '',
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (invoiceId) {
      loadInvoiceData();
    }
  }, [router, invoiceId]);

  const loadInvoiceData = async () => {
    try {
      // Load invoice
      const invoiceData = await apiClient.getInvoiceById(parseInt(invoiceId));
      setInvoice(invoiceData);
      
      // Load business
      const businessData = await apiClient.getBusiness();
      setBusiness(businessData);

      // Load template settings
      try {
        const settings = await apiClient.getSystemTemplateSettings(businessData.id);
        setTemplateSettings(settings);
      } catch (err) {
        console.log('No template settings, using default');
        setTemplateSettings({ template: { id: 1, name: 'Standard' }, colorHex: '#3B82F6' });
      }
      
      // Load customer if exists
      if (invoiceData.customerId) {
        try {
          const customerData = await apiClient.getCustomerById(invoiceData.customerId);
          setCustomer(customerData);
        } catch (err) {
          console.error('Error loading customer:', err);
        }
      }
      
      // Load payments
      try {
        const paymentData = await apiClient.getPaymentsByInvoice(parseInt(invoiceId));
        setPayments(paymentData);
      } catch (err) {
        console.error('Error loading payments:', err);
        setPayments([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dueAmount = invoice.dueAmount || invoice.totalAmount || invoice.total;
    
    if (paymentForm.amount > dueAmount) {
      alert(`Payment amount cannot exceed due amount of ₹${dueAmount.toFixed(2)}`);
      return;
    }
    
    if (paymentForm.amount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }
    
    try {
      await apiClient.addPayment({
        invoiceId: parseInt(invoiceId),
        ...paymentForm,
      });
      
      setShowPaymentModal(false);
      setPaymentForm({
        amount: 0,
        paymentMethod: 'CASH',
        paymentDate: new Date().toISOString().split('T')[0],
        referenceId: '',
        bankName: '',
        accountDetails: '',
      });
      
      await loadInvoiceData();
    } catch (err: any) {
      alert(err.message || 'Failed to add payment');
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      await apiClient.deletePayment(paymentId);
      await loadInvoiceData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete payment');
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderInvoiceTemplate = () => {
    if (!invoice || !business) {
      return <div className="p-8 text-center text-gray-500">Loading invoice...</div>;
    }

    const templateId = templateSettings?.template?.id || 1;
    const colorHex = templateSettings?.colorHex || '#3B82F6';
    
    const templateProps = {
      invoice,
      business,
      customer,
      payments: payments || [],
      colorHex,
    };

    // Render template based on ID: 1=Standard, 2=Classy, 3=Modern
    switch (templateId) {
      case 2:
        return <ClassyTemplate {...templateProps} />;
      case 3:
        return <ModernTemplate {...templateProps} />;
      case 1:
      default:
        return <StandardTemplate {...templateProps} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-amber-50">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || 'Invoice not found'}</p>
          <Link href="/invoices" className="text-blue-600 hover:text-blue-700 underline">
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  {/* REPLACE YOUR RETURN UI WITH THIS */}

return (
  <div className="min-h-screen bg-[#f6f8fb]">

    {/* NAVBAR */}
    <Navbar />

    <div className="max-w-7xl mx-auto px-4 py-5">

      <Breadcrumbs />

      {/* TOP HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5 print:hidden">

        <div>

          <div className="flex items-center gap-3 flex-wrap">

            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Invoice #{invoice.invoiceNumber}
            </h1>

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

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                invoice.invoiceType === 'INTRA'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {invoice.invoiceType}
            </span>

          </div>

          <p className="text-sm text-gray-500 mt-2">
            Created on {formatDate(invoice.createdAt)}
          </p>
        </div>

        {/* ACTION BUTTONS */}
       {/* ACTION BUTTONS */}
<div className="flex flex-wrap gap-3">

  {/* BACK */}
  <Link
    href="/invoices"
    className="h-11 w-11 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 inline-flex items-center justify-center transition shadow-sm"
  >
    <ArrowLeft className="w-5 h-5" />
  </Link>

  {/* EDIT */}
  <Link
    href={`/invoices/${invoiceId}/edit`}
    className="h-11 px-5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 inline-flex items-center gap-2 justify-center transition shadow-sm"
  >
    <Pencil className="w-4 h-4" />

    Edit Invoice
  </Link>

  {/* PRINT */}
  <button
    onClick={handlePrint}
    className="h-11 px-5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium inline-flex items-center gap-2 justify-center transition shadow-sm"
  >
    <Printer className="w-4 h-4" />

    Print Invoice
  </button>

</div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5 print:hidden">

        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">

          <p className="text-xs text-gray-500 mb-1">
            Invoice Amount
          </p>

          <h2 className="text-lg font-semibold text-gray-900">
            {formatCurrency(
              invoice.totalAmount || invoice.total
            )}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">

          <p className="text-xs text-gray-500 mb-1">
            Paid Amount
          </p>

          <h2 className="text-lg font-semibold text-green-600">
            {formatCurrency(
              invoice.paidAmount || 0
            )}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">

          <p className="text-xs text-gray-500 mb-1">
            Due Amount
          </p>

          <h2 className="text-lg font-semibold text-red-600">
            {formatCurrency(
              invoice.dueAmount ||
                invoice.totalAmount ||
                invoice.total
            )}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">

          <p className="text-xs text-gray-500 mb-1">
            Payment Count
          </p>

          <h2 className="text-lg font-semibold text-gray-900">
            {payments.length}
          </h2>
        </div>

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-5">

        {/* INVOICE PREVIEW */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100 print:hidden">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Invoice Preview
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Printable invoice document
                </p>
              </div>

            </div>
          </div>

          <div
            ref={printRef}
            className="bg-white overflow-x-auto"
          >
            {renderInvoiceTemplate()}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-5 print:hidden">

          {/* PAYMENT HISTORY */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

            <div className="p-5 border-b border-gray-100 flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Payments
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Payment history
                </p>
              </div>

              {invoice.status !== 'PAID' && (
                <button
                  onClick={() =>
                    setShowPaymentModal(true)
                  }
                  className="h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
                >
                  + Add
                </button>
              )}
            </div>

            {payments.length > 0 ? (

              <div className="divide-y divide-gray-100">

                {payments.map((payment: any) => (

                  <div
                    key={payment.id}
                    className="p-4"
                  >

                    <div className="flex items-start justify-between">

                      <div>

                        <p className="text-sm font-medium text-gray-900">
                          {payment.paymentMethod}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(
                            payment.paymentDate
                          )}
                        </p>

                        {payment.referenceId && (
                          <p className="text-xs text-gray-400 mt-1">
                            Ref: {payment.referenceId}
                          </p>
                        )}

                      </div>

                      <div className="text-right">

                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(
                            payment.amount
                          )}
                        </p>

                        <button
                          onClick={() =>
                            handleDeletePayment(
                              payment.id
                            )
                          }
                          className="text-xs text-red-500 hover:text-red-600 mt-2"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            ) : (

              <div className="p-8 text-center">

                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2"
                    />
                  </svg>
                </div>

                <h3 className="text-sm font-semibold text-gray-900">
                  No Payments Yet
                </h3>

                <p className="text-xs text-gray-500 mt-2">
                  Add payment records here
                </p>
              </div>
            )}
          </div>

          {/* CUSTOMER INFO */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-5">

            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Customer
            </h2>

            <div className="space-y-4">

              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Name
                </p>

                <p className="text-sm font-medium text-gray-900">
                  {customer?.name ||
                    invoice.customerName ||
                    'N/A'}
                </p>
              </div>

              {customer?.phone && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Phone
                  </p>

                  <p className="text-sm font-medium text-gray-900">
                    {customer.phone}
                  </p>
                </div>
              )}

              {customer?.email && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Email
                  </p>

                  <p className="text-sm font-medium text-gray-900 break-all">
                    {customer.email}
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 print:hidden">

          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">

            <div className="p-6 border-b border-gray-100">

              <h2 className="text-2xl font-semibold text-gray-900">
                Add Payment
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Record invoice payment
              </p>
            </div>

            <form
              onSubmit={handleAddPayment}
              className="p-6 space-y-5"
            >

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Amount
                </label>

                <input
                  type="number"
                  value={paymentForm.amount || ''}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      amount: parseFloat(
                        e.target.value
                      ),
                    })
                  }
                  className="w-full h-11 px-4 rounded-2xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Due Amount:{' '}
                  {formatCurrency(
                    invoice.dueAmount ||
                      invoice.totalAmount ||
                      invoice.total
                  )}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Payment Method
                </label>

                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      paymentMethod:
                        e.target.value,
                    })
                  }
                  className="w-full h-11 px-4 rounded-2xl border border-gray-200 text-gray-900 focus:outline-none"
                >
                  <option value="CASH">
                    Cash
                  </option>

                  <option value="BANK">
                    Bank Transfer
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="CARD">
                    Card
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Date
                  </label>

                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        paymentDate:
                          e.target.value,
                      })
                    }
                    className="w-full h-11 px-4 rounded-2xl border border-gray-200 text-gray-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Reference
                  </label>

                  <input
                    type="text"
                    value={paymentForm.referenceId}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        referenceId:
                          e.target.value,
                      })
                    }
                    placeholder="Txn ID"
                    className="w-full h-11 px-4 rounded-2xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>

              </div>

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowPaymentModal(false)
                  }
                  className="flex-1 h-11 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 h-11 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
                >
                  Save Payment
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  </div>
);
}
