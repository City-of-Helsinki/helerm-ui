import React from "react";

export default class NaviSearchInput extends React.Component {
    render() {
        return <input
        className="react-infinity-menu-default-search-input form-control"
        placeholder="Haku"
        onClick={this.props.startSearching} value={this.props.searchInput} onChange={this.props.setSearchInput}/>;
    }
}