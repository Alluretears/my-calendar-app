import React from "react";
import clsx from "clsx";
import "./Toolbar.scss";
import { Navigate } from "react-big-calendar";

export default class Toolbar extends React.Component {
  render() {
    let {
      localizer: { messages },
      label,
    } = this.props;

    return (
      <div className="toolbar">
        <div className="view-btn-group">{this.viewNamesGroup(messages)}</div>
        <span className="toolbar-label">{label}</span>
        <span className="navigate-btn-group">
          <button
            type="button"
            onClick={this.navigate.bind(null, Navigate.PREVIOUS)}
          >
            <svg
              t="1630405189875"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="1388"
              width="14"
              height="14"
            >
              <path
                d="M629.291 840.832l60.331-60.331-268.501-268.501 268.501-268.501-60.331-60.331-328.832 328.832z"
                p-id="1389"
                fill="#00000"
              ></path>
            </svg>
          </button>
          <button
            type="button"
            onClick={this.navigate.bind(null, Navigate.TODAY)}
          >
            {messages.today}
          </button>
          <button
            type="button"
            onClick={this.navigate.bind(null, Navigate.NEXT)}
          >
            <svg
              t="1630405245529"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="1589"
              width="14"
              height="14"
            >
              <path
                d="M689.621 512l-328.832-328.832-60.331 60.331 268.501 268.501-268.501 268.501 60.331 60.331z"
                p-id="1590"
                fill="#00000"
              ></path>
            </svg>
          </button>
        </span>
      </div>
    );
  }

  navigate = (action) => {
    this.props.onNavigate(action);
  };

  view = (view) => {
    this.props.onView(view);
  };

  viewNamesGroup(messages) {
    let viewNames = this.props.views;
    const view = this.props.view;

    if (viewNames.length > 1) {
      return viewNames.map((name) => (
        <button
          type="button"
          key={name}
          className={clsx({ "button-active": view === name })}
          onClick={this.view.bind(null, name)}
        >
          {messages[name]}
        </button>
      ));
    }
  }
}
