import { useEffect } from 'react';

export const usePageTitle = (title: string): void => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    // Optional: Restore previous title when unmounting (good for modals/drawers)
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};
