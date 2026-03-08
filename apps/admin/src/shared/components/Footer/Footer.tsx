import { ReactNode } from 'react';

import { testIds } from '__tests__/mocks/test-ids/shared/footer';

export const Footer = (): ReactNode => {
  return (
    <footer
      data-testid={testIds.ROOT}
      className="bottom-0 z-40 bg-gray-50 border-t border-gray-200"
    >
      <div className="container mx-auto px-4 py-3">
        <div
          data-testid={testIds.COPYRIGHT}
          className="text-center text-sm text-gray-600"
        >
          © {new Date().getFullYear()} AniMemoria. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
