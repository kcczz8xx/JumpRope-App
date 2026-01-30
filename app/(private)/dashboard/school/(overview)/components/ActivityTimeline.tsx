'use client';

import Link from 'next/link';
import { Activity } from '../lib/data';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import ComponentCard from '@/components/common/ComponentCard';
import { CheckCircleIcon, PaperPlaneIcon, BoxCubeIcon, DollarLineIcon, UserIcon } from '@/icons';

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <ComponentCard
      title="最近動態"
      actionLink={{ href: "/dashboard/school/activities", label: "查看全部" }}
      noPadding
    >
      {activities.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">暫無最近動態</p>
        </div>
      ) : (
        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </ComponentCard>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const iconConfig: Record<Activity['type'], { icon: React.ReactNode; bgColor: string }> = {
    QUOTATION_ACCEPTED: {
      icon: <CheckCircleIcon className="size-5 text-success-500" />,
      bgColor: 'bg-success-50 dark:bg-success-500/10',
    },
    QUOTATION_SENT: {
      icon: <PaperPlaneIcon className="size-5 text-brand-500" />,
      bgColor: 'bg-brand-50 dark:bg-brand-500/10',
    },
    COURSE_CREATED: {
      icon: <BoxCubeIcon className="size-5 text-brand-500" />,
      bgColor: 'bg-brand-50 dark:bg-brand-500/10',
    },
    LESSON_COMPLETED: {
      icon: <CheckCircleIcon className="size-5 text-success-500" />,
      bgColor: 'bg-success-50 dark:bg-success-500/10',
    },
    INVOICE_PAID: {
      icon: <DollarLineIcon className="size-5 text-warning-500" />,
      bgColor: 'bg-warning-50 dark:bg-warning-500/10',
    },
    TUTOR_ASSIGNED: {
      icon: <UserIcon className="size-5 text-gray-500" />,
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
  };

  const linkMap = {
    quotation: `/dashboard/school/quotations/${activity.relatedId}`,
    course: `/dashboard/school/courses/${activity.relatedId}`,
    invoice: `/dashboard/school/invoices/${activity.relatedId}`,
  };

  const href = activity.relatedType && activity.relatedId
    ? linkMap[activity.relatedType]
    : '#';

  const timeAgo = formatDistanceToNow(new Date(activity.timestamp), {
    addSuffix: true,
    locale: zhTW,
  });

  const { icon, bgColor } = iconConfig[activity.type];

  return (
    <Link href={href}>
      <div className="group flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className={`flex-shrink-0 rounded-full p-2 ${bgColor}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-800 group-hover:text-brand-500 dark:text-white/90 dark:group-hover:text-brand-400">
            {activity.title}
          </p>
          {activity.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {activity.description}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {timeAgo}
          </p>
        </div>
      </div>
    </Link>
  );
}
