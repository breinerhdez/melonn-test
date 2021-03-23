import React from "react";
import { useForm } from "../hooks/useForm";
import { OrderProductRow } from "./OrderProductRow";

export const OrderProducts = ({ setProducts, products }) => {
  const initialState = {
    product_name: "",
    product_qty: 0,
    product_weight: 0,
  };
  const [values, handleChange, setValues] = useForm(initialState);
  const { product_name, product_qty, product_weight } = values;

  const handleAdd = async (e) => {
    setProducts([...products, values]);
    setValues(initialState);
  };

  return (
    <>
      <div className="row">
        <div className="form-group col-md-4 col-sm-12">
          <label htmlFor="product_name">Name</label>
          <input className="form-control" type="text" name="product_name" id="product_name" onChange={handleChange} value={product_name} />
        </div>
        <div className="form-group col-md-3 col-sm-12">
          <label htmlFor="product_qty">Quantity</label>
          <input className="form-control" type="number" name="product_qty" id="product_qty" onChange={handleChange} value={product_qty} />
        </div>
        <div className="form-group col-md-3 col-sm-12">
          <label htmlFor="product_weight">Weight</label>
          <input
            className="form-control"
            type="number"
            name="product_weight"
            id="product_weight"
            onChange={handleChange}
            value={product_weight}
          />
        </div>
        <div className="col-md-2 col-sm-12 text-center">
          <button type="button" className="btn btn-info" onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>

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
            {products.map((row, i) => (
              <OrderProductRow key={i} product={row} />
            ))}
          </tbody>
        </table>
      </div>

      <hr />
    </>
  );
};
