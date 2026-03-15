import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, ActivityIndicator, Alert, Linking } from 'react-native';
import { Plus, Crown, Trash2, MessageCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { useApi } from '@/hooks/useApi';
import { householdsApi } from '@/services/api';

export default function FamilyMembersScreen() {
  const { t } = useTranslation();
  const { language } = useApp();

  const { data: householdsData } = useApi(() => householdsApi.listHouseholds(), []);
  const householdId = householdsData?.data?.[0]?.id;
  const householdName = householdsData?.data?.[0]?.name ?? 'Modkharat';

  const { data: membersData, isLoading, refetch } = useApi(
    () => householdId ? householdsApi.getMembers(householdId) : Promise.resolve({ data: [] }),
    [householdId],
  );
  const members = membersData?.data ?? [];


  const permissions = [
    { key: 'viewOnly', label: t('familyMembers.viewOnly') },
    { key: 'canAddTransactions', label: t('familyMembers.addTransactions') },
    { key: 'canEditBudgets', label: t('familyMembers.editBudgets') },
    { key: 'canManageMembers', label: t('familyMembers.manageMembers') },
  ];

  const handleWhatsAppInvite = () => {
    const message = language === 'ar'
      ? `🏠 تمت دعوتك للانضمام إلى "${householdName}" على تطبيق مدخرات!\n\nحمّل التطبيق وسجّل بنفس البريد الإلكتروني للانضمام إلى العائلة.`
      : `🏠 You've been invited to join "${householdName}" on Modkharat!\n\nDownload the app and sign up with the same email to join the family.`;

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(whatsappUrl).then((supported) => {
      if (supported) {
        Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          language === 'en' ? 'WhatsApp not installed' : 'واتساب غير مثبت',
          language === 'en' ? 'Please install WhatsApp to send invites.' : 'يرجى تثبيت واتساب لإرسال الدعوات.',
        );
      }
    });
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!householdId) return;
    Alert.alert(
      t('familyMembers.removeMember'),
      `${language === 'en' ? 'Remove' : 'إزالة'} ${memberName}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('familyMembers.removeMember'),
          style: 'destructive',
          onPress: async () => {
            try {
              await householdsApi.removeMember(householdId, memberId);
              refetch();
            } catch (err: any) {
              Alert.alert(language === 'en' ? 'Error' : 'خطأ', err?.message || 'Failed');
            }
          },
        },
      ],
    );
  };

  const handlePermissionChange = async (memberId: string, permKey: string, value: boolean) => {
    if (!householdId) return;
    try {
      await householdsApi.updateMemberPermissions(householdId, memberId, { [permKey]: value });
      refetch();
    } catch (err: any) {
      Alert.alert(language === 'en' ? 'Error' : 'خطأ', err?.message || 'Failed');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <ScreenHeader title={t('familyMembers.title')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScreenHeader title={t('familyMembers.title')} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Members */}
        {members.map((member) => (
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
                  onValueChange={(val) => handlePermissionChange(member.id, perm.key, val)}
                  trackColor={{ false: '#e2e8f0', true: '#6ee7b7' }}
                  thumbColor={member.permissions?.[perm.key as keyof typeof member.permissions] ? '#059669' : '#f4f4f5'}
                  disabled={member.role === 'organizer'}
                  accessibilityLabel={`${perm.label} for ${member.name}`}
                />
              </View>
            ))}

            {/* Remove Button (not for organizer) */}
            {member.role !== 'organizer' && (
              <Pressable
                onPress={() => handleRemove(member.id, member.name)}
                className="flex-row items-center justify-center mt-4 py-2.5 rounded-xl active:bg-red-50"
                accessibilityRole="button"
                accessibilityLabel={`${t('familyMembers.removeMember')} ${member.name}`}
              >
                <Trash2 size={16} color="#ef4444" />
                <Text className="text-red-500 font-medium text-sm ml-2">{t('familyMembers.removeMember')}</Text>
              </Pressable>
            )}
          </View>
        ))}

        {/* WhatsApp Invite Button */}
        <View className="mx-4 mt-4 mb-6">
          <Pressable
            onPress={handleWhatsAppInvite}
            className="bg-green-600 rounded-2xl py-4 flex-row items-center justify-center active:bg-green-700"
            accessibilityRole="button"
            accessibilityLabel={t('familyMembers.inviteByWhatsApp')}
          >
            <MessageCircle size={20} color="#ffffff" />
            <Text className="text-white font-semibold ml-2">{t('familyMembers.inviteByWhatsApp')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
