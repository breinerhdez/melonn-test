// import logo from './logo.svg';
// import './App.css';

import "bootstrap/dist/css/bootstrap.min.css";

import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Layout from "./Layout";
import OrderCreate from "./orders/OrderCreate";
import OrderDetails from "./orders/OrderDetails";
import OrderList from "./orders/OrderList";
import Page404 from "./Page404";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/" component={OrderList} />
          <Route exact path="/order/:id_order/details" component={OrderDetails} />
          <Route exact path="/order/create" component={OrderCreate} />
          <Route component={Page404} />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
