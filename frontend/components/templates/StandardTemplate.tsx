import React from 'react';

interface TemplateProps {
  invoice: any;
  business: any;
  customer: any;
  payments: any[];
  colorHex?: string;
}

function StandardTemplate({ invoice, business, customer, payments, colorHex = '#3B82F6' }: TemplateProps) {
  if (!invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8 print:shadow-none print:mb-0 print:border print:border-gray-200">
      {/* Header */}
      <div className="p-8 border-b border-gray-200" style={{ borderTop: `4px solid ${colorHex}` }}>
        <div className="flex justify-between items-start">
          <div>
            {business?.logoUrl ? (
                <img src={business.logoUrl} alt="Logo" className="h-20 mb-4 object-contain" />
            ) : (
                <h1 className="text-3xl font-bold uppercase tracking-wide mb-2" style={{ color: colorHex }}>
                    {business?.businessName || 'Invoice'}
                </h1>
            )}
            <div className="text-gray-600 text-sm space-y-1">
              {business?.address && <p>{business.address}</p>}
              {business?.city && <p>{business.city}, {business.state} {business.pincode}</p>}
              {business?.phone && <p>Phone: {business.phone}</p>}
              {business?.email && <p>Email: {business.email}</p>}
              {business?.gstin && <p className="font-semibold mt-2">GSTIN: {business.gstin}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">INVOICE</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-end gap-x-4">
                <span className="text-gray-500">Invoice No:</span>
                <span className="font-bold text-gray-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-end gap-x-4">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium text-gray-900">{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
              </div>
              {invoice.dueDate && (
                <div className="flex justify-end gap-x-4">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="font-medium text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="p-8 bg-gray-50 border-b border-gray-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Bill To</h3>
        {customer?.name === 'Cash Sale' ? (
           <p className="text-lg font-bold text-gray-900">Cash Sale</p>
        ) : (
          <div className="text-gray-900">
            <p className="text-lg font-bold mb-1">{customer?.name}</p>
            {customer?.companyName && <p className="font-medium mb-1">{customer.companyName}</p>}
            {customer?.email && <p className="text-sm">{customer.email}</p>}
            {customer?.phone && <p className="text-sm">{customer.phone}</p>}
            {(customer?.address || customer?.city) && (
              <p className="text-sm mt-1">
                {customer.address}{customer.address && customer.city ? ', ' : ''}{customer.city}
              </p>
            )}
            {customer?.gstin && <p className="text-sm font-semibold mt-2">GSTIN: {customer.gstin}</p>}
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="p-8">
        <table className="min-w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
              {invoice.items.some((i: any) => i.discount > 0) && (
                  <th className="py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Disc</th>
              )}
              <th className="py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">GST</th>
              <th className="py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items.map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="py-4 text-sm">
                  <p className="font-medium text-gray-900">{item.itemName}</p>
                  {item.itemDescription && <p className="text-xs text-gray-500 mt-0.5">{item.itemDescription}</p>}
                </td>
                <td className="py-4 text-sm text-right text-gray-900">{item.quantity}</td>
                <td className="py-4 text-sm text-right text-gray-900">{formatCurrency(item.price)}</td>
                {invoice.items.some((i: any) => i.discount > 0) && (
                    <td className="py-4 text-sm text-right text-red-600">
                        {item.discount > 0 ? `-${item.discount}%` : '-'}
                    </td>
                )}
                <td className="py-4 text-sm text-right text-gray-600">{item.gstRate}%</td>
                <td className="py-4 text-sm text-right font-medium text-gray-900">{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-t border-gray-100 pt-8">
            <div className="w-full md:w-1/2 space-y-6">
                {invoice.notes && (
                    <div>
                        <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Notes & Terms</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                )}
                
                {business?.bankName && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
                        <h4 className="font-bold text-blue-900 mb-2">Bank Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-blue-800">
                            <span>Bank:</span> <span className="font-medium">{business.bankName}</span>
                            <span>Account:</span> <span className="font-medium">{business.accountNumber}</span>
                            <span>IFSC:</span> <span className="font-medium">{business.ifscCode}</span>
                        </div>
                    </div>
                )}
                
                {/* Visual Summary of Dues (Yellow/Black suggestion adapted to Standard) */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-green-50 p-3 rounded border border-green-200 text-center">
                        <span className="block text-xs text-gray-500 uppercase">Paid</span>
                        <span className="block text-xl font-bold text-green-700">{formatCurrency(invoice.paidAmount || 0)}</span>
                    </div>
                    <div className="bg-red-50 p-3 rounded border border-red-200 text-center">
                        <span className="block text-xs text-gray-500 uppercase">Balance Due</span>
                        <span className="block text-xl font-bold text-red-700">{formatCurrency(invoice.dueAmount || 0)}</span>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-1/3 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(invoice.totalDiscount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (GST)</span>
                    <span>{formatCurrency(invoice.cgst + invoice.sgst + invoice.igst)}</span>
                </div>
                <div className="border-t border-dashed border-gray-300 my-2"></div>
                <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span style={{ color: colorHex }}>{formatCurrency(invoice.totalAmount)}</span>
                </div>
            </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 p-6 text-center text-xs text-gray-400 border-t border-gray-200">
        <p>This is a computer generated invoice.</p>
      </div>
    </div>
  );
}

export default StandardTemplate;
