import React from 'react';
import './SingleTOS.scss';
import formatDate from 'occasion';

export class SingleTOS extends React.Component {
  constructor(props) {
    super(props);
  }
  formatDateTime(dateTime) {
    const date = dateTime.slice(0,10);
    const time = dateTime.slice(11,16);
    return { date, time }
  }
  generatePhases(phases) {
    return phases.map((phase, index) => {
      const modifiedDateTime = this.formatDateTime(phase.modified_at);
      const formattedDate = formatDate(modifiedDateTime.date, 'DD.MM.YYYY');
      const idName = "#"+phase.name;
      const actions = phase.actions.map((action, index) => {
        const records = action.records.map((record, index) => {
          console.log(record);
          return (
            <tr key={index}>
              <td className="col-xs-8">{record.name}</td>
              <td className="col-xs-4">liite</td>
            </tr>
          )
        });
        return (
          <div key={index} className="action box">
            <span className="action-title">{action.name}</span>
            <table className="table table-striped table-hover records">
              <thead>
                <tr>
                  <th>Kuvaus</th>
                  <th>Tyyppi</th>
                </tr>
              </thead>
              <tbody>
                {records}
              </tbody>
            </table>
          </div>
        )
      })
      return (
        <div key={index} className="col-xs-12 box">
          <div className="col-xs-12 space-between">
            <span className="phase-title"><i className="fa fa-info-circle" aria-hidden="true"></i> {phase.name}</span>
            <button type="button" data-toggle="collapse" data-target={idName} className="fa fa-plus black-plus" aria-expanded="false" aria-controls={phase.name}></button>
          </div>
          <div id={idName} className="col-xs-12">
            { actions }
          </div>
        </div>
      );
    });
  }
  render() {
    const { selectedTOSData } = this.props;
    if(selectedTOSData !== undefined && Object.keys(selectedTOSData).length !== 0) {
      const modifiedDateTime = this.formatDateTime(selectedTOSData.modified_at);
      const formattedDate = formatDate(modifiedDateTime.date, 'DD.MM.YYYY');
      const phases = this.generatePhases(selectedTOSData.phases);
      return (
        <div className="col-xs-12 single-tos-container">
          <h4>{selectedTOSData.function_id} {selectedTOSData.name}</h4>
          <div className="general-info space-between">
            <div className="version-details">
              <span>Tila: Luonnos versio 1.2</span>
              <span>Käytössä oleva TOS-versio: 1.0</span>
              <span>Muokattu: { formattedDate } { modifiedDateTime.time }</span>
            </div>
            <div className="document-buttons">
              <button className="btn btn-primary">Tallenna luonnos</button>
              <button className="btn btn-default">Lähetä tarkastettavaksi</button>
            </div>
          </div>
          <ul className="nav nav-tabs tos-nav">
            <li className="active">
              <a href="#" data-toggle="tab">Muokkausnäkymä</a>
            </li>
            <li>
              <a href="#" data-toggle="tab">Viestit & Versiot</a>
            </li>
          </ul>
          <div className="well">
            <h4 className="unlocated-title">Sijoittamattomat toimenpiteet ja asiakirjat</h4>
            <div className="box">
              <span>Neuvontapyynnöstä päättäminen</span>
              <p>10 asiakirjaa | 3 liitettä</p>
            </div>
          </div>
          <div className="button-row col-xs-12">
            <button className="btn btn-default btn-sm pull-right">Avaa kaikki</button>
            <button className="btn btn-default btn-sm pull-right">Pienennä kaikki</button>
          </div>
          { phases }
        </div>
      );
    }
    else {
      return null;
    }
  }
}

SingleTOS.propTypes = {
  selectedTOSData: React.PropTypes.object.isRequired
}

export default SingleTOS;
