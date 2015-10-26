import React, {PropTypes} from 'react';

import DropdownButton from 'react-bootstrap/DropdownButton';
import MenuItem from 'react-bootstrap/MenuItem';

export default class NavBar extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    titleUrl: PropTypes.string,
    subtitle: PropTypes.string,
    navItems: PropTypes.array,
    currentNav: PropTypes.string,
    extraLinks: PropTypes.array,
    renderSearch: PropTypes.func,
    onLinkClick: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.onLinkClick = this.onLinkClick.bind(this);
  }

  onLinkClick(e) {
    e.preventDefault();
    if (this.props.onLinkClick) {
      this.props.onLinkClick(e.target.href);
    }
  }

  getMenuItemClassName(item) {
    let classes = [];
    if (item.className) {
      classes.push(item.className);
    }
    if (item.className === this.props.currentNav) {
      classes.push('active');
    }
    return classes.join(' ');
  }

  renderNavItems() {
    if (this.props.navItems) {
      return (<ul className="nav navbar-nav main-nav" >
        {this.props.navItems.map((item) => <li className={this.getMenuItemClassName(item)}><a href={item.url} onClick={this.onLinkClick}>{item.label}</a></li>)}
      </ul>);
    }
    return undefined;
  }

  renderExtraLinks() {
    if (this.props.extraLinks) {
      return (<div className="extra-links">
        <DropdownButton bsStyle="link" title="help" id="nav-extra-links">
          {this.props.extraLinks.map((link) => {
            return <MenuItem href={link.url} target="_">{link.label}</MenuItem>;
          })}
        </DropdownButton>
      </div>);
    }
    return undefined;
  }

  renderSearch() {
    if (this.props.renderSearch) {
      return this.props.renderSearch();
    }
    return undefined;
  }

  render() {
    return (<nav className="navbar navbar-default navbar-fixed-top">
      <div className="navbar-header">
        <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-1" aria-expanded="false">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>

        <a className="navbar-brand" href={this.props.titleUrl} onClick={this.onLinkClick}>
          <span className="nav-title">{this.props.title}</span>
          {this.props.subtitle ? <span className="nav-subtitle">{this.props.subtitle}</span> : undefined}
        </a>

        {this.renderExtraLinks()}

        {this.renderSearch()}

      </div>

      <div className="collapse navbar-collapse" id="navbar-collapse-1">
        {this.renderNavItems()}
        <div className="navbar-search navbar-right">
        </div>
      </div>
    </nav>);
  }
}
