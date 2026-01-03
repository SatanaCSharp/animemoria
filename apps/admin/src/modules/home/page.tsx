import { PrimaryButton } from '@packages/ui-shared/buttons';
import { JSX } from 'react';

export const Home = (): JSX.Element => {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-900">Hello World</h1>
      <div className="pt-2">
        <PrimaryButton />
      </div>
    </div>
  );
};
