import { Outlet } from '@tanstack/react-router';
import { ReactElement } from 'react';

import { Footer } from 'shared/components/Footer/Footer';
import { Header } from 'shared/components/Header/Header';

export const RootLayout = (): ReactElement => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto h-full px-4 flex flex-col">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};
