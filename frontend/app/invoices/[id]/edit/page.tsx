'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Receipt,
  Calendar,
  FileText,
  User,
  IndianRupee,
} from 'lucide-react';

import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';

import Navbar from '@/components/Navbar';
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

  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router, invoiceId]);

  const loadData = async () => {
    try {
      const invoiceData =
        await apiClient.getInvoiceById(
          parseInt(invoiceId)
        );

      setInvoice(invoiceData);

      if (
        invoiceData.items &&
        invoiceData.items.length > 0
      ) {
        setItems(invoiceData.items);
      }

      try {
        const paymentData =
          await apiClient.getPaymentsByInvoice(
            parseInt(invoiceId)
          );

        setPayments(paymentData || []);
      } catch {
        setPayments([]);
      }

      let customerData: any = {};

      if (invoiceData.customerId) {
        try {
          customerData =
            await apiClient.getCustomerById(
              invoiceData.customerId
            );
        } catch {
          customerData = {};
        }
      }

      setFormData({
        customerId:
          invoiceData.customerId?.toString() || '',

        invoiceDate:
          invoiceData.invoiceDate || '',

        dueDate:
          invoiceData.dueDate || '',

        notes:
          invoiceData.notes || '',

        invoiceType:
          invoiceData.invoiceType || 'INTRA',

        dueNotes:
          invoiceData.dueNotes || '',

        customerName:
          customerData.name || '',

        customerEmail:
          customerData.email || '',

        customerPhone:
          customerData.phone || '',

        customerAddress:
          customerData.address || '',

        customerCity:
          customerData.city || '',

        customerStateCode:
          customerData.stateCode || '',

        customerGstin:
          customerData.gstin || '',
      });

      setLoading(false);
    } catch (err: any) {
      alert(
        err.message || 'Failed to load invoice'
      );

      router.push('/invoices');
    }
  };

  const calculateLineTotal = (
    item: InvoiceItem
  ) => {
    const subtotal =
      item.quantity * item.price;

    const discountAmount =
      (subtotal * item.discount) / 100;

    const afterDiscount =
      subtotal - discountAmount;

    const gstAmount =
      (afterDiscount * item.gstRate) / 100;

    return afterDiscount + gstAmount;
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    updatedItems[index].lineTotal =
      calculateLineTotal(
        updatedItems[index]
      );

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
      setItems(
        items.filter((_, i) => i !== index)
      );
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => {
        const itemSubtotal =
          item.quantity * item.price;

        const discountAmount =
          (itemSubtotal * item.discount) /
          100;

        return (
          sum +
          (itemSubtotal - discountAmount)
        );
      },
      0
    );

    const totalDiscount = items.reduce(
      (sum, item) => {
        const itemSubtotal =
          item.quantity * item.price;

        return (
          sum +
          (itemSubtotal * item.discount) /
            100
        );
      },
      0
    );

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (formData.invoiceType === 'INTRA') {
      const totalGst = items.reduce(
        (sum, item) => {
          const itemSubtotal =
            item.quantity * item.price;

          const discountAmount =
            (itemSubtotal *
              item.discount) /
            100;

          const afterDiscount =
            itemSubtotal -
            discountAmount;

          return (
            sum +
            (afterDiscount *
              item.gstRate) /
              100
          );
        },
        0
      );

      cgst = totalGst / 2;
      sgst = totalGst / 2;
    } else {
      igst = items.reduce(
        (sum, item) => {
          const itemSubtotal =
            item.quantity * item.price;

          const discountAmount =
            (itemSubtotal *
              item.discount) /
            100;

          const afterDiscount =
            itemSubtotal -
            discountAmount;

          return (
            sum +
            (afterDiscount *
              item.gstRate) /
              100
          );
        },
        0
      );
    }

    const totalAmount =
      subtotal + cgst + sgst + igst;

    return {
      subtotal,
      totalDiscount,
      cgst,
      sgst,
      igst,
      totalAmount,
    };
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      items.length === 0 ||
      !items[0].itemName
    ) {
      alert(
        'Please add at least one item'
      );

      return;
    }

    setSaving(true);

    try {
      const totals = calculateTotals();

      const invoiceData = {
        customerId: parseInt(
          formData.customerId
        ),

        invoiceDate:
          formData.invoiceDate,

        dueDate: formData.dueDate,

        notes: formData.notes,

        dueNotes:
          formData.dueNotes,

        invoiceType:
          formData.invoiceType,

        items: items.map((item) => ({
          itemName: item.itemName,
          itemDescription:
            item.itemDescription,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          gstRate: item.gstRate,
          lineTotal: item.lineTotal,
        })),

        subtotal: totals.subtotal,
        totalDiscount:
          totals.totalDiscount,

        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,

        totalAmount:
          totals.totalAmount,
      };

      await apiClient.updateInvoice(
        parseInt(invoiceId),
        invoiceData
      );

      alert(
        'Invoice updated successfully!'
      );

      router.push(
        `/invoices/${invoiceId}`
      );
    } catch (err: any) {
      alert(
        err.message ||
          'Failed to update invoice'
      );
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (
    amount: number
  ) => {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
      }
    ).format(amount);
  };

  const calculateDueAmount = () => {
    if (!invoice) return 0;

    const totalPayments =
      payments.reduce(
        (sum, payment) =>
          sum + (payment.amount || 0),
        0
      );

    return Math.max(
      0,
      invoice.totalAmount -
        totalPayments
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] flex items-center justify-center">
        <div className="text-center">

          <div className="h-12 w-12 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>

          <p className="mt-4 text-sm text-gray-500">
            Loading invoice...
          </p>

        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-[#f6f8fb]">

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-5">

        <Breadcrumbs />

        {/* TOP */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">

          <div>

            <div className="flex items-center gap-3 flex-wrap">

              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Edit Invoice
              </h1>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  invoice?.status ===
                  'PAID'
                    ? 'bg-green-100 text-green-700'
                    : invoice?.status ===
                      'PARTIAL'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {invoice?.status ||
                  'DUE'}
              </span>

            </div>

            <p className="text-sm text-gray-500 mt-2">
              #
              {
                invoice?.invoiceNumber
              }
            </p>

          </div>

          <div className="flex gap-3">

            <Link
              href={`/invoices/${invoiceId}`}
              className="h-11 w-11 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 inline-flex items-center justify-center transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>

            <button
              type="submit"
              form="editInvoiceForm"
              disabled={saving}
              className="h-11 px-5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium inline-flex items-center gap-2 transition disabled:opacity-70"
            >
              <Save className="w-4 h-4" />

              {saving
                ? 'Updating...'
                : 'Update Invoice'}
            </button>

          </div>
        </div>

        <form
          id="editInvoiceForm"
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* CUSTOMER */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">

              <div className="w-11 h-11 rounded-2xl bg-primary-50 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Details
                </h2>

                <p className="text-sm text-gray-500">
                  Customer information cannot be edited
                </p>

              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>

                <label className="text-xs font-medium text-gray-500 block mb-2">
                  Customer Name
                </label>

                <input
                  type="text"
                  value={
                    formData.customerName
                  }
                  disabled
                  className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-700"
                />
              </div>

              <div>

                <label className="text-xs font-medium text-gray-500 block mb-2">
                  Email Address
                </label>

                <input
                  type="text"
                  value={
                    formData.customerEmail
                  }
                  disabled
                  className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-700"
                />
              </div>

            </div>
          </div>

          {/* CONFIG */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">

              <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Invoice Configuration
                </h2>

                <p className="text-sm text-gray-500">
                  Invoice settings and dates
                </p>

              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">

              <div>

                <label className="text-xs font-medium text-gray-500 block mb-2">
                  Invoice Date
                </label>

                <input
                  type="date"
                  value={
                    formData.invoiceDate
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invoiceDate:
                        e.target.value,
                    })
                  }
                  className="w-full h-11 px-4 rounded-2xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>

                <label className="text-xs font-medium text-gray-500 block mb-2">
                  Due Date
                </label>

                <input
                  type="date"
                  value={
                    formData.dueDate
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dueDate:
                        e.target.value,
                    })
                  }
                  className="w-full h-11 px-4 rounded-2xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>

                <label className="text-xs font-medium text-gray-500 block mb-2">
                  Invoice Type
                </label>

                <select
                  value={
                    formData.invoiceType
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      invoiceType:
                        e.target.value,
                    })
                  }
                  className="w-full h-11 px-4 rounded-2xl border border-gray-200 text-gray-900 focus:outline-none"
                >
                  <option value="INTRA">
                    INTRA
                  </option>

                  <option value="INTER">
                    INTER
                  </option>

                </select>
              </div>

            </div>
          </div>
{/* ITEMS SECTION */}
<div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">

    <div className="flex items-center gap-3">

      <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center">
        <Receipt className="w-5 h-5 text-green-600" />
      </div>

      <div>

        <h2 className="text-lg font-semibold text-gray-900">
          Invoice Items
        </h2>

        <p className="text-sm text-gray-500">
          Add or edit invoice items
        </p>

      </div>
    </div>

    <button
      type="button"
      onClick={addItem}
      className="h-11 px-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium inline-flex items-center gap-2 transition"
    >
      <Plus className="w-4 h-4" />

      Add Item
    </button>

  </div>

  <div className="p-6 space-y-5">

    {items.map((item, index) => (

      <div
        key={index}
        className="border border-gray-200 rounded-3xl p-5 bg-gray-50/70"
      >

        <div className="flex items-center justify-between mb-5">

          <div>

            <h3 className="font-semibold text-gray-900">
              Item {index + 1}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Product or service details
            </p>

          </div>

          {items.length > 1 && (
            <button
              type="button"
              onClick={() =>
                removeItem(index)
              }
              className="w-10 h-10 rounded-xl hover:bg-red-100 text-red-600 inline-flex items-center justify-center transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

        </div>

        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          <div>

            <label className="text-xs font-medium text-gray-500 block mb-2">
              Item Name
            </label>

            <input
              type="text"
              value={item.itemName}
              onChange={(e) =>
                handleItemChange(
                  index,
                  'itemName',
                  e.target.value
                )
              }
              placeholder="Product or service name"
              className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>

            <label className="text-xs font-medium text-gray-500 block mb-2">
              Description
            </label>

            <input
              type="text"
              value={
                item.itemDescription
              }
              onChange={(e) =>
                handleItemChange(
                  index,
                  'itemDescription',
                  e.target.value
                )
              }
              placeholder="Optional description"
              className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div>

            <label className="text-xs font-medium text-gray-500 block mb-2">
              Quantity
            </label>

            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(
                  index,
                  'quantity',
                  parseFloat(
                    e.target.value
                  ) || 1
                )
              }
              className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-white text-gray-900 focus:outline-none"
            />
          </div>

          <div>

            <label className="text-xs font-medium text-gray-500 block mb-2">
              Price
            </label>

            <input
              type="number"
              value={item.price}
              onChange={(e) =>
                handleItemChange(
                  index,
                  'price',
                  parseFloat(
                    e.target.value
                  ) || 0
                )
              }
              className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-white text-gray-900 focus:outline-none"
            />
          </div>

          <div>

            <label className="text-xs font-medium text-gray-500 block mb-2">
              Discount %
            </label>

            <input
              type="number"
              value={item.discount}
              onChange={(e) =>
                handleItemChange(
                  index,
                  'discount',
                  parseFloat(
                    e.target.value
                  ) || 0
                )
              }
              className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-white text-gray-900 focus:outline-none"
            />
          </div>

          <div>

            <label className="text-xs font-medium text-gray-500 block mb-2">
              GST %
            </label>

            <select
              value={item.gstRate}
              onChange={(e) =>
                handleItemChange(
                  index,
                  'gstRate',
                  parseFloat(
                    e.target.value
                  )
                )
              }
              className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-white text-gray-900 focus:outline-none"
            >
              <option value="0">
                0%
              </option>

              <option value="5">
                5%
              </option>

              <option value="12">
                12%
              </option>

              <option value="18">
                18%
              </option>

              <option value="28">
                28%
              </option>

            </select>
          </div>

        </div>

        {/* TOTAL */}
        <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between">

          <div>

            <p className="text-xs text-gray-500">
              Line Total
            </p>

            <p className="text-lg font-semibold text-gray-900 mt-1">
              {formatCurrency(
                item.lineTotal
              )}
            </p>

          </div>

          <div className="w-11 h-11 rounded-2xl bg-primary-50 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-primary-600" />
          </div>

        </div>

      </div>
    ))}

  </div>
</div>

{/* TOTAL SUMMARY */}
<div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

  <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">

    <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
      <FileText className="w-5 h-5 text-blue-600" />
    </div>

    <div>

      <h2 className="text-lg font-semibold text-gray-900">
        Invoice Summary
      </h2>

      <p className="text-sm text-gray-500">
        Calculated totals and taxes
      </p>

    </div>
  </div>

  <div className="p-6 space-y-4">

    <div className="flex items-center justify-between">
      <span className="text-gray-600">
        Subtotal
      </span>

      <span className="font-semibold text-gray-900">
        {formatCurrency(
          totals.subtotal
        )}
      </span>
    </div>

    {totals.totalDiscount > 0 && (
      <div className="flex items-center justify-between">
        <span className="text-green-600">
          Discount
        </span>

        <span className="font-semibold text-green-600">
          -
          {formatCurrency(
            totals.totalDiscount
          )}
        </span>
      </div>
    )}

    {formData.invoiceType ===
    'INTRA' ? (
      <>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            CGST
          </span>

          <span className="font-semibold text-gray-900">
            {formatCurrency(
              totals.cgst
            )}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            SGST
          </span>

          <span className="font-semibold text-gray-900">
            {formatCurrency(
              totals.sgst
            )}
          </span>
        </div>
      </>
    ) : (
      <div className="flex items-center justify-between">
        <span className="text-gray-600">
          IGST
        </span>

        <span className="font-semibold text-gray-900">
          {formatCurrency(
            totals.igst
          )}
        </span>
      </div>
    )}

    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">

      <span className="text-lg font-semibold text-gray-900">
        Total Amount
      </span>

      <span className="text-2xl font-bold text-primary-600">
        {formatCurrency(
          totals.totalAmount
        )}
      </span>

    </div>

  </div>
</div>

{/* NOTES */}
<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

  <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">

    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      General Notes
    </h2>

    <textarea
      value={formData.notes}
      onChange={(e) =>
        setFormData({
          ...formData,
          notes: e.target.value,
        })
      }
      rows={5}
      placeholder="Add payment terms or additional information..."
      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-100"
    />
  </div>

  <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">

    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Due Notes
    </h2>

    <textarea
      value={formData.dueNotes}
      onChange={(e) =>
        setFormData({
          ...formData,
          dueNotes:
            e.target.value,
        })
      }
      rows={5}
      placeholder="Add reminders or payment follow-up notes..."
      className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-100"
    />
  </div>

</div>
        </form>
      </div>
    </div>
  );
}