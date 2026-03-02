import { useWindowDimensions } from 'react-native';

/**
 * Responsive breakpoint hook for adapting layouts across device sizes.
 * compact: small phones (< 375px)
 * regular: standard phones (375-428px)
 * large: large phones / small tablets (> 428px)
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isCompact = width < 375;
  const isLarge = width > 428;
  const isRegular = !isCompact && !isLarge;

  // Grid column count adapts to screen width
  const gridCols = isCompact ? 2 : isLarge ? 4 : 3;

  // Percentage width for 2-column grid items
  const halfWidth = isCompact ? '100%' : '47%';

  return {
    width,
    height,
    isCompact,
    isRegular,
    isLarge,
    gridCols,
    halfWidth,
  } as const;
}
