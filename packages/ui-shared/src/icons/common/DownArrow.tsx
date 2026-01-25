import { ReactElement } from 'react';

import { IconProps, IconWrapper } from '@/icons/common/IconWrapper';

export const DownArrow = (props: IconProps): ReactElement => (
  <IconWrapper fill="none" {...props}>
    <path
      d="M4 8L12 16L20 8"
      stroke="black"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconWrapper>
);
