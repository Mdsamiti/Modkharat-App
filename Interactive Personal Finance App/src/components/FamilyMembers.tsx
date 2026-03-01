import { ArrowLeft, Plus, Mail, Phone, Crown, Eye, Edit, Trash2, Check } from 'lucide-react';
import { useState } from 'react';

interface FamilyMembersProps {
  language: 'en' | 'ar';
  onClose: () => void;
}

export default function FamilyMembers({ language, onClose }: FamilyMembersProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'phone'>('email');
  const [inviteValue, setInviteValue] = useState('');

  const members = [
    {
      id: '1',
      name: language === 'en' ? 'Ahmed (You)' : 'أحمد (أنت)',
      email: 'ahmed@example.com',
      role: 'organizer',
      avatar: '👨',
      color: 'bg-blue-100',
      permissions: {
        viewOnly: false,
        canAddTransactions: true,
        canEditBudgets: true,
        canManageMembers: true
      }
    },
    {
      id: '2',
      name: language === 'en' ? 'Fatima' : 'فاطمة',
      email: 'fatima@example.com',
      role: 'member',
      avatar: '👩',
      color: 'bg-pink-100',
      permissions: {
        viewOnly: false,
        canAddTransactions: true,
        canEditBudgets: false,
        canManageMembers: false
      }
    },
    {
      id: '3',
      name: language === 'en' ? 'Sarah' : 'سارة',
      email: 'sarah@example.com',
      role: 'member',
      avatar: '👧',
      color: 'bg-purple-100',
      permissions: {
        viewOnly: true,
        canAddTransactions: false,
        canEditBudgets: false,
        canManageMembers: false
      }
    }
  ];

  const handleSendInvite = () => {
    // Handle invite logic
    setShowInvite(false);
    setInviteValue('');
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
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-slate-900 mb-2">
            {language === 'en' ? 'Family Members' : 'أفراد العائلة'}
          </h2>
          <p className="text-sm text-slate-600">
            {language === 'en'
              ? 'Manage who has access to your family finances'
              : 'إدارة من لديه الوصول إلى مالية عائلتك'}
          </p>
        </div>

        {/* Invite Button */}
        {!showInvite ? (
          <button
            onClick={() => setShowInvite(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{language === 'en' ? 'Invite New Member' : 'دعوة عضو جديد'}</span>
          </button>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-slate-900">
              {language === 'en' ? 'Invite Member' : 'دعوة عضو'}
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => setInviteMethod('email')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  inviteMethod === 'email'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">{language === 'en' ? 'Email' : 'بريد'}</span>
              </button>
              <button
                onClick={() => setInviteMethod('phone')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  inviteMethod === 'phone'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">{language === 'en' ? 'Phone' : 'هاتف'}</span>
              </button>
            </div>

            <input
              type={inviteMethod === 'email' ? 'email' : 'tel'}
              value={inviteValue}
              onChange={(e) => setInviteValue(e.target.value)}
              placeholder={
                inviteMethod === 'email'
                  ? (language === 'en' ? 'Enter email address' : 'أدخل البريد الإلكتروني')
                  : (language === 'en' ? 'Enter phone number' : 'أدخل رقم الهاتف')
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowInvite(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl transition-colors"
              >
                {language === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                onClick={handleSendInvite}
                disabled={!inviteValue}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === 'en' ? 'Send Invite' : 'إرسال دعوة'}
              </button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="bg-white rounded-2xl p-5 shadow-sm">
              {/* Member Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 ${member.color} rounded-full flex items-center justify-center text-2xl flex-shrink-0`}>
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-slate-900">{member.name}</h4>
                    {member.role === 'organizer' && (
                      <div className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        <span>{language === 'en' ? 'Organizer' : 'منظم'}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
                {member.role !== 'organizer' && (
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-slate-600" />
                  </button>
                )}
              </div>

              {/* Permissions */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-3">
                  {language === 'en' ? 'Permissions' : 'الصلاحيات'}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">
                      {language === 'en' ? 'View Only' : 'عرض فقط'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={member.permissions.viewOnly}
                      disabled={member.role === 'organizer'}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                </div>

                {!member.permissions.viewOnly && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {language === 'en' ? 'Can Add Transactions' : 'يمكنه إضافة معاملات'}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={member.permissions.canAddTransactions}
                          disabled={member.role === 'organizer'}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Edit className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700">
                          {language === 'en' ? 'Can Edit Budgets' : 'يمكنه تعديل الميزانيات'}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={member.permissions.canEditBudgets}
                          disabled={member.role === 'organizer'}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Remove Member */}
              {member.role !== 'organizer' && (
                <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">
                    {language === 'en' ? 'Remove Member' : 'إزالة العضو'}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900">
            {language === 'en'
              ? 'As the organizer, you have full control over all family finances and member permissions.'
              : 'كمنظم، لديك السيطرة الكاملة على جميع الشؤون المالية للعائلة وصلاحيات الأعضاء.'}
          </p>
        </div>
      </div>
    </div>
  );
}
