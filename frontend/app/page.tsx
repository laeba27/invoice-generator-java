'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth';
import { Zap, Lock, BarChart3, Palette, Smartphone, Settings, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/3 -right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl opacity-10"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200 sticky top-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/30 text-white">
              <Zap size={24} />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              InvoiceFlow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-6 py-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-block">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-sm text-blue-600 font-semibold">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                New: AI-Powered Invoice Templates
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-black leading-tight text-gray-900">
                Invoices
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
                Create stunning, GST-compliant invoices in seconds. Designed for modern Indian businesses that refuse to settle for ordinary.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Link
                href="/register"
                className="group px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-200"
              >
                Start Building →
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-black text-blue-600">10K+</div>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
              <div>
                <div className="text-3xl font-black text-blue-600">500K+</div>
                <p className="text-sm text-gray-600">Invoices Generated</p>
              </div>
              <div>
                <div className="text-3xl font-black text-blue-600">99.9%</div>
                <p className="text-sm text-gray-600">Uptime</p>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative h-96 md:h-full">
            <div className="absolute inset-0">
              {/* Card preview effect */}
              <div className="absolute top-0 left-0 w-80 h-96 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-blue-200 rounded-full w-3/4"></div>
                  <div className="h-3 bg-blue-200 rounded-full w-1/2"></div>
                  <div className="h-3 bg-blue-200 rounded-full w-2/3"></div>
                </div>
              </div>
              
              <div className="absolute top-20 right-0 w-80 h-96 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-indigo-200 rounded-full w-2/3"></div>
                  <div className="h-3 bg-indigo-200 rounded-full w-3/4"></div>
                  <div className="h-3 bg-indigo-200 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">
            Built for Modern Businesses
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage invoices professionally, with style.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Zap,
              title: 'Lightning Fast',
              description: 'Generate invoices in seconds with our AI-powered system',
              gradient: 'from-blue-50 to-blue-100',
              borderColor: 'border-blue-200',
              iconColor: 'text-blue-600'
            },
            {
              icon: Lock,
              title: 'Bank-Level Security',
              description: 'Military-grade encryption keeps your data safe always',
              gradient: 'from-indigo-50 to-indigo-100',
              borderColor: 'border-indigo-200',
              iconColor: 'text-indigo-600'
            },
            {
              icon: BarChart3,
              title: 'GST Compliant',
              description: 'Automatically calculate CGST, SGST, and IGST correctly',
              gradient: 'from-purple-50 to-purple-100',
              borderColor: 'border-purple-200',
              iconColor: 'text-purple-600'
            },
            {
              icon: Palette,
              title: 'Beautiful Templates',
              description: 'Professional designs that make your invoices stand out',
              gradient: 'from-green-50 to-green-100',
              borderColor: 'border-green-200',
              iconColor: 'text-green-600'
            },
            {
              icon: Smartphone,
              title: 'Mobile Ready',
              description: 'Create invoices anytime, anywhere on any device',
              gradient: 'from-pink-50 to-pink-100',
              borderColor: 'border-pink-200',
              iconColor: 'text-pink-600'
            },
            {
              icon: Settings,
              title: 'Zero Setup',
              description: 'Start creating invoices in under 2 minutes flat',
              gradient: 'from-orange-50 to-orange-100',
              borderColor: 'border-orange-200',
              iconColor: 'text-orange-600'
            },
          ].map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={idx}
                className={`group relative p-6 rounded-xl border bg-gradient-to-br ${feature.gradient} ${feature.borderColor} backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer`}
              >
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="relative z-10 space-y-4">
                  <div className={`${feature.iconColor} w-10 h-10`}>
                    <IconComponent size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-12 text-center space-y-8">
          <h2 className="text-4xl font-black text-gray-900">
            Ready to Transform Your Invoicing?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of businesses creating invoices faster and smarter. No credit card required.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-2xl hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-200"
            >
              Create Your Account
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 px-6 py-8 text-center text-gray-600">
        <p>© 2026 InvoiceFlow. Built with precision for modern businesses.</p>
      </footer>
    </div>
  );
}
