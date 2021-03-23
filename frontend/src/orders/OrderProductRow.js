import React from "react";

export const OrderProductRow = ({ product }) => {
  return (
    <tr>
      <td>{product.product_name}</td>
      <td>{product.product_qty}</td>
      <td>{product.product_weight}</td>
    </tr>
  );
};
