import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import confService from "../conf/services.conf";
import { OrderListRow } from "./OrderListRow";

const OrderList = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await fetch(`${confService.host_app_node}/orders`);
    const json = await (await response).json();
    setData(json.result);
  };

  return (
    <>
      <h1>Sell Order List</h1>
      <div className="text-right mb-3">
        <Link className="btn btn-primary" to="/order/create">
          Create Order
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Seller Store</th>
              <th>Creation Date</th>
              <th>Shipping Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <OrderListRow key={row.order_number} data={row} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrderList;
