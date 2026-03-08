import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

// Register third-party components with NativeWind so className maps to style
cssInterop(LinearGradient, {
  className: 'style',
});
