import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-white border-b border-slate-100 px-4 pb-3"
    >
      <View className="flex-row items-center">
        <Pressable
          onPress={onBack || (() => router.back())}
          className="p-2 -ml-2 mr-2 rounded-full"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <ArrowLeft size={22} color="#1e293b" />
        </Pressable>
        <Text className="text-lg font-bold text-slate-800">{title}</Text>
      </View>
    </View>
  );
}
