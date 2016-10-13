import React from 'react';


export class HomeView extends React.Component {

  render() {
    console.log(this.props.navigationMenuItems);
    return(
      <div>
        <h4>Home!</h4>
        <button className="btn btn-primary" onClick={this.props.getNavigationMenuItems} />
      </div>
    )
  }
};

HomeView.propTypes = {
  getNavigationMenuItems: React.PropTypes.func.isRequired
};

export default HomeView;
