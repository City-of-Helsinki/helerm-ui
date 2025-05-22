import { renderHook, act } from '@testing-library/react';

import useOutsideClick from '../useOutsideClick';

describe('useOutsideClick', () => {
  it('should initialize with showInitially value', () => {
    const { result } = renderHook(() => useOutsideClick(true));
    expect(result.current.show).toBe(true);

    const { result: resultFalse } = renderHook(() => useOutsideClick(false));
    expect(resultFalse.current.show).toBe(false);
  });

  it('should set show to false when clicking outside', () => {
    const { result } = renderHook(() => useOutsideClick(true));
    const { ref } = result.current;

    // Mock the ref to simulate a DOM element
    const mockElement = document.createElement('div');
    ref.current = mockElement;

    // Simulate a click outside the element
    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    expect(result.current.show).toBe(false);
  });

  it('should not set show to false when clicking inside', () => {
    const { result } = renderHook(() => useOutsideClick(true));
    const { ref } = result.current;

    // Mock the ref to simulate a DOM element
    const mockElement = document.createElement('div');
    ref.current = mockElement;

    // Simulate a click inside the element
    act(() => {
      mockElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    expect(result.current.show).toBe(true);
  });

  it('should clean up event listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useOutsideClick(true));

    expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
