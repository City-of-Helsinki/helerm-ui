import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import useKeyStrokeSupport from '../useKeyStrokeSupport';

const TestComponent = ({ onSubmit, onCancel, getRef }) => {
  const ref = useKeyStrokeSupport(onSubmit, onCancel);
  getRef(ref);
  return <input ref={ref} />;
};

describe('useKeyStrokeSupport', () => {
  it('should return a ref', () => {
    const { container } = render(<TestComponent onSubmit={vi.fn()} onCancel={vi.fn()} getRef={vi.fn()} />);
    const input = container.querySelector('input');
    expect(input).toBeDefined();
  });

  it('should call submit on Enter and cancel on Escape', async () => {
    const submit = vi.fn();
    const cancel = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<TestComponent onSubmit={submit} onCancel={cancel} getRef={vi.fn()} />);
    const input = container.querySelector('input');

    // Test Enter
    await user.type(input, '{Enter}');
    expect(submit).toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();

    // Reset and test Escape
    submit.mockClear();
    cancel.mockClear();
    await user.type(input, '{Escape}');
    expect(cancel).toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });

  it('should not call submit or cancel for other keys', async () => {
    const submit = vi.fn();
    const cancel = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<TestComponent onSubmit={submit} onCancel={cancel} getRef={vi.fn()} />);
    const input = container.querySelector('input');

    await user.type(input, 'a');

    expect(submit).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
  });

  it('should update listeners when submit or cancel callbacks change', async () => {
    const submit1 = vi.fn();
    const submit2 = vi.fn();
    const cancel = vi.fn();
    const user = userEvent.setup();

    const { rerender, container } = render(<TestComponent onSubmit={submit1} onCancel={cancel} getRef={vi.fn()} />);
    const input = container.querySelector('input');

    // Fire Enter with first submit
    await user.type(input, '{Enter}');
    expect(submit1).toHaveBeenCalledTimes(1);
    expect(submit2).not.toHaveBeenCalled();

    // Rerender with different submit
    rerender(<TestComponent onSubmit={submit2} onCancel={cancel} getRef={vi.fn()} />);

    // Fire Enter again with second submit
    submit1.mockClear();
    submit2.mockClear();
    await user.type(input, '{Enter}');
    expect(submit1).not.toHaveBeenCalled();
    expect(submit2).toHaveBeenCalledTimes(1);
  });

  it('should only attach listener to the referenced element, not globally', async () => {
    const submit = vi.fn();
    const cancel = vi.fn();
    const user = userEvent.setup();

    // Component with two inputs, only one has the hook
    // eslint-disable-next-line @eslint-react/component-hook-factories
    const TestTwoInputs = () => {
      const ref = useKeyStrokeSupport(submit, cancel);
      return (
        <div>
          <input ref={ref} data-testid='listened' />
          <input data-testid='unlistened' />
        </div>
      );
    };

    const { container } = render(<TestTwoInputs />);
    const listenedInput = container.querySelector('[data-testid="listened"]');
    const unlistenedInput = container.querySelector('[data-testid="unlistened"]');

    // Fire event on the listened element
    await user.type(listenedInput, '{Enter}');
    expect(submit).toHaveBeenCalledTimes(1);

    // Fire event on a different element - should not trigger
    submit.mockClear();
    await user.type(unlistenedInput, '{Enter}');
    expect(submit).not.toHaveBeenCalled();
  });
});
