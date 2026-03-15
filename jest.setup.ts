// Jest mock for @shopify/react-native-skia
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: ({ children }: any) => children,
  Image: () => null,
  Rect: () => null,
  Group: ({ children }: any) => children,
  Atlas: () => null,
  useImage: () => null,
  useRectBuffer: () => [],
  useRSXformBuffer: () => [],
  FilterMode: { Nearest: 0, Linear: 1 },
  MipmapMode: { Nearest: 0, None: 1 },
  interpolateColors: () => 'rgba(0,0,0,0)',
  useDerivedValue: (fn: any) => ({ value: fn() }),
  useSharedValue: (v: any) => ({ value: v }),
}));

// Jest mock for expo-blur
jest.mock('expo-blur', () => ({
  BlurView: ({ children }: any) => children,
}));
