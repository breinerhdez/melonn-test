import React from "react";
import { Link } from "react-router-dom";

import logo from "./img/melonn-logo.png";

const Layout = (props) => {
  return (
    <>
      <div className="header-container">
        <img src={logo} alt="Logo Melonn" />
      </div>
      <div className="container">
        {/* <ul className="nav">
        <li className="nav-item">
          <Link className="nav-link" to="/">
            Index
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/order/23/details">
            Details
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/order/create">
            Create
          </Link>
        </li>
      </ul> */}

        {props.children}
      </div>
    </>
  );
};

export default Layout;
