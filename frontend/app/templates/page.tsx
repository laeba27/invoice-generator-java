'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import StandardTemplate from '@/components/templates/StandardTemplate';
import ClassyTemplate from '@/components/templates/ClassyTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';
import {
  LayoutTemplate,
  Palette,
  Check,
  Save,
  Eye,
  Sparkles,
  FileText,
  Crown,
  Rocket,
} from 'lucide-react';

// --- Dummy Data for Preview ---
const dummyBusiness = {
  businessName: "Your Business Name",
  address: "123 Business St, Tech City",
  phone: "+91 98765 43210",
  email: "contact@business.com",
  gstNumber: "22AAAAA0000A1Z5",
  stateCode: "22"
};

const dummyCustomer = {
  name: "Sample Client",
  address: "456 Client Ave, Market Town",
  phone: "+91 99887 76655",
  email: "client@example.com",
  gstin: null
};

const dummyInvoiceInvoiceDate = new Date();
const dummyInvoiceDueDate = new Date();
dummyInvoiceDueDate.setDate(dummyInvoiceDueDate.getDate() + 7);

const dummyInvoice = {
  invoiceNumber: "INV-001",
  invoiceDate: dummyInvoiceInvoiceDate.toISOString(),
  dueDate: dummyInvoiceDueDate.toISOString(),
  items: [
    { 
      itemName: "Professional Services", 
      itemDescription: "Consulting and development hours",
      quantity: 10, 
      price: 1500, 
      discount: 0, 
      gstRate: 18, 
      lineTotal: 17700 
    },
    { 
      itemName: "Software License", 
      itemDescription: "Annual subscription",
      quantity: 1, 
      price: 5000, 
      discount: 500, 
      gstRate: 18, 
      lineTotal: 5310 
    }
  ],
  subtotal: 20000,
  totalDiscount: 500,
  taxTotal: 3510,
  total: 23010,
  notes: "This is a sample invoice to demonstrate the template layout. The colors and structure will adapt to your choices.",
  status: "DUE"
};

// --- Interfaces ---

interface Template {
  id: number;
  name: string;
  configJson: string;
  isDefault: boolean;
  createdAt: string;
}

interface PredefinedTemplate {
  id: number;
  name: string;
  usageCount: number;
  previewImageUrl: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  
  // System Template State
  const [systemTemplates, setSystemTemplates] = useState<PredefinedTemplate[]>([]);
  const [selectedSystemTemplateId, setSelectedSystemTemplateId] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [savingSettings, setSavingSettings] = useState(false);
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
        router.push('/profile');
        return;
      }
      setBusiness(businessData);

      // Load System Templates and Settings
      const sysTemplates = await apiClient.getSystemTemplates();
      setSystemTemplates(sysTemplates);
      
      const settings = await apiClient.getSystemTemplateSettings(businessData.id);
      if (settings && settings.template) {
        setSelectedSystemTemplateId(settings.template.id);
        setSelectedColor(settings.colorHex);
      } else if (sysTemplates.length > 0) {
        // Default to first if none selected
        setSelectedSystemTemplateId(sysTemplates[0].id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    if (!selectedSystemTemplateId) return;
    setSavingSettings(true);
    try {
      await apiClient.assignSystemTemplate({
        businessId: business.id,
        templateId: selectedSystemTemplateId,
        colorHex: selectedColor
      });
      alert('Template style saved successfully!');
      loadData(); 
    } catch (err: any) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // --- Render Preview ---
  const renderPreview = () => {
    const selectedTemplate = systemTemplates.find(t => t.id === selectedSystemTemplateId);
    if (!selectedTemplate) return <div className="p-8 text-center text-gray-500">Select a template to preview</div>;

    const props = {
      invoice: dummyInvoice,
      business: { ...dummyBusiness, businessName: business?.businessName || "Your Business" }, 
      customer: dummyCustomer,
      payments: [],
      colorHex: selectedColor
    };

    switch (selectedTemplate.name) {
      case 'Classy': return <ClassyTemplate {...props} />;
      case 'Modern': return <ModernTemplate {...props} />;
      case 'Standard':
      default: return <StandardTemplate {...props} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

 return (
  <div className="min-h-screen bg-[#f6f8fb] font-sans">

    <Navbar />

    <div className="max-w-7xl mx-auto px-4 py-5">

      <Breadcrumbs />

      {/* TOP BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">

        <div>

          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Design Studio
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Customize your invoice appearance and branding
          </p>

        </div>

        <button
          onClick={handleSaveSystemSettings}
          disabled={savingSettings}
          className="h-11 px-5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition shadow-sm inline-flex items-center gap-2 justify-center disabled:opacity-70"
        >

          {savingSettings ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />

              Save & Apply
            </>
          )}

        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5 items-start">

        {/* LEFT SIDEBAR */}
        <div className="flex flex-col gap-5">

          {/* TEMPLATE SELECTION */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

            <div className="flex items-center gap-2 mb-5">

              <LayoutTemplate className="w-5 h-5 text-gray-700" />

              <h2 className="font-semibold text-gray-900">
                Select Template
              </h2>
            </div>

            <div className="space-y-3">

              {systemTemplates.map((tpl) => {

                const Icon =
                  tpl.name === 'Standard'
                    ? FileText
                    : tpl.name === 'Classy'
                    ? Crown
                    : Rocket;

                return (
                  <button
                    key={tpl.id}
                    onClick={() =>
                      setSelectedSystemTemplateId(tpl.id)
                    }
                    className={`w-full relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                      selectedSystemTemplateId === tpl.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                    }`}
                  >

                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        selectedSystemTemplateId === tpl.id
                          ? 'bg-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          selectedSystemTemplateId === tpl.id
                            ? 'text-primary-600'
                            : 'text-gray-500'
                        }`}
                      />
                    </div>

                    <div className="flex-1">

                      <p
                        className={`font-semibold ${
                          selectedSystemTemplateId === tpl.id
                            ? 'text-primary-900'
                            : 'text-gray-900'
                        }`}
                      >
                        {tpl.name}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {tpl.usageCount} businesses use this
                      </p>
                    </div>

                    {selectedSystemTemplateId === tpl.id && (
                      <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                  </button>
                );
              })}
            </div>
          </div>

          {/* COLOR SECTION */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

            <div className="flex items-center gap-2 mb-5">

              <Palette className="w-5 h-5 text-gray-700" />

              <h2 className="font-semibold text-gray-900">
                Brand Color
              </h2>
            </div>

            <div className="flex items-center gap-4">

              <input
                type="color"
                value={selectedColor}
                onChange={(e) =>
                  setSelectedColor(e.target.value)
                }
                className="h-14 w-20 rounded-2xl cursor-pointer border border-gray-200 bg-white"
              />

              <div>
                <p className="text-sm font-medium text-gray-900">
                  Primary Color
                </p>

                <p className="text-xs text-gray-500 font-mono mt-1">
                  {selectedColor.toUpperCase()}
                </p>
              </div>
            </div>

            {/* PRESET COLORS */}
            <div className="flex gap-2 flex-wrap mt-5">

              {[
                '#000000',
                '#2563EB',
                '#DC2626',
                '#16A34A',
                '#D97706',
                '#9333EA',
              ].map((c) => (

                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-9 h-9 rounded-full border-2 transition hover:scale-105 ${
                    selectedColor === c
                      ? 'border-gray-900 scale-105'
                      : 'border-gray-200'
                  }`}
                  style={{
                    backgroundColor: c,
                  }}
                />
              ))}
            </div>

            {/* INFO BOX */}
            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">

              <Eye className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />

              <p className="text-xs leading-5 text-gray-500">
                This style will automatically apply to future invoices.
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">

          {/* HEADER */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Live Preview
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Real-time invoice preview
              </p>
            </div>

            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
            </div>

          </div>

          {/* PREVIEW CONTAINER */}
          <div className="p-6 bg-[#f6f8fb] min-h-[850px] overflow-auto">

            <div className="w-full max-w-[210mm] mx-auto bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">

              {renderPreview()}

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
