import { renderHook } from '@testing-library/react';

import { usePageTitle } from 'hooks/usePageTitle';

describe('usePageTitle', () => {
  const originalTitle = document.title;

  afterEach(() => {
    document.title = originalTitle;
  });

  it('sets document title to the given value', () => {
    renderHook(() => usePageTitle('Test Page Title'));

    expect(document.title).toBe('Test Page Title');
  });

  it('updates document title when title changes', () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: 'First Title' },
    });

    expect(document.title).toBe('First Title');

    rerender({ title: 'Second Title' });

    expect(document.title).toBe('Second Title');
  });

  it('restores previous title on unmount', () => {
    document.title = 'Original';
    const { unmount } = renderHook(() => usePageTitle('New Title'));

    expect(document.title).toBe('New Title');

    unmount();

    expect(document.title).toBe('Original');
  });
});
