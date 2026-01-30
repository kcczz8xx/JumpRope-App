'use client';

import Link from 'next/link';
import ComponentCard from '@/components/tailadmin/common/ComponentCard';
import Button from '@/components/tailadmin/ui/button/Button';
import { PlusIcon, BoxCubeIcon, DocsIcon, CalenderIcon, ListIcon } from '@/icons';

interface QuickActionsProps {
  role: string;
}

export function QuickActions({ role }: QuickActionsProps) {
  const isAdmin = role === 'ADMIN';

  const adminActions = [
    { label: '新增報價', href: '/dashboard/school/quotations/new', icon: <PlusIcon className="size-5" /> },
    { label: '新增課程', href: '/dashboard/school/courses/new', icon: <BoxCubeIcon className="size-5" /> },
    { label: '生成發票', href: '/dashboard/school/invoices/generate', icon: <DocsIcon className="size-5" /> },
    { label: '導師排班', href: '/dashboard/school/schedule', icon: <CalenderIcon className="size-5" /> },
  ];

  const schoolAdminActions = [
    { label: '查看報價', href: '/dashboard/school/quotations', icon: <DocsIcon className="size-5" /> },
    { label: '查看課程', href: '/dashboard/school/courses', icon: <BoxCubeIcon className="size-5" /> },
    { label: '查看發票', href: '/dashboard/school/invoices', icon: <ListIcon className="size-5" /> },
    { label: '查看課堂', href: '/dashboard/school/my-lessons', icon: <CalenderIcon className="size-5" /> },
  ];

  const actions = isAdmin ? adminActions : schoolAdminActions;

  return (
    <ComponentCard title="快速操作">
      <div className="space-y-3">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="block">
            <Button
              variant="outline"
              size="md"
              startIcon={action.icon}
              className="w-full justify-start"
            >
              {action.label}
            </Button>
          </Link>
        ))}
      </div>
    </ComponentCard>
  );
}
