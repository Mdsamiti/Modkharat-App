import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Switch } from 'react-native';
import { Plus, Mail, Phone, Crown, Trash2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { mockFamilyMembers } from '@/services/mock/data';

export default function FamilyMembersScreen() {
  const { t } = useTranslation();
  const { language } = useApp();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'phone'>('email');
  const [inviteValue, setInviteValue] = useState('');

  const permissions = [
    { key: 'viewOnly', label: t('familyMembers.viewOnly') },
    { key: 'canAddTransactions', label: t('familyMembers.addTransactions') },
    { key: 'canEditBudgets', label: t('familyMembers.editBudgets') },
    { key: 'canManageMembers', label: t('familyMembers.manageMembers') },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title={t('familyMembers.title')} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Members */}
        {mockFamilyMembers.map((member) => (
          <View key={member.id} className="mx-4 mt-4 bg-white rounded-2xl p-4">
            {/* Member Header */}
            <View className="flex-row items-center mb-4">
              <View
                className="w-14 h-14 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: member.color + '20' }}
              >
                <Text className="text-2xl">{member.avatar}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-slate-800 font-bold text-base" numberOfLines={1}>{member.name}</Text>
                  {member.role === 'organizer' && (
                    <Crown size={14} color="#f59e0b" className="ml-1.5" />
                  )}
                </View>
                <Text className="text-slate-400 text-xs">{member.email}</Text>
                <Text className="text-emerald-600 text-xs font-medium capitalize">
                  {language === 'en' ? member.role : (member.role === 'organizer' ? t('familyMembers.organizer') : t('familyMembers.member'))}
                </Text>
              </View>
            </View>

            {/* Permissions */}
            <Text className="text-slate-500 text-xs font-semibold uppercase mb-2">
              {t('familyMembers.permissions')}
            </Text>
            {permissions.map((perm) => (
              <View
                key={perm.key}
                className="flex-row items-center justify-between py-2.5"
                style={{ borderBottomWidth: 1, borderBottomColor: '#f8fafc' }}
              >
                <Text className="text-slate-600 text-sm">{perm.label}</Text>
                <Switch
                  value={member.permissions?.[perm.key as keyof typeof member.permissions] ?? false}
                  trackColor={{ false: '#e2e8f0', true: '#6ee7b7' }}
                  thumbColor={member.permissions?.[perm.key as keyof typeof member.permissions] ? '#059669' : '#f4f4f5'}
                  disabled={member.role === 'organizer'}
                  accessibilityLabel={`${perm.label} for ${member.name}`}
                />
              </View>
            ))}

            {/* Remove Button (not for organizer) */}
            {member.role !== 'organizer' && (
              <Pressable className="flex-row items-center justify-center mt-4 py-2.5 rounded-xl active:bg-red-50" accessibilityRole="button" accessibilityLabel={`${t('familyMembers.removeMember')} ${member.name}`}>
                <Trash2 size={16} color="#ef4444" />
                <Text className="text-red-500 font-medium text-sm ml-2">{t('familyMembers.removeMember')}</Text>
              </Pressable>
            )}
          </View>
        ))}

        {/* Invite Button / Form */}
        <View className="mx-4 mt-4 mb-6">
          {!showInvite ? (
            <Pressable
              onPress={() => setShowInvite(true)}
              className="bg-blue-600 rounded-2xl py-4 flex-row items-center justify-center active:bg-blue-700"
              accessibilityRole="button"
              accessibilityLabel={t('familyMembers.inviteMember')}
            >
              <Plus size={20} color="#ffffff" />
              <Text className="text-white font-semibold ml-2">{t('familyMembers.inviteMember')}</Text>
            </Pressable>
          ) : (
            <View className="bg-white rounded-2xl p-4">
              <Text className="text-slate-800 font-semibold text-base mb-3">{t('familyMembers.inviteMember')}</Text>

              {/* Method Toggle */}
              <View className="flex-row gap-2 mb-4">
                <Pressable
                  onPress={() => setInviteMethod('email')}
                  className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
                    inviteMethod === 'email' ? 'bg-blue-600' : 'bg-slate-100'
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={t('familyMembers.email')}
                >
                  <Mail size={16} color={inviteMethod === 'email' ? '#ffffff' : '#64748b'} />
                  <Text className={`ml-2 font-medium text-sm ${inviteMethod === 'email' ? 'text-white' : 'text-slate-600'}`}>
                    {t('familyMembers.email')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setInviteMethod('phone')}
                  className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${
                    inviteMethod === 'phone' ? 'bg-blue-600' : 'bg-slate-100'
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={t('familyMembers.phone')}
                >
                  <Phone size={16} color={inviteMethod === 'phone' ? '#ffffff' : '#64748b'} />
                  <Text className={`ml-2 font-medium text-sm ${inviteMethod === 'phone' ? 'text-white' : 'text-slate-600'}`}>
                    {t('familyMembers.phone')}
                  </Text>
                </Pressable>
              </View>

              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 mb-4"
                value={inviteValue}
                onChangeText={setInviteValue}
                placeholder={inviteMethod === 'email' ? t('familyMembers.email') : t('familyMembers.phone')}
                placeholderTextColor="#94a3b8"
                keyboardType={inviteMethod === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                accessibilityLabel={inviteMethod === 'email' ? t('familyMembers.email') : t('familyMembers.phone')}
              />

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowInvite(false)}
                  className="flex-1 bg-slate-100 rounded-xl py-3.5 items-center active:bg-slate-200"
                  accessibilityRole="button"
                  accessibilityLabel={t('common.cancel')}
                >
                  <Text className="text-slate-600 font-medium">{t('common.cancel')}</Text>
                </Pressable>
                <Pressable className="flex-1 bg-blue-600 rounded-xl py-3.5 items-center active:bg-blue-700" accessibilityRole="button" accessibilityLabel={t('familyMembers.sendInvite')}>
                  <Text className="text-white font-semibold">{t('familyMembers.sendInvite')}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
