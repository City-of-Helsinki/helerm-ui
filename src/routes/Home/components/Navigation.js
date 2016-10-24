import React from 'react';
import './Navigation.scss';
import InfinityMenu from "react-infinity-menu";
import "react-infinity-menu/src/infinity-menu.css";

export class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tree: []
    };
  }
  componentWillMount() {
    this.props.getNavigationMenuItems();
  }
  componentWillReceiveProps(nextProps){
    this.setState({
      tree: nextProps.navigationMenuItems
    });
  }
  onNodeMouseClick(event, tree, node, level, keyPath) {
    this.setState({
      tree: tree
    });
  }
  onLeafMouseClick(event, leaf) {
    this.props.fetchTOS();
  }
  render() {
    return (
      <div className="col-xs-12">
        <InfinityMenu
          tree = {this.state.tree}
          onNodeMouseClick = {this.onNodeMouseClick.bind(this)}
          onLeafMouseClick = {this.onLeafMouseClick.bind(this)}/>
      </div>
    );
  }
}

Navigation.propTypes = {
  fetchTOS: React.PropTypes.func.isRequired,
  getNavigationMenuItems: React.PropTypes.func.isRequired,
  navigationMenuItems: React.PropTypes.array.isRequired
}

export default Navigation;
