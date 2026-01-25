import { ReactNode } from 'react';

export const Footer = (): ReactNode => {
  return (
    <footer className="sticky bottom-0 z-40 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} AniMemoria. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
