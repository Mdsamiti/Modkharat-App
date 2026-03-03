import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Home, Receipt, BarChart3, PiggyBank, Users, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: t('tabs.transactions'),
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-placeholder"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarItemStyle: { width: 0, minWidth: 0, maxWidth: 0, padding: 0 },
          tabBarButton: () => (
            <TouchableOpacity
              accessibilityLabel="Add transaction"
              activeOpacity={0.8}
              onPress={() => router.push('/add-transaction')}
              style={{
                position: 'absolute',
                top: -65,
                left: '0.0%',
                marginLeft: 13,
                width: 60,
                height: 60,
                backgroundColor: '#059669',
                borderRadius: 30,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 8,
              }}
            >
              <Plus size={28} color="#ffffff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t('tabs.analytics'),
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: t('tabs.planner'),
          tabBarIcon: ({ color, size }) => <PiggyBank size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: t('tabs.family'),
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
