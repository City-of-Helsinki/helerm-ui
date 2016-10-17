import React from 'react';
import './HomeView.scss';

export class HomeView extends React.Component {
  constructor(props) {
    super(props);
    this.navigationTree = [];
  }

  handleClick(item) {
    console.log('clickd');
    console.log(item);
  }
  generateNavigation(items) {

    items.map((item, index) => {
      const navigationRow = <span key={index}>{item.number} {item.title}</span>;
      this.navigationTree.push(navigationRow);
      if(item.children) {
        this.generateNavigation(item.children);
      }
    });
    console.log('navigationTree');
    console.log(this.navigationTree);
    //return this.navigationTree;
    return (
      <div className="navigation-menu">
        <h2 className="nav-main-title">Luokat</h2>
        <div className="navigation-menu-items">
          <span className="nav-title nav-title-depth-0" value={'01 Asuminen'} onClick={()=>this.handleClick('01 Asuminen')}>01 Asuminen</span>
          <span className="nav-title nav-title-depth-0">02 Rakennettu ympäristö</span>
          <span className="nav-title nav-title-depth-0">03 Perheiden palvelut</span>
          <span className="nav-title nav-title-depth-0">04 Terveydenhuolto, sairaanhoito ja ravitsemus</span>
          <span className="nav-title nav-title-depth-0">05 Sosiaalipalvelut</span>
          <span className="nav-title nav-title-depth-0">06 Koulutus</span>
          <span className="nav-title nav-title-depth-0">07 Oikeusturva</span>
          <span className="nav-title nav-title-depth-0">08 Demokratia</span>
          <span className="nav-title nav-title-depth-0">09 Hallintoasiat</span>
          <span className="nav-title nav-title-depth-0">10 Työ ja työttömyys</span>
        </div>
      </div>
    )
  }

  render() {
    const { navigationMenuItems } = this.props;
    let navigationElements;
    if(navigationMenuItems) {
      navigationElements = this.generateNavigation(navigationMenuItems);
      console.log(navigationElements);
    }
    return(
      <div>
        <button className="btn btn-primary" onClick={this.props.getNavigationMenuItems} />
        {navigationElements}
      </div>
    )
  }
};

HomeView.propTypes = {
  getNavigationMenuItems: React.PropTypes.func.isRequired
};

export default HomeView;
