'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Breadcrumbs from '@/components/Breadcrumbs';


interface InvoiceItem {
  id?: number;
  itemName: string;
  itemDescription: string;
  quantity: number;
  price: number;
  discount: number;
  gstRate: number;
  lineTotal: number;
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [business, setBusiness] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    customerId: '',
    invoiceDate: '',
    dueDate: '',
    notes: '',
    invoiceType: 'INTRA',
    dueNotes: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    customerStateCode: '',
    customerGstin: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      itemName: '',
      itemDescription: '',
      quantity: 1,
      price: 0,
      discount: 0,
      gstRate: 18,
      lineTotal: 0,
    },
  ]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router, invoiceId]);

  const loadData = async () => {
    try {
      // Load invoice
      const invoiceData = await apiClient.getInvoiceById(parseInt(invoiceId));
      setInvoice(invoiceData);
      
      // Load customers
      const customerList = await apiClient.getCustomers();
      setCustomers(customerList);

      // Load business
      const businessData = await apiClient.getBusiness();
      setBusiness(businessData);

      // Load payments
      try {
        const paymentData = await apiClient.getPaymentsByInvoice(parseInt(invoiceId));
        setPayments(paymentData || []);
      } catch (err) {
        console.error('Error loading payments:', err);
        setPayments([]);
      }

      // Populate form
      setFormData({
        customerId: invoiceData.customerId?.toString() || '',
        invoiceDate: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toISOString().split('T')[0] : '',
        dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate).toISOString().split('T')[0] : '',
        notes: invoiceData.notes || '',
        invoiceType: invoiceData.invoiceType || 'INTRA',
        dueNotes: invoiceData.dueNotes || '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        customerCity: '',
        customerStateCode: '',
        customerGstin: '',
      });

      // Load customer details
      if (invoiceData.customerId) {
        try {
          const customerData = await apiClient.getCustomerById(invoiceData.customerId);
          setFormData(prev => ({
            ...prev,
            customerId: invoiceData.customerId?.toString() || '',
            invoiceDate: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toISOString().split('T')[0] : '',
            dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate).toISOString().split('T')[0] : '',
            notes: invoiceData.notes || '',
            invoiceType: invoiceData.invoiceType || 'INTRA',
            dueNotes: invoiceData.dueNotes || '',
            customerName: customerData.name || '',
            customerEmail: customerData.email || '',
            customerPhone: customerData.phone || '',
            customerAddress: customerData.address || '',
            customerCity: customerData.city || '',
            customerStateCode: customerData.stateCode || '',
            customerGstin: customerData.gstin || '',
          }));
        } catch (err) {
          console.error('Error loading customer:', err);
        }
      }

      // Populate items
      if (invoiceData.items && invoiceData.items.length > 0) {
        setItems(invoiceData.items.map((item: any) => ({
          id: item.id,
          itemName: item.itemName || '',
          itemDescription: item.itemDescription || '',
          quantity: item.quantity || 1,
          price: item.price || 0,
          discount: item.discount || 0,
          gstRate: item.gstRate || 18,
          lineTotal: item.lineTotal || 0,
        })));
      }

    } catch (err: any) {
      alert(err.message || 'Failed to load invoice');
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const calculateLineTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.price;
    const discountAmount = (subtotal * item.discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = (afterDiscount * item.gstRate) / 100;
    return afterDiscount + gstAmount;
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    updatedItems[index].lineTotal = calculateLineTotal(updatedItems[index]);
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemName: '',
        itemDescription: '',
        quantity: 1,
        price: 0,
        discount: 0,
        gstRate: 18,
        lineTotal: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      const discountAmount = (itemSubtotal * item.discount) / 100;
      return sum + (itemSubtotal - discountAmount);
    }, 0);

    const totalDiscount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      return sum + (itemSubtotal * item.discount) / 100;
    }, 0);

    let cgst = 0, sgst = 0, igst = 0;

    if (formData.invoiceType === 'INTRA') {
      const totalGst = items.reduce((sum, item) => {
        const itemSubtotal = item.quantity * item.price;
        const discountAmount = (itemSubtotal * item.discount) / 100;
        const afterDiscount = itemSubtotal - discountAmount;
        return sum + (afterDiscount * item.gstRate) / 100;
      }, 0);
      cgst = totalGst / 2;
      sgst = totalGst / 2;
    } else {
      igst = items.reduce((sum, item) => {
        const itemSubtotal = item.quantity * item.price;
        const discountAmount = (itemSubtotal * item.discount) / 100;
        const afterDiscount = itemSubtotal - discountAmount;
        return sum + (afterDiscount * item.gstRate) / 100;
      }, 0);
    }

    const totalAmount = subtotal + cgst + sgst + igst;

    return { subtotal, totalDiscount, cgst, sgst, igst, totalAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      alert('Please select a customer');
      return;
    }

    if (items.length === 0 || !items[0].itemName) {
      alert('Please add at least one item');
      return;
    }

    setSaving(true);

    try {
      // Update customer details
      if (formData.customerId) {
        const customerUpdateData = {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          address: formData.customerAddress,
          city: formData.customerCity,
          stateCode: formData.customerStateCode,
          gstin: formData.customerGstin,
        };
        
        try {
          await apiClient.updateCustomer(parseInt(formData.customerId), customerUpdateData);
        } catch (err: any) {
          console.warn('Warning: Could not update customer details:', err.message);
          // Continue anyway - customer update is not critical
        }
      }

      const totals = calculateTotals();
      
      const invoiceData = {
        customerId: parseInt(formData.customerId),
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        notes: formData.notes,
        dueNotes: formData.dueNotes,
        invoiceType: formData.invoiceType,
        items: items.map(item => ({
          itemName: item.itemName,
          itemDescription: item.itemDescription,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          gstRate: item.gstRate,
          lineTotal: item.lineTotal,
        })),
        subtotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        totalAmount: totals.totalAmount,
      };

      await apiClient.updateInvoice(parseInt(invoiceId), invoiceData);
      alert('Invoice updated successfully!');
      router.push(`/invoices/${invoiceId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const calculateDueAmount = () => {
    if (!invoice) return 0;
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    return Math.max(0, invoice.totalAmount - totalPayments);
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

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Invoice Generator
            </Link>
            <Link href={`/invoices/${invoiceId}`} className="text-sm text-blue-600 hover:text-blue-700">
              Back to Invoice
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-blue-100 text-sm font-semibold uppercase">Invoice Number</p>
              <p className="text-3xl font-bold mt-1">{invoice?.invoiceNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-semibold uppercase">Invoice Date</p>
              <p className="text-2xl font-semibold mt-1">
                {invoice?.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-IN') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-semibold uppercase">Due Date</p>
              <p className="text-2xl font-semibold mt-1">
                {invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm font-semibold uppercase">Total Amount</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(invoice?.totalAmount || 0)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6">
              <h2 className="text-2xl font-bold text-white">Customer Details</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="10-digit phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">GSTIN</label>
                  <input
                    type="text"
                    value={formData.customerGstin}
                    onChange={(e) => setFormData({ ...formData, customerGstin: e.target.value })}
                    placeholder="15-digit GSTIN"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  placeholder="Street address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.customerCity}
                    onChange={(e) => setFormData({ ...formData, customerCity: e.target.value })}
                    placeholder="City"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State Code</label>
                  <input
                    type="text"
                    value={formData.customerStateCode}
                    onChange={(e) => setFormData({ ...formData, customerStateCode: e.target.value.toUpperCase().slice(0, 2) })}
                    placeholder="MH, DL, KA..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Configuration Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <h2 className="text-2xl font-bold text-white">Invoice Configuration</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Date</label>
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Type</label>
                <select
                  value={formData.invoiceType}
                  onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="INTRA">Intra-State (CGST + SGST)</option>
                  <option value="INTER">Inter-State (IGST)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Invoice Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 font-semibold"
                >
                  + Add Item
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-lg text-gray-900">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name</label>
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                        required
                        placeholder="Product/Service name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Discount (%)</label>
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">GST Rate (%)</label>
                      <select
                        value={item.gstRate}
                        onChange={(e) => handleItemChange(index, 'gstRate', parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={item.itemDescription}
                      onChange={(e) => handleItemChange(index, 'itemDescription', e.target.value)}
                      placeholder="Item description"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="mt-4 bg-blue-50 rounded-lg p-3 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Line Total:</span>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(item.lineTotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Summary Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6">
              <h2 className="text-2xl font-bold text-white">Invoice Summary</h2>
            </div>
            
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-gray-700 text-lg">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
              </div>

              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-green-700 text-lg font-semibold">
                  <span>Total Discount:</span>
                  <span>- {formatCurrency(totals.totalDiscount)}</span>
                </div>
              )}

              {formData.invoiceType === 'INTRA' ? (
                <>
                  <div className="flex justify-between text-gray-700 text-lg">
                    <span className="font-semibold">CGST:</span>
                    <span className="font-semibold">{formatCurrency(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-lg">
                    <span className="font-semibold">SGST:</span>
                    <span className="font-semibold">{formatCurrency(totals.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-gray-700 text-lg">
                  <span className="font-semibold">IGST:</span>
                  <span className="font-semibold">{formatCurrency(totals.igst)}</span>
                </div>
              )}

              <div className="border-t-2 pt-3 mt-3 flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                <span className="text-2xl font-bold text-gray-900">Total Amount:</span>
                <span className="text-3xl font-bold text-blue-600">{formatCurrency(totals.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Dues Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6">
              <h2 className="text-2xl font-bold text-white">Payment & Dues</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1 font-semibold">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(invoice?.totalAmount || 0)}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1 font-semibold">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(payments.reduce((sum, p) => sum + (p.amount || 0), 0))}
                  </p>
                </div>
                
                <div className={`rounded-lg p-4 border-2 ${calculateDueAmount() > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <p className="text-sm text-gray-600 mb-1 font-semibold">Due Amount</p>
                  <p className={`text-2xl font-bold ${calculateDueAmount() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(calculateDueAmount())}
                  </p>
                </div>
              </div>

              {/* Payment History */}
              {payments.length > 0 && (
                <div className="border-t pt-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment History</h4>
                  <div className="space-y-2">
                    {payments.map((payment, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {new Date(payment.paymentDate).toLocaleDateString('en-IN')} - {payment.paymentMethod}
                          </p>
                          {payment.referenceId && <p className="text-xs text-gray-500">Ref: {payment.referenceId}</p>}
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Notes */}
              <div className="border-t pt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Notes (Payment Status / Reminders)
                </label>
                <textarea
                  value={formData.dueNotes}
                  onChange={(e) => setFormData({ ...formData, dueNotes: e.target.value })}
                  rows={3}
                  placeholder="Add notes about payment status, reminders, or follow-up information..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* General Notes Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white">General Notes & Terms</h2>
            </div>
            
            <div className="p-6">
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                placeholder="Add payment terms, delivery details, special conditions, or any other relevant information..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 py-8">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {saving ? 'Updating Invoice...' : 'Update Invoice'}
            </button>
            <Link
              href={`/invoices/${invoiceId}`}
              className="px-8 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-center text-gray-700 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
