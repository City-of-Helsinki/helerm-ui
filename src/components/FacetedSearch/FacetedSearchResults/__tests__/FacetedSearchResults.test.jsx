import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FacetedSearchResults from '../FacetedSearchResults';

describe('<FacetedSearchResults />', () => {
  const renderResults = (props = {}) => {
    const onSelectItem = vi.fn();
    render(
      <FacetedSearchResults
        items={[]}
        metadata={{}}
        onSelectItem={onSelectItem}
        {...props}
      />,
    );

    return { onSelectItem };
  };

  it('renders matched attributes with metadata name lookup', () => {
    renderResults({
      items: [
        {
          id: '1',
          type: 'action',
          name: 'Test action',
          matchedAttributes: [{ key: 'AttributeKey', value: 'Match' }],
        },
      ],
      metadata: { AttributeKey: { name: 'Attribute label' } },
    });

    expect(screen.getByText('Attribute label: Match')).toBeInTheDocument();
  });

  it('falls back to the attribute key when metadata is missing', () => {
    renderResults({
      items: [
        {
          id: '2',
          type: 'action',
          name: 'Test action',
          matchedAttributes: [{ key: 'UnknownKey', value: 'Match' }],
        },
      ],
      metadata: {},
    });

    expect(screen.getByText('UnknownKey: Match')).toBeInTheDocument();
  });

  it('calls onSelectItem when an item is clicked', async () => {
    const { onSelectItem } = renderResults({
      items: [{ id: '3', type: 'action', name: 'Clickable' }],
    });

    await userEvent.click(screen.getByText('Clickable'));

    expect(onSelectItem).toHaveBeenCalledWith(expect.objectContaining({ id: '3' }));
  });
});
