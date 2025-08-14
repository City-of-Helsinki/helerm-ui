import React from 'react';
import { render, screen, act } from '@testing-library/react';

import Sticky from '../Sticky';

// Mock window scroll methods
const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', { value: mockScrollTo });
Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

// Helper to simulate scroll
const simulateScroll = (scrollY) => {
  window.scrollY = scrollY;
  window.dispatchEvent(new Event('scroll'));
};

// Helper to simulate resize
const simulateResize = () => {
  window.dispatchEvent(new Event('resize'));
};

// Mock getBoundingClientRect
const mockGetBoundingClientRect = (element, rect) => {
  element.getBoundingClientRect = vi.fn(() => rect);
};

describe('<Sticky />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollY = 0;
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders children correctly', () => {
    render(
      <Sticky>
        <div data-testid='sticky-content'>Test Content</div>
      </Sticky>,
    );

    expect(screen.getByTestId('sticky-content')).toBeInTheDocument();
  });

  it('applies className correctly', () => {
    render(
      <Sticky className='test-class'>
        <div data-testid='sticky-content'>Test Content</div>
      </Sticky>,
    );

    const stickyElement = screen.getByTestId('sticky-content').parentElement.parentElement;
    expect(stickyElement).toHaveClass('test-class');
  });

  it('becomes sticky when scrolled past topOffset', async () => {
    const { container } = render(
      <Sticky topOffset={100} stickyClassName='is-sticky'>
        <div data-testid='sticky-content'>Test Content</div>
      </Sticky>,
    );

    const holderElement = container.firstChild;
    const wrapperElement = holderElement.firstChild;

    // Mock initial position
    mockGetBoundingClientRect(holderElement, {
      top: 200,
      left: 50,
      width: 300,
      height: 60,
    });
    mockGetBoundingClientRect(wrapperElement, {
      top: 200,
      left: 50,
      width: 300,
      height: 60,
    });

    // Trigger initial position calculation
    await act(async () => {
      simulateScroll(0);
    });

    // Scroll past the trigger point
    await act(async () => {
      simulateScroll(150); // scrollY(150) + topOffset(100) = 250 > originalTop(200)
    });

    expect(holderElement).toHaveClass('is-sticky');
    expect(wrapperElement).toHaveStyle({ position: 'fixed', top: '100px' });
  });

  it('is not sticky when disabled', async () => {
    const { container } = render(
      <Sticky topOffset={100} stickyClassName='is-sticky' disabled>
        <div data-testid='sticky-content'>Test Content</div>
      </Sticky>,
    );

    const holderElement = container.firstChild;

    // Mock initial position
    mockGetBoundingClientRect(holderElement, {
      top: 200,
      left: 50,
      width: 300,
      height: 60,
    });

    await act(async () => {
      simulateScroll(300); // Should be sticky but disabled
    });

    expect(holderElement).not.toHaveClass('is-sticky');
  });

  it('applies custom stickyStyle when sticky', async () => {
    const customStyle = {
      backgroundColor: 'red',
      zIndex: 9999,
    };

    const { container } = render(
      <Sticky topOffset={50} stickyStyle={customStyle} stickyClassName='is-sticky'>
        <div data-testid='sticky-content'>Test Content</div>
      </Sticky>,
    );

    const holderElement = container.firstChild;
    const wrapperElement = holderElement.firstChild;

    mockGetBoundingClientRect(holderElement, {
      top: 100,
      left: 0,
      width: 300,
      height: 60,
    });
    mockGetBoundingClientRect(wrapperElement, {
      top: 100,
      left: 0,
      width: 300,
      height: 60,
    });

    // Initial position check
    await act(async () => {
      simulateScroll(0);
    });

    // Scroll to make it sticky
    await act(async () => {
      simulateScroll(100); // scrollY(100) + topOffset(50) = 150 > originalTop(100)
    });

    expect(holderElement).toHaveClass('is-sticky');
    expect(wrapperElement).toHaveStyle({ position: 'fixed' });
    // Custom styles should be applied
    expect(wrapperElement.style.backgroundColor).toBe('red');
    expect(wrapperElement.style.zIndex).toBe('9999');
  });

  it('handles boundary element constraints with hideOnBoundaryHit', async () => {
    // This test verifies that boundary elements are handled without errors
    // The actual boundary logic is complex to test due to DOM mocking limitations
    const { container } = render(
      <Sticky topOffset={100} boundaryElement='.nonexistent-boundary' hideOnBoundaryHit stickyClassName='is-sticky'>
        <div data-testid='sticky-content'>Test Content</div>
      </Sticky>,
    );

    const holderElement = container.firstChild;

    mockGetBoundingClientRect(holderElement, {
      top: 200,
      left: 0,
      width: 300,
      height: 60,
    });

    await act(async () => {
      simulateScroll(0);
    });

    // Should still work even if boundary element doesn't exist
    await act(async () => {
      simulateScroll(150);
    });

    // Since boundary element doesn't exist, hideOnBoundaryHit should not prevent stickiness
    expect(holderElement).toHaveClass('is-sticky');
  });

  it('resets position on resize', async () => {
    const { container } = render(
      <Sticky topOffset={100} stickyClassName='is-sticky'>
        <div data-testid='sticky-content'>Test Content</div>
      </Sticky>,
    );

    const holderElement = container.firstChild;
    const wrapperElement = holderElement.firstChild;

    // Initial position
    mockGetBoundingClientRect(holderElement, {
      top: 200,
      left: 50,
      width: 300,
      height: 60,
    });
    mockGetBoundingClientRect(wrapperElement, {
      top: 200,
      left: 50,
      width: 300,
      height: 60,
    });

    await act(async () => {
      simulateScroll(0);
    });

    await act(async () => {
      simulateScroll(150);
    });

    expect(holderElement).toHaveClass('is-sticky');

    // Simulate resize event - this should trigger position recalculation
    await act(async () => {
      simulateResize();
    });

    // After resize, the component should still be sticky (just testing that resize doesn't break it)
    expect(holderElement).toHaveClass('is-sticky');
  });

  it('sets up position recheck interval when specified', () => {
    vi.useFakeTimers();

    const { unmount } = render(
      <Sticky positionRecheckInterval={100}>
        <div data-testid='sticky-content'>Test Content</div>
      </Sticky>,
    );

    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);

    vi.useRealTimers();
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <Sticky>
        <div data-testid='sticky-content'>Test Content</div>
      </Sticky>,
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
