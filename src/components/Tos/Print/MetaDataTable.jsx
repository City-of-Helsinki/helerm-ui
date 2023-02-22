import React from 'react';
import PropTypes from 'prop-types';

/**
 * @param  {string|string[]} value
 * @return {string}
 */
const outputValue = (value) => (Array.isArray(value) ? value.join(', ') : value);

const Table = ({ rows }) => (
  <table>
    <caption>Metatiedot</caption>
    <tbody>
      {rows.map((row) => {
        const [title, ...cells] = row;
        return (
          <tr key={title}>
            <th scope='row'>{title}</th>
            {cells.map((value) => (
              <td key={`${title}.${value}`}>{outputValue(value)}</td>
            ))}
          </tr>
        );
      })}
    </tbody>
  </table>
);

const valueShape = PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]);

Table.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.arrayOf(valueShape)),
};

export default Table;
