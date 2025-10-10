import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,

} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './IconSymbol';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const springConfig = {
  damping: 15,
  stiffness: 300,
  mass: 0.5,
};

export default function AnimatedTabBar({ state, descriptors, navigation }: TabBarProps) {
  const selectedIndex = useSharedValue(0);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    selectedIndex.value = withSpring(state.index, springConfig);
  }, [state.index, selectedIndex]);

  const getTabIcon = (routeName: string, focused: boolean) => {
    const iconProps = {
      size: 24,
      color: focused ? '#000000' : '#9CA3AF'
    };

    switch (routeName) {
      case 'index':
        return <IconSymbol name="message.circle" {...iconProps} />;
      case 'recommendations':
        return <IconSymbol name="magnifyingglass" {...iconProps} />;
      case 'viajes':
        return <IconSymbol name="location.fill" {...iconProps} />;
      case 'profile':
        return <IconSymbol name="person.fill" {...iconProps} />;
      default:
        return null;
    }
  };

  // Animated background indicator
  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = 100; // Each tab is 25% of the width (100% / 4 tabs)
    const translateX = selectedIndex.value * tabWidth;
    
    return {
      transform: [
        {
          translateX: withSpring(`${translateX}%`, springConfig)
        }
      ]
    };
  });

  // Create individual animated styles for each tab
  const tab0Style = useAnimatedStyle(() => {
    const isSelected = selectedIndex.value === 0;
    const scale = isSelected ? withSpring(1.1, springConfig) : withSpring(1, springConfig);
    const translateY = isSelected ? withSpring(-2, springConfig) : withSpring(0, springConfig);
    return { transform: [{ scale }, { translateY }] };
  });

  const tab1Style = useAnimatedStyle(() => {
    const isSelected = selectedIndex.value === 1;
    const scale = isSelected ? withSpring(1.1, springConfig) : withSpring(1, springConfig);
    const translateY = isSelected ? withSpring(-2, springConfig) : withSpring(0, springConfig);
    return { transform: [{ scale }, { translateY }] };
  });

  const tab2Style = useAnimatedStyle(() => {
    const isSelected = selectedIndex.value === 2;
    const scale = isSelected ? withSpring(1.1, springConfig) : withSpring(1, springConfig);
    const translateY = isSelected ? withSpring(-2, springConfig) : withSpring(0, springConfig);
    return { transform: [{ scale }, { translateY }] };
  });

  const tab3Style = useAnimatedStyle(() => {
    const isSelected = selectedIndex.value === 3;
    const scale = isSelected ? withSpring(1.1, springConfig) : withSpring(1, springConfig);
    const translateY = isSelected ? withSpring(-2, springConfig) : withSpring(0, springConfig);
    return { transform: [{ scale }, { translateY }] };
  });

  const tabStyles = [tab0Style, tab1Style, tab2Style, tab3Style];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10) }]}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      <View style={styles.tabContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const tabAnimatedStyle = tabStyles[index];

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <Animated.View style={[styles.tabContent, tabAnimatedStyle]}>
                {getTabIcon(route.name, isFocused)}
                {options.title && (
                  <Animated.Text
                    style={[
                      styles.tabLabel,
                      { color: isFocused ? '#000000' : '#9CA3AF' }
                    ]}
                  >
                    {options.title}
                  </Animated.Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '25%', // Width for each tab
    height: 3,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    height: 60,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  addButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});