import React from 'react';

interface TemplateProps {
  invoice: any;
  business: any;
  customer: any;
  payments: any[];
  colorHex?: string;
}

function ClassyTemplate({ invoice, business, customer, payments, colorHex = '#F59E0B' }: TemplateProps) {
  if (!invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const themeColor = (!colorHex || colorHex === '#000000') ? '#F59E0B' : colorHex; 

    return (
        <div className="bg-white rounded-none shadow-xl overflow-hidden mb-8 print:shadow-none font-serif min-h-[1000px] flex flex-col">
             {/* Header Section: Black Background, Theme Text */}
             <div className="bg-gray-900 text-white p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 transform rotate-45 translate-x-32 -translate-y-32 z-0"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start">
                    <div>
                        <h1 className="text-6xl font-bold tracking-tighter mb-2" style={{ color: themeColor }}>INVOICE</h1>
                         <p className="text-gray-400 uppercase tracking-widest text-sm font-sans px-1">NO. {invoice.invoiceNumber}</p>
                    </div>
                    <div className="mt-8 md:mt-0 text-right">
                         {business?.logoUrl ? (
                            <img src={business.logoUrl} alt="Logo" className="h-24 mb-4 object-contain ml-auto bg-white p-2 rounded" />
                        ) : (
                            <h2 className="text-2xl font-bold mb-1 tracking-wide">{business?.businessName}</h2>
                        )}
                        <p className="text-gray-400 text-sm whitespace-pre-line leading-relaxed">{business?.address}</p>
                        <p className="text-gray-400 text-sm mt-1">{business?.email} | {business?.phone}</p>
                        {business?.gstin && <p className="text-gray-500 text-xs mt-2">GSTIN: {business.gstin}</p>}
                    </div>
                </div>
             </div>

             {/* Info Bar: Theme Background */}
             <div style={{ backgroundColor: themeColor }} className="px-12 py-5 flex flex-wrap gap-12 text-gray-900 font-bold text-sm uppercase tracking-wide shadow-md z-10 relative">
                <div>
                    <span className="opacity-60 block text-[10px] mb-1">Invoice Date</span>
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                </div>
                {invoice.dueDate && (
                    <div>
                        <span className="opacity-60 block text-[10px] mb-1">Payment Due</span>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                )}
                <div className="ml-auto flex items-center gap-4">
                     <span className="opacity-60 text-[10px]">Total Amount</span>
                     <span className="text-xl">{formatCurrency(invoice.totalAmount)}</span>
                </div>
             </div>

             <div className="p-12 flex-grow">
                {/* Bill To Grid */}
                <div className="flex flex-col md:flex-row justify-between mb-16 gap-8">
                    <div className="w-full md:w-1/2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 border-b pb-2">Invoiced To</h3>
                        <div className="text-gray-800 text-lg pl-2 border-l-2" style={{ borderColor: themeColor }}>
                            <p className="font-bold text-2xl mb-1">{customer?.name}</p>
                            {customer?.companyName && <p className="font-medium text-gray-600 mb-1">{customer.companyName}</p>}
                            <p className="text-sm mt-3 text-gray-500 leading-relaxed">{customer?.address}</p>
                            <p className="text-sm text-gray-500">{customer?.city}</p>
                            <p className="text-sm text-gray-500 mt-2">{customer?.phone}</p>
                        </div>
                    </div>
                    
                    {/* The "small area" for payment amount and due amount request */}
                    <div className="w-full md:w-1/3 bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm self-start">
                        <h4 className="font-sans font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2 text-sm uppercase tracking-wide">Payment Summary</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Taxes</span>
                                <span className="font-medium">{formatCurrency(invoice.cgst + invoice.sgst + invoice.igst)}</span>
                            </div>
                            <div className="border-t border-gray-200 my-2 pt-2">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-green-600 font-semibold text-sm">Paid</span>
                                    <span className="font-bold text-green-600">{formatCurrency(invoice.paidAmount || 0)}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-red-500 font-semibold text-sm">Due</span>
                                    <span className="font-bold text-red-600 text-lg">{formatCurrency(invoice.dueAmount || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full mb-12">
                    <thead>
                        <tr className="border-b-4 border-gray-900">
                            <th className="text-left font-bold py-4 uppercase text-xs tracking-wider w-1/2">Item Description</th>
                            <th className="text-center font-bold py-4 uppercase text-xs tracking-wider">Qty</th>
                            <th className="text-right font-bold py-4 uppercase text-xs tracking-wider">Price</th>
                            <th className="text-right font-bold py-4 uppercase text-xs tracking-wider w-32">Total</th>
                        </tr>
                    </thead>
                    <tbody className="font-sans">
                        {invoice.items.map((item: any, i: number) => (
                            <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                <td className="py-5 pr-4">
                                    <p className="font-bold text-gray-800 text-base">{item.itemName}</p>
                                    {item.itemDescription && <p className="text-sm text-gray-500 mt-1 leading-snug">{item.itemDescription}</p>}
                                </td>
                                <td className="py-5 text-center text-gray-600">{item.quantity}</td>
                                <td className="py-5 text-right text-gray-600">{formatCurrency(item.price)}</td>
                                <td className="py-5 text-right font-bold text-gray-900">{formatCurrency(item.lineTotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {invoice.notes && (
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Terms & Notes</h4>
                        <div className="bg-yellow-50 p-6 rounded-l-lg border-l-4 text-sm text-gray-700 leading-relaxed font-sans" style={{ borderColor: themeColor }}>
                            {invoice.notes}
                        </div>
                    </div>
                )}
             </div>
             
             {/* Bottom Bar */}
             <div className="bg-gray-900 text-gray-400 p-8 text-center text-xs tracking-wider uppercase">
                <p className="mb-2">Thank you for your business</p>
                <p>For questions concerning this invoice, please contact {business?.phone || business?.email}</p>
             </div>
        </div>
    );
}

export default ClassyTemplate;
