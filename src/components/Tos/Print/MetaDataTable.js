import React from 'react';
import PropTypes from 'prop-types';

const Table = ({ rows }) => (
  <table>
    <caption>Metatiedot</caption>
    <tbody>
      {rows.map(row => {
        const [title, ...cells] = row;
        return (
          <tr key={title}>
            <th scope='row'>{title}</th>
            {cells.map(value => <td key={`${title}.${value}`}>{value}</td>)}
          </tr>
        );
      })}
    </tbody>
  </table>
);

Table.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
};

export default Table;
