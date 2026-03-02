import { ArrowLeft, AlertCircle, Target, TrendingUp, Info, ChevronRight } from 'lucide-react';

interface NotificationsProps {
  language: 'en' | 'ar';
  onClose: () => void;
}

export default function Notifications({ language, onClose }: NotificationsProps) {
  const notifications = [
    {
      id: '1',
      type: 'budget',
      title: language === 'en' ? 'Budget Alert: Shopping' : 'تنبيه الميزانية: تسوق',
      message: language === 'en'
        ? 'You\'ve used 82% of your Shopping budget (2,450 / 3,000 SAR)'
        : 'لقد استخدمت ٨٢٪ من ميزانية التسوق (٢٤٥٠ / ٣٠٠٠ ر.س)',
      time: '2 hours ago',
      read: false,
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      link: 'budget-1'
    },
    {
      id: '2',
      type: 'goal',
      title: language === 'en' ? 'Goal Milestone: Emergency Fund' : 'إنجاز الهدف: صندوق الطوارئ',
      message: language === 'en'
        ? 'Congratulations! You\'ve reached 50% of your Emergency Fund goal.'
        : 'مبروك! لقد وصلت إلى ٥٠٪ من هدف صندوق الطوارئ.',
      time: '1 day ago',
      read: false,
      icon: Target,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      link: 'goal-1'
    },
    {
      id: '3',
      type: 'unusual',
      title: language === 'en' ? 'Unusual Spending Detected' : 'تم اكتشاف إنفاق غير معتاد',
      message: language === 'en'
        ? 'Your spending on Entertainment is 45% higher than usual this month.'
        : 'إنفاقك على الترفيه أعلى بنسبة ٤٥٪ من المعتاد هذا الشهر.',
      time: '2 days ago',
      read: true,
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: 'analytics'
    },
    {
      id: '4',
      type: 'goal',
      title: language === 'en' ? 'Goal Reminder: Umrah Trip' : 'تذكير الهدف: رحلة عمرة',
      message: language === 'en'
        ? 'Add 1,200 SAR this month to stay on track for your Umrah Trip goal.'
        : 'أضف ١٢٠٠ ر.س هذا الشهر للبقاء على المسار لهدف رحلة العمرة.',
      time: '3 days ago',
      read: true,
      icon: Target,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: 'goal-2'
    },
    {
      id: '5',
      type: 'system',
      title: language === 'en' ? 'System Update Available' : 'تحديث النظام متاح',
      message: language === 'en'
        ? 'New features and improvements are available. Update now to enjoy the latest version.'
        : 'ميزات وتحسينات جديدة متاحة. حدّث الآن للاستمتاع بأحدث إصدار.',
      time: '5 days ago',
      read: true,
      icon: Info,
      iconColor: 'text-slate-600',
      bgColor: 'bg-slate-50',
      link: 'settings'
    },
    {
      id: '6',
      type: 'budget',
      title: language === 'en' ? 'Budget Alert: Food & Dining' : 'تنبيه الميزانية: طعام',
      message: language === 'en'
        ? 'You\'ve used 91% of your Food & Dining budget (1,820 / 2,000 SAR)'
        : 'لقد استخدمت ٩١٪ من ميزانية الطعام (١٨٢٠ / ٢٠٠٠ ر.س)',
      time: '1 week ago',
      read: true,
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      link: 'budget-2'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const groupedNotifications = {
    today: notifications.filter(n => n.time.includes('hour')),
    yesterday: notifications.filter(n => n.time.includes('1 day')),
    older: notifications.filter(n => !n.time.includes('hour') && !n.time.includes('1 day'))
  };

  const renderNotificationGroup = (title: string, items: typeof notifications) => {
    if (items.length === 0) return null;

    return (
      <div key={title}>
        <h3 className="text-xs text-slate-500 px-1 mb-2">
          {title}
        </h3>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          {items.map((notification, index) => {
            const Icon = notification.icon;
            return (
              <button
                key={notification.id}
                className={`w-full flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors ${
                  index < items.length - 1 ? 'border-b border-slate-100' : ''
                } ${!notification.read ? 'bg-blue-50/30' : ''}`}
              >
                <div className={`w-10 h-10 ${notification.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${notification.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm ${!notification.read ? 'text-slate-900' : 'text-slate-900'}`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-400">
                    {notification.time}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{language === 'en' ? 'Back' : 'رجوع'}</span>
          </button>

          {unreadCount > 0 && (
            <button className="text-sm text-emerald-600 hover:text-emerald-700">
              {language === 'en' ? 'Mark all as read' : 'تحديد الكل كمقروء'}
            </button>
          )}
        </div>

        {/* Notification Count */}
        {unreadCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900">
              {language === 'en'
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : `لديك ${unreadCount} إشعار${unreadCount > 1 ? 'ات' : ''} غير مقروء${unreadCount > 1 ? 'ة' : ''}`}
            </p>
          </div>
        )}

        {/* Grouped Notifications */}
        {renderNotificationGroup(
          language === 'en' ? 'Today' : 'اليوم',
          groupedNotifications.today
        )}
        {renderNotificationGroup(
          language === 'en' ? 'Yesterday' : 'أمس',
          groupedNotifications.yesterday
        )}
        {renderNotificationGroup(
          language === 'en' ? 'Older' : 'أقدم',
          groupedNotifications.older
        )}

        {/* Empty State (if no notifications) */}
        {notifications.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 mb-2">
              {language === 'en' ? 'No notifications' : 'لا توجد إشعارات'}
            </h3>
            <p className="text-sm text-slate-500">
              {language === 'en' ? 'You\'re all caught up!' : 'أنت على اطلاع بكل شيء!'}
            </p>
          </div>
        )}

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <button className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-900">
                  {language === 'en' ? 'Notification Settings' : 'إعدادات الإشعارات'}
                </p>
                <p className="text-xs text-slate-500">
                  {language === 'en' ? 'Manage what you receive' : 'إدارة ما تستلمه'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
