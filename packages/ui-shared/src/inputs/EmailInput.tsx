import { Input, InputProps } from '@heroui/react';
import { ReactElement } from 'react';

type Props = InputProps & {};

export const EmailInput = (props: Props): ReactElement => {
  return <Input type="email" {...props} />;
};
