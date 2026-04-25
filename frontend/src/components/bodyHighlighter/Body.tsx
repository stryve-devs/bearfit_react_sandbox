import React, { useCallback } from 'react';
import { Path } from 'react-native-svg';

import type { BodyPart, BodyPartStyles, BodyProps, ExtendedBodyPart } from './types';
import { bodyFront } from './assets/bodyFront';
import { bodyBack } from './assets/bodyBack';
import { SvgMaleWrapper } from './components/SvgMaleWrapper';
import { SvgFemaleWrapper } from './components/SvgFemaleWrapper';

const Body = ({
  colors = ['#0984e3', '#74b9ff'],
  data,
  scale = 1,
  side = 'front',
  gender = 'male',
  onBodyPartPress,
  border = '#dfdfdf',
  disabledParts = [],
  hiddenParts = [],
  defaultFill = '#3f3f3f',
  defaultStroke = 'none',
  defaultStrokeWidth = 0,
}: BodyProps) => {
  const getPartStyles = useCallback(
    (bodyPart: ExtendedBodyPart, selectedPart?: ExtendedBodyPart): BodyPartStyles => {
      const source = selectedPart ?? bodyPart;
      return {
        fill: source.styles?.fill ?? defaultFill,
        stroke: source.styles?.stroke ?? defaultStroke,
        strokeWidth: source.styles?.strokeWidth ?? defaultStrokeWidth,
      };
    },
    [defaultFill, defaultStroke, defaultStrokeWidth],
  );

  const getColorToFill = (bodyPart: ExtendedBodyPart, selectedPart?: ExtendedBodyPart) => {
    const source = selectedPart ?? bodyPart;

    if (bodyPart.slug && disabledParts.includes(bodyPart.slug)) return '#EBEBE4';
    if (source.styles?.fill) return source.styles.fill;
    if (source.color) return source.color;

    if (source.intensity && source.intensity > 0) {
      return colors[Math.max(0, Math.min(colors.length - 1, source.intensity - 1))];
    }
    return undefined;
  };

  const isPartDisabled = (slug?: ExtendedBodyPart['slug']) => slug && disabledParts.includes(slug);

  const getEntriesBySlug = useCallback(
    (slug?: ExtendedBodyPart['slug']) => data.filter((entry) => entry.slug === slug),
    [data],
  );

  const renderBodySvg = (bodyToRender: ReadonlyArray<BodyPart>) => {
    const SvgWrapper = gender === 'male' ? SvgMaleWrapper : SvgFemaleWrapper;
    const visibleParts = bodyToRender.filter((part) => part.slug && !hiddenParts.includes(part.slug));

    return (
      <SvgWrapper side={side} scale={scale} border={border}>
        {visibleParts.flatMap((bodyPart) => {
          const selectedEntries = getEntriesBySlug(bodyPart.slug);
          const commonSelection = selectedEntries.find((e) => e.side === undefined) ?? selectedEntries[0];
          const leftSelection =
            selectedEntries.find((e) => e.side === 'left') ??
            selectedEntries.find((e) => e.side === undefined);
          const rightSelection =
            selectedEntries.find((e) => e.side === 'right') ??
            selectedEntries.find((e) => e.side === undefined);

          const extendedPart = bodyPart as ExtendedBodyPart;

          const commonPaths = (bodyPart.path?.common ?? []).map((d) => {
            const partStyles = getPartStyles(extendedPart, commonSelection);
            const fill = commonSelection ? getColorToFill(extendedPart, commonSelection) : defaultFill;
            return (
              <Path
                key={`common-${bodyPart.slug}-${d}`}
                id={extendedPart.slug}
                d={d}
                fill={fill ?? partStyles.fill}
                stroke={partStyles.stroke}
                strokeWidth={partStyles.strokeWidth}
                onPress={isPartDisabled(extendedPart.slug) ? undefined : (evt) => onBodyPartPress?.(extendedPart, undefined, evt)}
                onPressIn={isPartDisabled(extendedPart.slug) ? undefined : (evt) => onBodyPartPress?.(extendedPart, undefined, evt)}
                aria-disabled={isPartDisabled(extendedPart.slug)}
              />
            );
          });

          const leftPaths = (bodyPart.path?.left ?? []).map((d) => {
            const partStyles = getPartStyles(extendedPart, leftSelection);
            const fill = leftSelection ? getColorToFill(extendedPart, leftSelection) : defaultFill;
            return (
              <Path
                key={`left-${bodyPart.slug}-${d}`}
                id={extendedPart.slug}
                d={d}
                fill={fill ?? partStyles.fill}
                stroke={partStyles.stroke}
                strokeWidth={partStyles.strokeWidth}
                onPress={isPartDisabled(extendedPart.slug) ? undefined : (evt) => onBodyPartPress?.(extendedPart, 'left', evt)}
                onPressIn={isPartDisabled(extendedPart.slug) ? undefined : (evt) => onBodyPartPress?.(extendedPart, 'left', evt)}
              />
            );
          });

          const rightPaths = (bodyPart.path?.right ?? []).map((d) => {
            const partStyles = getPartStyles(extendedPart, rightSelection);
            const fill = rightSelection ? getColorToFill(extendedPart, rightSelection) : defaultFill;
            return (
              <Path
                key={`right-${bodyPart.slug}-${d}`}
                id={extendedPart.slug}
                d={d}
                fill={fill ?? partStyles.fill}
                stroke={partStyles.stroke}
                strokeWidth={partStyles.strokeWidth}
                onPress={isPartDisabled(extendedPart.slug) ? undefined : (evt) => onBodyPartPress?.(extendedPart, 'right', evt)}
                onPressIn={isPartDisabled(extendedPart.slug) ? undefined : (evt) => onBodyPartPress?.(extendedPart, 'right', evt)}
              />
            );
          });

          return [...commonPaths, ...leftPaths, ...rightPaths];
        })}
      </SvgWrapper>
    );
  };

  // Note: For now, female uses the same part map as male (the wrapper silhouette differs).
  return renderBodySvg(side === 'front' ? bodyFront : bodyBack);
};

export default Body;

