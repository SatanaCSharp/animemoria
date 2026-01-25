import { Button as HeroUIButton, ButtonProps } from '@heroui/button';
import { ReactElement } from 'react';

type Props = ButtonProps & {};

export const Button = (props: Props): ReactElement => {
  return <HeroUIButton {...props}>{props.children}</HeroUIButton>;
};
