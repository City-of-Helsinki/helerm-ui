import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Exporter, { EXPORT_OPTIONS } from '../Exporter';
import attributeRules from '../../../utils/mocks/attributeRules.json';
import validTOSwithChildren from '../../../utils/mocks/validTOSwithChildren.json';

describe('Exporter', () => {
  const attributeTypes = attributeRules;

  const data = [validTOSwithChildren];

  it('renders without crashing', () => {
    render(<Exporter attributeTypes={attributeTypes} data={data} />);
  });

  it('displays the export options', async () => {
    const { getByRole, getByText } = render(<Exporter attributeTypes={attributeTypes} data={data} />);

    const select = getByRole('textbox');

    const user = userEvent.setup();

    await user.click(select);

    EXPORT_OPTIONS.forEach((option) => {
      expect(getByText(option.label)).toBeInTheDocument();
    });
  });
});
