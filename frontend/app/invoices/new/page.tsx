'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

type InvoiceItem = {
  itemName: string;
  itemDescription: string;
  quantity: number;
  price: number;
  discount: number;
  gstRate: number;
};

type ValidationErrors = {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  stateCode?: string;
  gstin?: string;
};

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedCustomerData, setSelectedCustomerData] = useState<any>(null);
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Customer Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Customer creation mode
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    stateCode: '',
    gstin: '',
  });
  
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [validationAttempted, setValidationAttempted] = useState(false);
  
  // Current item being added (Inline row)
  const [currentItem, setCurrentItem] = useState<InvoiceItem>({
    itemName: '',
    itemDescription: '',
    quantity: 1,
    price: 0,
    discount: 0,
    gstRate: 18,
  });
  
  // Invoice Fields
  const [invoiceTitle, setInvoiceTitle] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // Validation Functions
  const validateEmail = (email: string) => {
    if (!email) return ''; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address (e.g., user@example.com)';
    }
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return ''; // Optional field
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return 'Phone must be exactly 10 digits (e.g., 9876543210)';
    }
    return '';
  };

  const validateGSTIN = (gstin: string) => {
    if (!gstin) return ''; // Optional field
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(gstin)) {
      return 'GSTIN format invalid. Example: 27AABCP9603R1Z0';
    }
    return '';
  };

  const validateCustomerForm = () => {
    const errors: ValidationErrors = {};

    if (!newCustomer.name?.trim()) {
      errors.name = 'Customer name is required';
    }

    const phoneError = validatePhone(newCustomer.phone);
    if (phoneError) {
      errors.phone = phoneError;
    }

    const emailError = validateEmail(newCustomer.email);
    if (emailError) {
      errors.email = emailError;
    }

    const gstinError = validateGSTIN(newCustomer.gstin);
    if (gstinError) {
      errors.gstin = gstinError;
    }

    setValidationErrors(errors);
    setValidationAttempted(true);
    return Object.keys(errors).length === 0;
  };

  const handleValidateClick = () => {
    const isValid = validateCustomerForm();
    if (isValid) {
      // All validations passed
      return true;
    }
    return false;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadCustomers();
  }, [router]);

  const loadCustomers = async () => {
    try {
      const data = await apiClient.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const addItemToList = () => {
    if (!currentItem.itemName) {
      return; 
    }
    setItems([...items, { ...currentItem }]);
    setCurrentItem({
      itemName: '',
      itemDescription: '',
      quantity: 1,
      price: 0,
      discount: 0,
      gstRate: 18,
    });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const baseTotal = item.quantity * item.price;
    const afterDiscount = baseTotal - item.discount;
    const gstAmount = (afterDiscount * item.gstRate) / 100;
    return afterDiscount + gstAmount;
  };
  
  const calculateItemTax = (item: InvoiceItem) => {
    const baseTotal = item.quantity * item.price;
    const afterDiscount = baseTotal - item.discount;
    return (afterDiscount * item.gstRate) / 100;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price - item.discount), 0);
  };

  const calculateTotalGST = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price - item.discount;
      return sum + (itemTotal * item.gstRate) / 100;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalGST() - totalDiscount;
  };

  const handleCustomerSearch = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(true);
    setSelectedCustomerId(null);
    setSelectedCustomerName('');
    setSelectedCustomerData(null);
  };

  const selectCustomer = (customer: any) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomerName(customer.name);
    setSelectedCustomerData(customer);
    setSearchQuery(customer.name);
    setShowDropdown(false);
  };

  const handleAddNewCustomer = () => {
    setNewCustomer({ ...newCustomer, name: searchQuery });
    setShowNewCustomerForm(true);
    setShowDropdown(false);
  };

  const cancelNewCustomer = () => {
    setShowNewCustomerForm(false);
    setSearchQuery('');
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      stateCode: '',
      gstin: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (items.length === 0) {
      setError('Please add at least one item');
      setLoading(false);
      return;
    }

    try {
      let customerId = selectedCustomerId;
      
      if (showNewCustomerForm && newCustomer.name.trim()) {
        // Validate customer form before submission
        if (!validateCustomerForm()) {
          setError('Please fix the validation errors in the customer form');
          setLoading(false);
          return;
        }

        const createdCustomer = await apiClient.createCustomer({
          name: newCustomer.name,
          phone: newCustomer.phone || undefined,
          email: newCustomer.email || undefined,
          address: newCustomer.address || undefined,
          city: newCustomer.city || undefined,
          stateCode: newCustomer.stateCode || undefined,
          gstin: newCustomer.gstin || undefined,
        });
        customerId = createdCustomer.id;
      } else if (!customerId) {
        throw new Error('Please select a customer');
      }
      
      const invoiceData = {
        invoiceTitle: invoiceTitle || undefined,
        invoiceDate: invoiceDate || undefined,
        dueDate: dueDate || undefined,
        totalDiscount: totalDiscount || 0,
        notes: notes || undefined,
        customerId: customerId,
        items: items.map((item) => ({
          itemName: item.itemName,
          itemDescription: item.itemDescription || undefined,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          gstRate: item.gstRate,
        })),
      };

      const response = await apiClient.createInvoice(invoiceData);
      router.push(`/invoices/${response.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs />
      </div>
      
      <nav className="mb-8 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <Link
              href="/invoices"
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
           </Link>
           <h1 className="text-2xl font-bold text-gray-800">New Invoice</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-semibold text-white shadow-md transition ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Saving...' : 'Save Invoice'}
        </button>
      </nav>

      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden animate-fade-in">
        {/* Document Header Region */}
        <div className="p-8 border-b border-gray-100">
<h2 className="text-lg font-semibold text-gray-900 mb-6">Invoice Details</h2>
          
          <div className="flex flex-col md:flex-row justify-between gap-8">
            
            {/* Left: Customer Selection (Bill To) */}
            <div className="flex-1 max-w-md">
               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                 Bill To
               </label>
               
               {!showNewCustomerForm ? (
                 <div className="relative" ref={dropdownRef}>
                   {!selectedCustomerData ? (
                     <>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleCustomerSearch(e.target.value)}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Select or type customer name..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          />
                          <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>

                        {showDropdown && (
                          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map((customer) => (
                                <button
                                  key={customer.id}
                                  onClick={() => selectCustomer(customer)}
                                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition"
                                >
                                  <div className="font-medium text-gray-900">{customer.name}</div>
                                  <div className="text-xs text-gray-500 truncate">{customer.email || customer.phone}</div>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-gray-500 text-sm text-center">No customers found</div>
                            )}
                            
                            {searchQuery && (
                              <button
                                onClick={handleAddNewCustomer}
                                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium flex items-center transition border-t border-gray-100"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create new customer &quot;{searchQuery}&quot;
                              </button>
                            )}
                          </div>
                        )}
                     </>
                   ) : (
                     <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 relative group">
                        <button
                          onClick={() => {
                            setSelectedCustomerData(null);
                            setSelectedCustomerId(null);
                            setSearchQuery('');
                            setValidationAttempted(false);
                          }}
                          className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition"
                        >
                          Change
                        </button>
                        <div className="font-bold text-gray-900 text-lg">{selectedCustomerData.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedCustomerData.address && <div>{selectedCustomerData.address}, {selectedCustomerData.city}</div>}
                          {selectedCustomerData.email && <div>{selectedCustomerData.email}</div>}
                          {selectedCustomerData.phone && <div>{selectedCustomerData.phone}</div>}
                          {selectedCustomerData.gstin && <div className="mt-1 text-xs font-medium text-gray-500">GSTIN: {selectedCustomerData.gstin}</div>}
                        </div>
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-semibold text-gray-700">Add New Customer</span>
                       <button onClick={cancelNewCustomer} className="text-xs text-gray-500 hover:text-red-500 transition">Cancel</button>
                    </div>

                    {/* Validation status alert */}
                    {validationAttempted && Object.keys(validationErrors).length === 0 && (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded p-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">All fields are valid! ✓</span>
                      </div>
                    )}

                    {validationAttempted && Object.keys(validationErrors).length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-red-700">Please fix {Object.keys(validationErrors).length} error{Object.keys(validationErrors).length > 1 ? 's' : ''}:</p>
                            <ul className="text-sm text-red-600 mt-1 space-y-1 list-disc list-inside">
                              {Object.entries(validationErrors).map(([field, error]) => (
                                <li key={field}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Customer Name (Required) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Name *</label>
                      <input 
                        placeholder="Full customer name" 
                        value={newCustomer.name} 
                        onChange={e => {
                          setNewCustomer({...newCustomer, name: e.target.value});
                          setValidationAttempted(false);
                        }}
                        className={`w-full px-3 py-2 border rounded text-sm ${
                          validationAttempted && validationErrors.name 
                            ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                            : 'border-gray-200 focus:ring-blue-500'
                        } focus:ring-1 outline-none`}
                      />
                      {validationAttempted && validationErrors.name && (
                        <p className="text-xs text-red-600 mt-1">✗ {validationErrors.name}</p>
                      )}
                    </div>

                    {/* Phone & Email Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone</label>
                        <input 
                          placeholder="10-digit number" 
                          value={newCustomer.phone} 
                          onChange={e => {
                            setNewCustomer({...newCustomer, phone: e.target.value});
                            setValidationAttempted(false);
                          }}
                          className={`w-full px-3 py-2 border rounded text-sm ${
                            validationAttempted && validationErrors.phone 
                              ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                              : 'border-gray-200 focus:ring-blue-500'
                          } focus:ring-1 outline-none`}
                        />
                        {validationAttempted && validationErrors.phone && (
                          <p className="text-xs text-red-600 mt-1">✗ {validationErrors.phone}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email</label>
                        <input 
                          placeholder="user@example.com" 
                          value={newCustomer.email} 
                          onChange={e => {
                            setNewCustomer({...newCustomer, email: e.target.value});
                            setValidationAttempted(false);
                          }}
                          className={`w-full px-3 py-2 border rounded text-sm ${
                            validationAttempted && validationErrors.email 
                              ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                              : 'border-gray-200 focus:ring-blue-500'
                          } focus:ring-1 outline-none`}
                        />
                        {validationAttempted && validationErrors.email && (
                          <p className="text-xs text-red-600 mt-1">✗ {validationErrors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Address & City Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        placeholder="Street address" 
                        value={newCustomer.address} 
                        onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      <input 
                        placeholder="City" 
                        value={newCustomer.city} 
                        onChange={e => setNewCustomer({...newCustomer, city: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    {/* State Code & GSTIN Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        placeholder="State code (e.g., MH)" 
                        value={newCustomer.stateCode} 
                        onChange={e => setNewCustomer({...newCustomer, stateCode: e.target.value.toUpperCase().slice(0, 2)})}
                        className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none uppercase"
                      />
                      <div>
                        <input 
                          placeholder="GSTIN (optional)" 
                          value={newCustomer.gstin} 
                          onChange={e => {
                            setNewCustomer({...newCustomer, gstin: e.target.value});
                            setValidationAttempted(false);
                          }}
                          className={`w-full px-3 py-2 border rounded text-sm ${
                            validationAttempted && validationErrors.gstin 
                              ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                              : 'border-gray-200 focus:ring-blue-500'
                          } focus:ring-1 outline-none uppercase`}
                        />
                        {validationAttempted && validationErrors.gstin && (
                          <p className="text-xs text-red-600 mt-1">✗ {validationErrors.gstin}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleValidateClick()}
                        className="flex-1 px-4 py-2 bg-blue-50 border border-blue-300 text-blue-700 rounded font-medium text-sm hover:bg-blue-100 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Validate
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading || Object.keys(validationErrors).length > 0}
                        className={`flex-1 px-4 py-2 rounded font-medium text-sm text-white transition ${
                          loading || Object.keys(validationErrors).length > 0
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {loading ? 'Creating...' : 'Create & Use'}
                      </button>
                    </div>
                 </div>
               )}
            </div>

            {/* Right: Invoice Meta */}
            <div className="flex-1 max-w-sm space-y-4">
               <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Invoice Dates & Title</h3>
               
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                 <label className="text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Title</label>
                 <input
                    type="text"
                    value={invoiceTitle}
                    onChange={(e) => setInvoiceTitle(e.target.value)}
                    placeholder="e.g. Consulting Invoice"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition"
                 />
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                   <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Issue Date</label>
                   <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
                   />
                 </div>
                 <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                   <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Due Date</label>
                   <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
                   />
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Items Table Section */}
        <div className="p-8 border-t border-gray-200">
           <h2 className="text-lg font-semibold text-gray-900 mb-6">Line Items</h2>

           {items.length === 0 && (
             <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
               <p className="text-sm text-blue-700 font-medium">Tip: Add items to your invoice using the form below</p>
             </div>
           )}

           <table className="w-full table-fixed">
             <thead>
               <tr className="text-left text-xs font-semibold text-gray-500 uppercase border-b-2 border-gray-300">
                 <th className="pb-3 w-[35%]">Item & Description</th>
                 <th className="pb-3 w-[10%] text-right">Qty</th>
                 <th className="pb-3 w-[15%] text-right">Price</th>
                 <th className="pb-3 w-[12%] text-right">GST %</th>
                 <th className="pb-3 w-[12%] text-right">Discount</th>
                 <th className="pb-3 w-[12%] text-right">Total</th>
                 <th className="pb-3 w-[4%]"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {/* Existing Items */}
               {items.map((item, index) => (
                 <tr key={index} className="group hover:bg-blue-50 transition">
                   <td className="py-4 align-top">
                     <div className="font-medium text-gray-900">{item.itemName}</div>
                     {item.itemDescription && <div className="text-sm text-gray-500 mt-1">{item.itemDescription}</div>}
                   </td>
                   <td className="py-4 text-right align-top text-gray-700">{item.quantity}</td>
                   <td className="py-4 text-right align-top text-gray-700">{item.price.toFixed(2)}</td>
                   <td className="py-4 text-right align-top text-xs text-gray-500">
                     {item.gstRate}% <br/>
                     <span className="text-gray-400">({formatCurrency(calculateItemTax(item))})</span>
                   </td>
                   <td className="py-4 text-right align-top text-gray-700">{item.discount > 0 ? item.discount.toFixed(2) : '-'}</td>
                   <td className="py-4 text-right align-top font-medium text-gray-900">{formatCurrency(calculateItemTotal(item))}</td>
                   <td className="py-4 text-center align-top">
                     <button
                        onClick={() => removeItem(index)}
                        className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                        title="Remove item"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </button>
                   </td>
                 </tr>
               ))}

               {/* Input Row for New Item */}
               <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
                 <td className="py-3 pr-2">
                   <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Item Name</label>
                   <input
                    type="text"
                    placeholder="e.g., Web Design Services"
                    value={currentItem.itemName}
                    onChange={(e) => setCurrentItem({ ...currentItem, itemName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium mb-1"
                   />
                   <input
                    type="text"
                    placeholder="Description (optional)"
                    value={currentItem.itemDescription}
                    onChange={(e) => setCurrentItem({ ...currentItem, itemDescription: e.target.value })}
                    className="w-full px-3 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                   />
                 </td>
                 <td className="py-3 px-1">
                   <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Qty</label>
                   <input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseFloat(e.target.value) || 1 })}
                    className="w-full px-2 py-2 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm text-right"
                   />
                 </td>
                 <td className="py-3 px-1">
                   <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Price</label>
                   <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={currentItem.price}
                    onChange={(e) => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-2 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm text-right"
                   />
                 </td>
                 <td className="py-3 px-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">GST%</label>
                    <select
                      value={currentItem.gstRate}
                      onChange={(e) => setCurrentItem({ ...currentItem, gstRate: parseFloat(e.target.value) })}
                      className="w-full px-2 py-2 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm text-right appearance-none"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                 </td>
                 <td className="py-3 px-1">
                   <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Discount</label>
                   <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={currentItem.discount}
                    onChange={(e) => setCurrentItem({ ...currentItem, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-2 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm text-right"
                   />
                 </td>
                 <td className="py-3 px-2">
                   <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block text-right">Total</label>
                   <div className="text-right font-bold text-gray-900 text-sm bg-white p-2 rounded border border-gray-200">
                     {formatCurrency(calculateItemTotal(currentItem))}
                   </div>
                 </td>
                 <td className="py-3 text-center align-middle">
                   <button
                    onClick={addItemToList}
                    disabled={!currentItem.itemName.trim()}
                    className={`p-2 text-white rounded-full transition shadow-sm ${
                      currentItem.itemName.trim() 
                        ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    title="Add Item"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                     </svg>
                   </button>
                 </td>
               </tr>
             </tbody>
           </table>
        </div>

        {/* Notes and Summary Section */}
        <div className="bg-gray-50 p-8 border-t border-gray-200">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             
             {/* Left: Notes and Error Display */}
             <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Notes & Terms</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Add payment terms, delivery details, or any special notes..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                />
                
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 p-4 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}
             </div>
             
             {/* Right: Summary */}
             <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Summary</h3>
                
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                   <div className="flex justify-between text-gray-600 text-sm">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(calculateSubtotal())}</span>
                   </div>
                   <div className="flex justify-between text-gray-600 text-sm">
                      <span>GST Total</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(calculateTotalGST())}</span>
                   </div>
                   <div className="flex justify-between items-center text-gray-600 text-sm border-t border-gray-200 pt-3">
                      <span>Overall Discount</span>
                      <div className="w-32">
                         <input
                           type="number"
                           value={totalDiscount}
                           onChange={(e) => setTotalDiscount(parseFloat(e.target.value) || 0)}
                           className="w-full px-3 py-1 text-right border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                           placeholder="0"
                         />
                      </div>
                   </div>
                   <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total Amount</span>
                      <span className="text-3xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                   </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || items.length === 0}
                  className={`w-full py-3 rounded-lg font-semibold text-white text-lg transition flex items-center justify-center gap-2 ${
                    loading || items.length === 0
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                  }`}
                >
                  {loading ? (
                    <>Saving Invoice...</>
                  ) : (
                    <>Save & Generate Invoice</>
                  )}
                </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
