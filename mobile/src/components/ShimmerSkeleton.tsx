import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type ShimmerSkeletonProps = {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
};

export default function ShimmerSkeleton({
  width,
  height,
  borderRadius = 8,
  style,
}: ShimmerSkeletonProps) {
  const translateX = useSharedValue(-300);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(300, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: '#E8E0CC',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.6)',
            width: 80,
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <ShimmerSkeleton
      width="100%"
      height={80}
      borderRadius={8}
      style={style}
    />
  );
}
