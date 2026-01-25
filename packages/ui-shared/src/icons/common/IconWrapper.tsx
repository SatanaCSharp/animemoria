import React, { ReactElement } from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const IconWrapper = ({
  size = 24,
  width,
  height,
  className,
  fill,
  ...props
}: IconProps): ReactElement => (
  <svg
    height={size || height}
    width={size || width}
    viewBox="0 0 24 24"
    fill={fill || 'currentColor'} // Allows Tailwind text-color
    className={className}
    {...props}
  />
);
