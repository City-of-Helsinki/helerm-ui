import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import attributeRules from '../../../utils/mocks/attributeRules.json';
import validTOSwithChildren from '../../../utils/mocks/validTOSwithChildren.json';
import Exporter from '../Exporter';

vi.mock('exceljs', async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    Workbook: vi.fn().mockImplementation(() => ({
      addWorksheet: vi.fn().mockReturnValue({
        addRow: vi.fn(),
      }),
      xlsx: {
        writeBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      },
    })),
  };
});

vi.mock('moment', async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    format: vi.fn().mockImplementation(() => '01.01.2022'),
  };
});

describe('<Exporter />', () => {
  const attributeTypes = attributeRules;
  const data = [validTOSwithChildren];

  it('renders without crashing', () => {
    const { container } = render(<Exporter data={data} attributeTypes={attributeTypes} />);
    expect(container).toBeInTheDocument();
  });

  it('does not render when isVisible is false', () => {
    const { queryByTestId } = render(<Exporter data={data} attributeTypes={attributeTypes} isVisible={false} />);
    expect(queryByTestId('exporter')).toBeNull();
  });

  it('calls createSingleSheetWorkBook when select option 0', async () => {
    const { getByText } = render(<Exporter data={data} attributeTypes={attributeTypes} />);

    const user = userEvent.setup();

    global.URL.createObjectURL = vi.fn(() => 'https://test.com');
    global.URL.revokeObjectURL = vi.fn();

    await user.click(getByText('Vie hakutulokset Exceliin (1)'));
    await user.click(getByText('Yhdelle välilehdelle'));

    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('calls createWorkBook when select option 1', async () => {
    const { getByText } = render(<Exporter data={data} attributeTypes={attributeTypes} />);

    const user = userEvent.setup();

    global.URL.createObjectURL = vi.fn(() => 'https://test.com');
    global.URL.revokeObjectURL = vi.fn();

    await user.click(getByText('Vie hakutulokset Exceliin (1)'));
    await user.click(getByText('Omille välilehdille'));

    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });
});
