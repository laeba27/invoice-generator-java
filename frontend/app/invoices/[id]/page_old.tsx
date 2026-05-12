'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { useReactToPrint } from 'react-to-print';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const componentRef = useRef(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceId: '',
    bankName: '',
    accountDetails: '',
  });

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice-${invoice?.invoiceNumber || 'Document'}`,
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (invoiceId) {
      loadInvoice();
    }
  }, [router, invoiceId]);

  const loadInvoice = async () => {
    try {
      const data = await apiClient.getInvoiceById(parseInt(invoiceId));
      setInvoice(data);
      
      // Load business details
      const businessData = await apiClient.getBusiness();
      setBusiness(businessData);
      
      // Load customer details if invoice has customerId
      if (data.customerId) {
        try {
          const customerData = await apiClient.getCustomerById(data.customerId);
          setCustomer(customerData);
        } catch (err) {
          console.error('Error loading customer:', err);
        }
      }
      
      await loadPayments();
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const paymentData = await apiClient.getPaymentsByInvoice(parseInt(invoiceId));
      setPayments(paymentData);
    } catch (err) {
      console.error('Error loading payments:', err);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dueAmount = invoice.dueAmount || invoice.totalAmount || invoice.total;
    
    if (paymentForm.amount > dueAmount) {
      alert(`Payment amount cannot exceed due amount of ${formatCurrency(dueAmount)}`);
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
      
      // Reload invoice and payments
      await loadInvoice();
    } catch (err: any) {
      alert(err.message || 'Failed to add payment');
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      await apiClient.deletePayment(paymentId);
      await loadInvoice();
    } catch (err: any) {
      alert(err.message || 'Failed to delete payment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DUE':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading invoice...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || 'Invoice not found'}</p>
          <Link
            href="/invoices"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Invoice Generator
            </Link>
            <Link
              href="/invoices"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Back to Invoices
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-900">Invoice Details</h2>
            {invoice.status && (
              <span className={`px-4 py-1 text-sm font-semibold rounded-full border-2 ${getStatusBadgeColor(invoice.status)}`}>
                {invoice.status}
              </span>
            )}
          </div>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Print / Download PDF
          </button>
        </div>

        <div ref={componentRef} className="bg-white rounded-lg shadow-lg p-8">
          {/* Business Header */}
          {business && (
            <div className="border-b-2 border-gray-300 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-orange-600 mb-2">INVOICE</h1>
                  {business.logo && (
                    <img src={business.logo} alt="Company Logo" className="h-16 mb-3" />
                  )}
                  <div className="text-gray-800">
                    <p className="font-bold text-xl">{business.businessname}</p>
                    {business.phone && <p className="text-sm">Phone: {business.phone}</p>}
                    {business.email && <p className="text-sm">Email: {business.email}</p>}
                    {business.address && <p className="text-sm mt-1">{business.address}</p>}
                    {business.city && business.state && (
                      <p className="text-sm">{business.city}, {business.state}, {business.country || 'India'}</p>
                    )}
                    {business.gstin && <p className="text-sm mt-1">GSTIN: {business.gstin}</p>}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Invoice No</p>
                    <p className="font-bold text-lg">{invoice.invoiceNumber}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Invoice Date</p>
                    <p className="font-medium">{formatDate(invoice.invoiceDate || invoice.createdAt)}</p>
                  </div>
                  {invoice.dueDate && (
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customer Details */}
          {customer && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-2">BILL TO</h3>
              <div className="text-gray-800">
                <p className="font-bold">{customer.name}</p>
                {customer.companyName && <p className="text-sm">Company: {customer.companyName}</p>}
                {customer.phone && <p className="text-sm">Phone: {customer.phone}</p>}
                {customer.email && <p className="text-sm">Email: {customer.email}</p>}
                {customer.address && <p className="text-sm mt-1">{customer.address}</p>}
                {customer.city && customer.state && (
                  <p className="text-sm">{customer.city}, {customer.state}</p>
                )}
                {customer.gstin && <p className="text-sm mt-1">GSTIN: {customer.gstin}</p>}
              </div>
            </div>
          )}

          {/* Invoice Type Badge */}
          <div className="mb-6">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                invoice.invoiceType === 'INTRA'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {invoice.invoiceType === 'INTRA' ? 'Intra-State' : 'Inter-State'} GST
            </span>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Item
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  {invoice.items.some((item: any) => item.discount > 0) && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Discount
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    GST %
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">{item.itemName}</div>
                      {item.itemDescription && (
                        <div className="text-xs text-gray-500 mt-1">{item.itemDescription}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(item.price)}
                    </td>
                    {invoice.items.some((i: any) => i.discount > 0) && (
                      <td className="px-4 py-3 text-sm text-right text-green-700">
                        {item.discount > 0 ? `- ${formatCurrency(item.discount)}` : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {item.gstRate}%
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t pt-6">
            <div className="flex justify-end">
              <div className="w-80 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>

                {invoice.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span className="font-medium">Discount:</span>
                    <span className="font-medium">- {formatCurrency(invoice.totalDiscount)}</span>
                  </div>
                )}

                {invoice.invoiceType === 'INTRA' ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CGST:</span>
                      <span className="font-medium">{formatCurrency(invoice.cgst)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">SGST:</span>
                      <span className="font-medium">{formatCurrency(invoice.sgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IGST:</span>
                    <span className="font-medium">{formatCurrency(invoice.igst)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold border-t pt-3 bg-orange-50 px-3 py-2 rounded">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(invoice.totalAmount || invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary - Visible on print */}
          {payments.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-1">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(invoice.paidAmount || 0)}</p>
                </div>
                <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-1">Balance Due</p>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(invoice.dueAmount || 0)}</p>
                </div>
              </div>
              
              {business && business.bankName && (
                <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Method</h4>
                  <div className="text-sm text-gray-700">
                    <p><span className="font-medium">Bank Transfer / UPI</span></p>
                    {business.accountName && <p>Account Name: {business.accountName}</p>}
                    {business.bankName && <p>Bank: {business.bankName}</p>}
                    {business.accountNumber && <p>Account No: {business.accountNumber}</p>}
                    {business.ifscCode && <p>IFSC: {business.ifscCode}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Notes */}
          {invoice.notes && (
            <div className="mt-6 border-t pt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes:</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Signature */}
          <div className="mt-8 border-t pt-6 text-right">
            <p className="text-sm text-gray-600 mb-8">Authorized Signatory</p>
            <p className="font-semibold text-gray-900">Accounts Manager</p>
          </div>
        </div>
        
        {/* Payment Tracking Section - Only show on screen, not print */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8 print:hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Payment History</h3>
            {invoice.status !== 'PAID' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                + Add Payment
              </button>
            )}
          </div>

          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reference
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {payment.referenceId || '-'}
                        {payment.bankName && <div className="text-xs">{payment.bankName}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-green-700">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No payments recorded yet</p>
              <p className="text-sm mt-2">Click "Add Payment" to record a payment</p>
            </div>
          )}
        </div>

        {/* Add Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Payment</h3>
              
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => {
                      const inputValue = parseFloat(e.target.value);
                      const maxAmount = invoice.dueAmount || invoice.totalAmount || invoice.total;
                      
                      if (inputValue > maxAmount) {
                        alert(`Amount cannot exceed due amount of ${formatCurrency(maxAmount)}`);
                        return;
                      }
                      
                      setPaymentForm({ ...paymentForm, amount: inputValue });
                    }}
                    required
                    min="0.01"
                    max={invoice.dueAmount || invoice.totalAmount || invoice.total}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Due Amount: {formatCurrency(invoice.dueAmount || invoice.totalAmount || invoice.total)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference ID
                  </label>
                  <input
                    type="text"
                    value={paymentForm.referenceId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceId: e.target.value })}
                    placeholder="Transaction/Reference ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {(paymentForm.paymentMethod === 'BANK' || paymentForm.paymentMethod === 'CHEQUE') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={paymentForm.bankName}
                        onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                        placeholder="Bank name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Details
                      </label>
                      <input
                        type="text"
                        value={paymentForm.accountDetails}
                        onChange={(e) => setPaymentForm({ ...paymentForm, accountDetails: e.target.value })}
                        placeholder="Account number or details"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  >
                    Add Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
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
