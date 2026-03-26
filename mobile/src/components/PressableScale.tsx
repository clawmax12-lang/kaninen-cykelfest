import React from 'react';
import { Platform, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type HapticStyle = 'light' | 'medium' | 'heavy';

type PressableScaleProps = {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  haptic?: HapticStyle;
  testID?: string;
  disabled?: boolean;
};

const SPRING_CONFIG = { damping: 15, stiffness: 300 };

const PressableScale = React.forwardRef<React.ElementRef<typeof Pressable>, PressableScaleProps>(
  ({ children, onPress, onLongPress, style, haptic = 'light', testID, disabled }, ref) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    function getHapticStyle(): Haptics.ImpactFeedbackStyle {
      switch (haptic) {
        case 'medium':
          return Haptics.ImpactFeedbackStyle.Medium;
        case 'heavy':
          return Haptics.ImpactFeedbackStyle.Heavy;
        default:
          return Haptics.ImpactFeedbackStyle.Light;
      }
    }

    return (
      <Pressable
        ref={ref}
        testID={testID}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.96, SPRING_CONFIG);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, SPRING_CONFIG);
        }}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(getHapticStyle());
          onPress?.();
        }}
        onLongPress={onLongPress}
      >
        <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
      </Pressable>
    );
  }
);

PressableScale.displayName = 'PressableScale';

export default PressableScale;
