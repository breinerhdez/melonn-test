import React from "react";
import { Link } from "react-router-dom";

export const OrderListRow = (props) => {
  const { data } = props;
  return (
    <tr>
      <td>{data.order_number}</td>
      <td>{data.seller_store}</td>
      <td>{data.creation_date}</td>
      <td>{data.shipping_method_name}</td>
      <td>
        <Link className="btn btn-primary" to={`/order/${data.order_number}/details`}>
          Details
        </Link>
      </td>
    </tr>
  );
};
