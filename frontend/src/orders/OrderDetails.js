import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import confService from "../conf/services.conf";
import { OrderProductRow } from "./OrderProductRow";

const OrderDetails = (props) => {
  const [order, setOrder] = useState({
    promise_order: {},
    products: [],
  });

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    const response = await fetch(`${confService.host_app_node}/orders/${props.match.params.id_order}`, {
      headers: confService.host_sanbox_headers,
    });
    const json = await (await response).json();
    setOrder(json.result);
  };

  return (
    <div>
      <h1>Order Details</h1>

      <div className="mb-3">
        <Link className="btn btn-primary" to="/">
          Back to list
        </Link>
      </div>

      <form className="form">
        <legend>Order Information</legend>
        <div className="row">
          <div className="form-group col-sm-12 col-md-6">
            <label>External Order Number</label>
            <div className="form-control">{order.external_order_number}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>Buyer Full Name</label>
            <div className="form-control">{order.buyer_fullname}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>Buyer Phone Number</label>
            <div className="form-control">{order.buyer_phone_number}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>Buyer E-mail</label>
            <div className="form-control">{order.buyer_email}</div>
          </div>
        </div>

        <legend>Shipping Information</legend>
        <div className="row">
          <div className="form-group col-sm-12 col-md-6">
            <label>Address</label>
            <div className="form-control">{order.shipping_address}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>City</label>
            <div className="form-control">{order.shipping_city}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>Region</label>
            <div className="form-control">{order.shipping_region}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>Country</label>
            <div className="form-control">{order.shipping_country}</div>
          </div>
        </div>

        <legend>Promise Dates</legend>
        <div className="row">
          <div className="form-group col-sm-12 col-md-6">
            <label>Pack Min</label>
            <div className="form-control">{order.promise_order.pack_promise_min}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>Pack Max</label>
            <div className="form-control">{order.promise_order.pack_promise_max}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>Ship Min</label>
            <div className="form-control">{order.promise_order.ship_promise_min}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>Ship Max</label>
            <div className="form-control">{order.promise_order.ship_promise_max}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>Delivery Min</label>
            <div className="form-control">{order.promise_order.delivery_promise_min}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>Delivery Max</label>
            <div className="form-control">{order.promise_order.delivery_promise_max}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>Ready Pick Up Min</label>
            <div className="form-control">{order.promise_order.ready_pickup_promise_min}</div>
          </div>

          <div className="form-group col-sm-12 col-md-6">
            <label>Ready Pick Up Max</label>
            <div className="form-control">{order.promise_order.ready_pickup_promise_max}</div>
          </div>
        </div>

        <legend>Products</legend>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {order.products.map((row, i) => (
                <OrderProductRow key={i} product={row} />
              ))}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
};

export default OrderDetails;
