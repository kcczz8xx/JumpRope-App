'use client';

import { Activity } from '@/lib/mock-data/school-service/client';
import { formatDistanceToNow, format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import ComponentCard from '@/components/tailadmin/common/ComponentCard';
import Timeline, { TimelineItem } from '@/components/tailadmin/common/Timeline';
import { CheckCircleIcon, PaperPlaneIcon, BoxCubeIcon, DollarLineIcon, UserIcon } from '@/icons';

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const iconConfig: Record<Activity['type'], React.ReactNode> = {
    QUOTATION_ACCEPTED: <CheckCircleIcon className="size-5" />,
    QUOTATION_SENT: <PaperPlaneIcon className="size-5" />,
    COURSE_CREATED: <BoxCubeIcon className="size-5" />,
    LESSON_COMPLETED: <CheckCircleIcon className="size-5" />,
    INVOICE_PAID: <DollarLineIcon className="size-5" />,
    TUTOR_ASSIGNED: <UserIcon className="size-5" />,
  };

  const timelineItems: TimelineItem[] = activities.map((activity) => ({
    icon: iconConfig[activity.type],
    title: activity.title,
    description: activity.description || '',
    time: formatDistanceToNow(new Date(activity.timestamp), {
      addSuffix: true,
      locale: zhTW,
    }),
    date: format(new Date(activity.timestamp), 'MM/dd/yyyy', { locale: zhTW }),
    iconRounded: true,
  }));

  return (
    <ComponentCard
      title="最近動態"
      actionLink={{ href: "/dashboard/school/activities", label: "查看全部" }}
    >
      {activities.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">暫無最近動態</p>
        </div>
      ) : (
        <Timeline items={timelineItems} />
      )}
    </ComponentCard>
  );
}
