import { ArrowLeft, Globe, DollarSign, Tag, Bell, Lock, Download, Trash2, ChevronRight } from 'lucide-react';

interface SettingsProps {
  language: 'en' | 'ar';
  onClose: () => void;
}

export default function Settings({ language, onClose }: SettingsProps) {
  const settingsGroups = [
    {
      title: language === 'en' ? 'Preferences' : 'التفضيلات',
      items: [
        {
          icon: Globe,
          label: language === 'en' ? 'Language and Layout' : 'اللغة والتخطيط',
          value: language === 'en' ? 'English (LTR)' : 'العربية (RTL)',
          action: 'language'
        },
        {
          icon: DollarSign,
          label: language === 'en' ? 'Currency and Region' : 'العملة والمنطقة',
          value: language === 'en' ? 'SAR - Saudi Arabia' : 'ر.س - السعودية',
          action: 'currency'
        }
      ]
    },
    {
      title: language === 'en' ? 'Financial Data' : 'البيانات المالية',
      items: [
        {
          icon: Tag,
          label: language === 'en' ? 'Accounts and Categories' : 'الحسابات والفئات',
          value: language === 'en' ? '3 accounts, 12 categories' : '٣ حسابات، ١٢ فئة',
          action: 'accounts'
        }
      ]
    },
    {
      title: language === 'en' ? 'Notifications' : 'الإشعارات',
      items: [
        {
          icon: Bell,
          label: language === 'en' ? 'Notification Preferences' : 'تفضيلات الإشعارات',
          value: language === 'en' ? 'Budget alerts, Goals' : 'تنبيهات الميزانية، الأهداف',
          action: 'notifications'
        }
      ]
    },
    {
      title: language === 'en' ? 'Privacy and Security' : 'الخصوصية والأمان',
      items: [
        {
          icon: Lock,
          label: language === 'en' ? 'Privacy and Consent' : 'الخصوصية والموافقة',
          value: language === 'en' ? 'Manage your data' : 'إدارة بياناتك',
          action: 'privacy'
        }
      ]
    },
    {
      title: language === 'en' ? 'Data Management' : 'إدارة البيانات',
      items: [
        {
          icon: Download,
          label: language === 'en' ? 'Export Data' : 'تصدير البيانات',
          value: language === 'en' ? 'Download your data' : 'تحميل بياناتك',
          action: 'export'
        },
        {
          icon: Trash2,
          label: language === 'en' ? 'Delete Account' : 'حذف الحساب',
          value: language === 'en' ? 'Permanently delete' : 'حذف نهائي',
          action: 'delete',
          danger: true
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 space-y-4">
        {/* Header */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'en' ? 'Back' : 'رجوع'}</span>
        </button>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3 className="text-xs text-slate-500 px-1 mb-2">
              {group.title}
            </h3>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIndex}
                    className={`w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${
                      itemIndex < group.items.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.danger ? 'bg-red-100' : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${item.danger ? 'text-red-600' : 'text-slate-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-sm ${item.danger ? 'text-red-600' : 'text-slate-900'} mb-0.5`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {item.value}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">💰</span>
          </div>
          <h3 className="text-slate-900 mb-1">Modkharat</h3>
          <p className="text-sm text-slate-500 mb-3">
            {language === 'en' ? 'Version 1.0.0' : 'الإصدار ١.٠.٠'}
          </p>
          <p className="text-xs text-slate-400">
            {language === 'en'
              ? 'Your personal finance companion'
              : 'رفيقك في الشؤون المالية الشخصية'}
          </p>
        </div>

        {/* Legal Links */}
        <div className="space-y-2 px-1">
          <button className="text-sm text-slate-600 hover:text-slate-900">
            {language === 'en' ? 'Terms of Service' : 'شروط الخدمة'}
          </button>
          <span className="text-slate-300 mx-2">•</span>
          <button className="text-sm text-slate-600 hover:text-slate-900">
            {language === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
          </button>
          <span className="text-slate-300 mx-2">•</span>
          <button className="text-sm text-slate-600 hover:text-slate-900">
            {language === 'en' ? 'Help Center' : 'مركز المساعدة'}
          </button>
        </div>
      </div>
    </div>
  );
}
