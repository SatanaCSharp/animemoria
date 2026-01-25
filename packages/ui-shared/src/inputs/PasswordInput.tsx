import { Input, InputProps } from '@heroui/react';
import React, { ReactElement } from 'react';

import { EyeFilledIcon, EyeSlashFilledIcon } from '@/icons';

type Props = InputProps & {};

export const PasswordInput = (props: Props): ReactElement => {
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = (): void => setIsVisible(!isVisible);

  return (
    <Input
      variant="bordered"
      label={props.label}
      placeholder={props.placeholder}
      type={isVisible ? 'text' : 'password'}
      endContent={
        <button
          aria-label="toggle password visibility"
          className="focus:outline-solid outline-transparent self-center"
          type="button"
          onClick={toggleVisibility}
        >
          {isVisible ? (
            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
          ) : (
            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
          )}
        </button>
      }
      {...props}
    />
  );
};
