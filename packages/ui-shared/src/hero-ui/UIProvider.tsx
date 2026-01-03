import { HeroUIProvider } from '@heroui/react';
import { ReactElement, ReactNode } from 'react';

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider = ({ children }: UIProviderProps): ReactElement => {
  return <HeroUIProvider>{children}</HeroUIProvider>;
};
