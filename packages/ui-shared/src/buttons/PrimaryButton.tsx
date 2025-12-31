import { Button as HeroUIButton } from '@heroui/button';
import { ReactElement } from 'react';

export const PrimaryButton = (): ReactElement => {
  return (
    <HeroUIButton color="primary" variant="bordered">
      Button
    </HeroUIButton>
  );
};
