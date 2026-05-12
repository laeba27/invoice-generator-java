'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Map paths to labels
  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    ...pathSegments.map((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = segment
        .replace(/\[.*?\]/g, (match) => {
          // For dynamic routes like [id], show 'Details' instead
          return 'Details';
        })
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return { label, href };
    }),
  ];

  return (
    <div className="flex items-center space-x-2 text-sm mb-6">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center space-x-2">
          {index > 0 && (
            <span className="text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
          {index === breadcrumbItems.length - 1 ? (
            <span className="text-gray-600 font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="text-amber-600 hover:text-amber-700 transition-colors">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
