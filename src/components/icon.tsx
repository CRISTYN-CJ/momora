import Svg, { Circle, Path } from 'react-native-svg';

const paths = {
  chevronLeft: 'M15 5l-7 7 7 7',
  chevronRight: 'M9 5l7 7-7 7',
  arrowRight: 'M4 12h16m-6-6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  search: 'M20 20l-4.2-4.2',
} as const;

export type IconName = keyof typeof paths | 'globe';

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number };

export function Icon({ name, size = 20, color = '#0B0B0B', strokeWidth = 2 }: Props) {
  const stroke = { stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'globe' ? (
        <>
          <Circle cx={12} cy={12} r={9} {...stroke} />
          <Path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" {...stroke} />
        </>
      ) : (
        <>
          {name === 'search' && <Circle cx={10.5} cy={10.5} r={6.5} {...stroke} />}
          <Path d={paths[name]} {...stroke} />
        </>
      )}
    </Svg>
  );
}
