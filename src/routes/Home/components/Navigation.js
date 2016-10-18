import React from 'react';
import './Navigation.scss';
import InfinityMenu from "react-infinity-menu";
import "react-infinity-menu/src/infinity-menu.css";

export class Navigation extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.props.getNavigationMenuItems();
  }
  componentWillReceiveProps(nextProps) {
    console.log('h');
  }
  onNodeMouseClick(event, tree, node, level, keyPath) {
    this.props.toggleVisibility(tree)
  }
  onLeafMouseClick(event, leaf) {
    console.log(leaf.id);
    console.log(leaf.name);
    // this.props.openERM();
  }
  render() {
    return (
      <InfinityMenu
        tree = {this.props.navigationMenuItems}
        onNodeMouseClick = {this.onNodeMouseClick.bind(this)}
        onLeafMouseClick = {this.onLeafMouseClick.bind(this)}/>
    );
  }
}

Navigation.propTypes = {
  getNavigationMenuItems: React.PropTypes.func.isRequired,
  toggleVisibility: React.PropTypes.func.isRequired,
  navigationMenuItems: React.PropTypes.array.isRequired
}

export default Navigation;
