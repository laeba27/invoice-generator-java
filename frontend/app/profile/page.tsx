'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { authService } from '@/lib/auth';
import Breadcrumbs from '@/components/Breadcrumbs';
import Navbar from '@/components/Navbar';

import {
  Building2,
  Save,
  Info,
} from 'lucide-react';
export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    stateCode: '',
    phone: '',
    gstNumber: '',
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadBusiness();
  }, [router]);

  const loadBusiness = async () => {
    try {
      const business = await apiClient.getBusiness();
      if (business) {
        setFormData({
          businessName: business.businessName || '',
          address: business.address || '',
          stateCode: business.stateCode || '',
          phone: business.phone || '',
          gstNumber: business.gstNumber || '',
        });
        setIsEdit(true);
      }
    } catch (err) {
      console.error('Error loading business:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (isEdit) {
        await apiClient.updateBusiness(formData);
        setSuccess('Business profile updated successfully!');
      } else {
        await apiClient.createBusiness(formData);
        setSuccess('Business profile created successfully!');
        setTimeout(() => router.push('/dashboard'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save business profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-amber-50">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-[#f6f8fb]">

    <Navbar />

    <div className="max-w-7xl mx-auto px-4 py-5">

      <Breadcrumbs />

      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div>

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-600" />
            </div>

            <div>

              <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Business Profile
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Manage your registered business information
              </p>

            </div>
          </div>
        </div>

        <div className="flex gap-3">

          <button
            type="submit"
            form="businessForm"
            disabled={submitting}
            className="h-11 px-5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition shadow-sm inline-flex items-center gap-2 disabled:opacity-70"
          >

            {submitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />

                {isEdit
                  ? 'Update Profile'
                  : 'Create Profile'}
              </>
            )}

          </button>

        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-2xl text-sm">
          {success}
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* LEFT FORM */}
        <form
          id="businessForm"
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BUSINESS DETAILS */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">

              <div className="w-11 h-11 rounded-2xl bg-primary-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-600" />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Business Information
                </h2>

                <p className="text-sm text-gray-500">
                  Registered company details
                </p>

              </div>
            </div>

            <div className="p-6 space-y-5">

              {/* BUSINESS NAME */}
              <div>

                <label className="text-xs font-medium text-gray-500 block mb-2">
                  Business Name
                </label>

                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessName:
                        e.target.value,
                    })
                  }
                  required
                  className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              {/* ADDRESS */}
              <div>

                <label className="text-xs font-medium text-gray-500 block mb-2">
                  Business Address
                </label>

                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address:
                        e.target.value,
                    })
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900 resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              {/* GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* STATE CODE */}
                <div>

                  <label className="text-xs font-medium text-gray-500 block mb-2">
                    State Code
                  </label>

                  <input
                    type="text"
                    value={formData.stateCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stateCode:
                          e.target.value,
                      })
                    }
                    required
                    maxLength={2}
                    placeholder="23"
                    className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>

                {/* PHONE */}
                <div>

                  <label className="text-xs font-medium text-gray-500 block mb-2">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone:
                          e.target.value,
                      })
                    }
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>

              </div>

              {/* GST */}
              <div>

                <label className="text-xs font-medium text-gray-500 block mb-2">
                  GST Number
                </label>

                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gstNumber:
                        e.target.value,
                    })
                  }
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

            </div>
          </div>
        </form>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">

          {/* PROFILE SUMMARY */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

            <div className="p-6 border-b border-gray-100">

              <div className="w-16 h-16 rounded-3xl bg-primary-50 flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                {formData.businessName || 'Business Name'}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Registered Business
              </p>

            </div>

            <div className="p-6 space-y-5">

              <div>

                <p className="text-xs text-gray-500 mb-1">
                  Phone
                </p>

                <p className="text-sm font-medium text-gray-900">
                  {formData.phone || 'Not Added'}
                </p>
              </div>

              <div>

                <p className="text-xs text-gray-500 mb-1">
                  State Code
                </p>

                <p className="text-sm font-medium text-gray-900">
                  {formData.stateCode || 'Not Added'}
                </p>
              </div>

              <div>

                <p className="text-xs text-gray-500 mb-1">
                  GST Number
                </p>

                <p className="text-sm font-medium text-gray-900 break-all">
                  {formData.gstNumber || 'Not Added'}
                </p>
              </div>

              <div>

                <p className="text-xs text-gray-500 mb-1">
                  Address
                </p>

                <p className="text-sm font-medium text-gray-900 leading-6">
                  {formData.address || 'Not Added'}
                </p>
              </div>

            </div>
          </div>

          {/* INFO CARD */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-5">

            <div className="flex items-start gap-3">

              <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-blue-600" />
              </div>

              <div>

                <h3 className="font-semibold text-gray-900">
                  Business Information
                </h3>

                <p className="text-sm text-gray-500 leading-6 mt-2">
                  These details automatically appear on your invoices and GST documents.
                </p>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
);
}
