import React from 'react';

interface TemplateProps {
  invoice: any;
  business: any;
  customer: any;
  payments: any[];
  colorHex?: string;
}

function ModernTemplate({ invoice, business, customer, payments, colorHex = '#10B981' }: TemplateProps) {
  if (!invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };
    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8 print:shadow-none font-sans p-8 border border-gray-100">
             <div className="flex justify-between items-end mb-12 pb-6 border-b border-gray-100">
                <div>
                     {business?.logoUrl && (
                        <img src={business.logoUrl} alt="Logo" className="h-16 mb-6 object-contain" />
                    )}
                    <h2 className="text-xl font-bold text-gray-900">{business?.businessName}</h2>
                    <div className="text-gray-500 text-sm mt-2">
                        <p>{business?.email}</p>
                        <p>{business?.phone}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h1 className="text-5xl font-light tracking-tight text-gray-300">INVOICE</h1>
                    <p className="text-xl font-bold mt-2" style={{ color: colorHex }}>#{invoice.invoiceNumber}</p>
                    <p className="text-gray-500 text-sm">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Billed To</span>
                    <h3 className="text-xl font-bold text-gray-900">{customer?.name}</h3>
                    <div className="text-gray-500 text-sm mt-2 space-y-1">
                        <p>{customer?.companyName}</p>
                        <p>{customer?.address}</p>
                        <p>{customer?.city}</p>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-500">Total Due</span>
                        <span className="font-bold text-gray-900">{formatCurrency(invoice.dueAmount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                            className="h-2 rounded-full" 
                            style={{ 
                                width: `${Math.min(((invoice.paidAmount || 0) / invoice.totalAmount) * 100, 100)}%`,
                                backgroundColor: colorHex 
                            }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Paid {formatCurrency(invoice.paidAmount)}</span>
                        <span>Total {formatCurrency(invoice.totalAmount)}</span>
                    </div>
                </div>
             </div>

             <table className="w-full mb-8">
                 <thead>
                     <tr className="text-left">
                         <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider pl-4">Item</th>
                         <th className="pb-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                         <th className="pb-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                         <th className="pb-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider pr-4">Total</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                     {invoice.items.map((item: any, i: number) => (
                         <tr key={i}>
                             <td className="py-4 pl-4">
                                 <p className="font-bold text-gray-800">{item.itemName}</p>
                             </td>
                             <td className="py-4 text-right text-gray-600">{formatCurrency(item.price)}</td>
                             <td className="py-4 text-right text-gray-600">{item.quantity}</td>
                             <td className="py-4 text-right font-bold text-gray-900 pr-4">{formatCurrency(item.lineTotal)}</td>
                         </tr>
                     ))}
                 </tbody>
             </table>

             <div className="flex justify-end pt-6 border-t border-gray-100">
                 <div className="w-64 space-y-3">
                     <div className="flex justify-between text-gray-500 text-sm">
                         <span>Subtotal</span>
                         <span>{formatCurrency(invoice.subtotal)}</span>
                     </div>
                     <div className="flex justify-between text-gray-500 text-sm">
                         <span>Taxes</span>
                         <span>{formatCurrency(invoice.cgst + invoice.sgst + invoice.igst)}</span>
                     </div>
                     <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                         <span>Total</span>
                         <span style={{ color: colorHex }}>{formatCurrency(invoice.totalAmount)}</span>
                     </div>
                 </div>
             </div>
        </div>
    );
}

export default ModernTemplate;
