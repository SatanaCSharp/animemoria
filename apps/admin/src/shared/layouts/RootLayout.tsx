import { Outlet } from '@tanstack/react-router';
import { ReactElement } from 'react';

import { Footer } from 'shared/components/Footer/Footer';
import { Header } from 'shared/components/Header/Header';

export const RootLayout = (): ReactElement => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};
