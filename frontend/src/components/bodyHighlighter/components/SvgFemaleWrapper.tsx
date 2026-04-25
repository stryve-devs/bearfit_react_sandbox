import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';

type SvgWrapperProps = {
  children: React.ReactNode;
  scale: number;
  side: 'front' | 'back';
  border: string | 'none';
};

export const SvgFemaleWrapper: React.FC<SvgWrapperProps> = ({ children, scale, side, border }) => {
  const viewBox = side === 'front' ? '-50 -40 734 1538' : '756 0 774 1448';

  return (
    <Svg
      viewBox={viewBox}
      height={400 * scale}
      width={200 * scale}
      accessible={true}
      accessibilityLabel={`female-body-${side}`}
    >
      {border !== 'none' && (
        <G strokeWidth={2} fill="none" strokeLinecap="butt">
          {side === 'front' && (
            <Path
              stroke={border}
              vectorEffect="non-scaling-stroke"
              d="m 373.53,205.88 c -0.45333,0.42667 -0.81,0.91667 -1.07,1.47 -3.29333,7.06 -7.28,13.70667 -11.96,19.94 -2.14,2.84667 -4.41,5.19333 -6.81,7.04 -0.36158,0.27621 -0.53584,0.73316 -0.45,1.18 0.43333,2.3 0.96,4.58667 1.58,6.86 7,25.46 37.78,29.15 59.68,31.39 6.10667,0.62 12.19667,1.61 18.27,2.97 7.96,1.77333 14.17,3.97667 18.63,6.61 14.63,8.62 23.15,23.99 26.24,40.5 3.70667,19.74 5.03,39.49 3.97,59.25"
              accessible={true}
              accessibilityLabel="female-body-outline-front"
            />
          )}
          {side === 'back' && (
            <Path
              stroke={border}
              vectorEffect="non-scaling-stroke"
              d="m 1194.44,206.54 c -3.1933,7.99333 -7.4233,15.23333 -12.69,21.72 -1.88,2.31333 -3.8467,4.26333 -5.9,5.85 -0.3221,0.24773 -0.4893,0.65057 -0.44,1.06 3.86,33.54 38.8,35.87 65.04,39.05 5.0133,0.60667 10.6067,1.62667 16.78,3.06 6.38,1.47333 11.8067,3.52333 16.28,6.15"
              accessible={true}
              accessibilityLabel="female-body-outline-back"
            />
          )}
        </G>
      )}
      {children}
    </Svg>
  );
};

