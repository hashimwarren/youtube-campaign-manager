'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, BarChart3, Home, Settings } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Creator CRM', href: '/creators', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-8">
      <Link href="/" className="text-xl font-bold text-gray-900">
        YouTube Campaign Manager
      </Link>
      
      <nav className="flex space-x-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                pathname === item.href
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
