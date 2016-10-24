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
    console.log(leaf.id);
    console.log(leaf.name);
    // this.props.openERM();
  }
  render() {
    return (
      <InfinityMenu
        tree = {this.state.tree}
        onNodeMouseClick = {this.onNodeMouseClick.bind(this)}
        onLeafMouseClick = {this.onLeafMouseClick.bind(this)}/>
    );
  }
}

Navigation.propTypes = {
  getNavigationMenuItems: React.PropTypes.func.isRequired,
  navigationMenuItems: React.PropTypes.array.isRequired
}

Navigation.headerProps = {
  title: 'Luokat',
  className: 'nav--empty-tree'
}

Navigation.emptyTreeComponentProps = {
  className: 'nav--empty-tree'
}

export default Navigation;
