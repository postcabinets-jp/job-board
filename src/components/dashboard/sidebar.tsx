'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarDays,
  BarChart3,
  Mail,
  Settings,
  Building2,
  UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: '概要',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: '求人管理',
    href: '/dashboard/jobs',
    icon: Briefcase,
  },
  {
    label: '候補者',
    href: '/dashboard/candidates',
    icon: Users,
  },
  {
    label: '面接',
    href: '/dashboard/interviews',
    icon: CalendarDays,
  },
  {
    label: '分析',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    label: 'メールテンプレート',
    href: '/dashboard/templates',
    icon: Mail,
  },
]

const settingsItems = [
  { label: '会社設定', href: '/dashboard/settings/company', icon: Building2 },
  { label: 'チーム管理', href: '/dashboard/settings/team', icon: UserCog },
]

interface DashboardSidebarProps {
  companyId?: string
}

export function DashboardSidebar({ companyId }: DashboardSidebarProps) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  if (!companyId) return null

  return (
    <aside className="hidden lg:flex flex-col w-56 border-r border-neutral-200 bg-white shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <nav className="p-3 flex-1">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive(item.href, item.exact)
                  ? 'bg-neutral-900 text-white font-medium'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-100">
          <p className="text-xs font-medium text-neutral-400 px-3 mb-1.5">設定</p>
          <div className="space-y-0.5">
            {settingsItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive(item.href)
                    ? 'bg-neutral-900 text-white font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  )
}
