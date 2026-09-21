import React from 'react';
import { resolvePath } from '@/utils/pathUtils';
import { cn } from '@/lib/utils';

export type BrandMarkMood =
  | 'landing'
  | 'app'
  | 'auth'
  | 'verify'
  | 'ladder'
  | 'footer'
  | 'mobile';

type BrandMarkProps = {
  mood: BrandMarkMood;
  className?: string;
  inverted?: boolean;
  title?: string;
};

const BrandMark: React.FC<BrandMarkProps> = ({
  mood,
  className,
  inverted = false,
  title = 'RallyRank',
}) => (
  <img
    src={resolvePath('/favicon.svg')}
    alt=""
    title={title}
    className={cn(
      'brand-mark',
      `brand-mark--${mood}`,
      inverted && 'brightness-0 invert',
      className
    )}
  />
);

export default BrandMark;
