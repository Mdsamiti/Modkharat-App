import { Bell, Settings } from 'lucide-react';

interface TopBarProps {
  title: string;
  language: 'en' | 'ar';
  onToggleLanguage: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  notificationCount?: number;
}

export default function TopBar({
  title,
  language,
  onToggleLanguage,
  onOpenNotifications,
  onOpenSettings,
  notificationCount = 0
}: TopBarProps) {
  const isRTL = language === 'ar';

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
      <div className="flex items-center justify-between px-4 h-16">
        <h1 className="text-slate-900 flex-1">{title}</h1>
        
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            {language === 'en' ? 'عربي' : 'EN'}
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={language === 'en' ? 'Notifications' : 'الإشعارات'}
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={language === 'en' ? 'Settings' : 'الإعدادات'}
          >
            <Settings className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>
    </header>
  );
}
