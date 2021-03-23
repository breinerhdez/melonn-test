import React, { useEffect, useState } from "react";
import { useForm } from "../hooks/useForm";

import confService from "../conf/services.conf";
import { OrderProducts } from "./OrderProducts";
import { Link } from "react-router-dom";

const OrderCreate = (props) => {
  const initialState = {
    seller_store: "",
    shipping_method: "",
    external_order_number: "",
    buyer_fullname: "",
    buyer_phone_number: "",
    buyer_email: "",
    shipping_address: "",
    shipping_city: "",
    shipping_region: "",
    shipping_country: "",
    products: [],
  };
  const [values, handleChange, setValues] = useForm(initialState);
  const {
    seller_store,
    shipping_method,
    external_order_number,
    buyer_fullname,
    buyer_phone_number,
    buyer_email,
    shipping_address,
    shipping_city,
    shipping_region,
    shipping_country,
  } = values;

  const [products, setProducts] = useState([]);

  const [shippingData, setShippingData] = useState([]);

  useEffect(() => {
    fetchShippingMethod();
  }, []);

  const fetchShippingMethod = async () => {
    const response = await fetch(`${confService.host_sanbox}/shipping-methods`, {
      headers: confService.host_sanbox_headers,
    });
    const json = await (await response).json();
    setShippingData(json);
  };

  useEffect(() => {
    // console.log("escuchando cambios de products"); // TODO remove
    setValues({
      ...values,
      products,
    });
  }, [products]);

  // submit handler
  const handleForm = async (e) => {
    e.preventDefault();

    // check there are products join to order
    if (products.length === 0) {
      return alert("Debe adicionar productos");
    }

    const response = await fetch(`${confService.host_app_node}/orders`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await response.json();
    if (json.ok) {
      // console.log(json);
      props.history.push("/");
    } else {
      // console.log(json);
      return alert(json.message);
    }
  };

  return (
    <>
      <h1>Create Sell Order</h1>

      <div className="mb-3">
        <Link className="btn btn-primary" to="/">
          Back to list
        </Link>
      </div>

      <form onSubmit={handleForm}>
        <div className="row">
          <div className="form-group col-md-6 col-sm-12">
            <label htmlFor="sellerStore">Seller Store</label>
            <input
              className="form-control"
              type="text"
              name="seller_store"
              id="sellerStore"
              onChange={handleChange}
              value={seller_store}
              required
            />
          </div>
          <div className="form-group col-md-6 col-sm-12">
            <label htmlFor="shippingMethod">Shipping Method</label>
            <select
              className="form-control"
              name="shipping_method"
              id="shippingMethod"
              onChange={handleChange}
              value={shipping_method}
              required
            >
              <option value="">Select an option</option>
              {shippingData.map((option) => {
                return (
                  <option value={option.id} key={option.id}>
                    {option.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="externalOrderNumber">External Order Number</label>
          <input
            className="form-control"
            type="text"
            name="external_order_number"
            id="externalOrderNumber"
            onChange={handleChange}
            value={external_order_number}
            required
          />
        </div>
        <fieldset>
          <legend>Buyer Information</legend>
          <div className="form-group">
            <label htmlFor="buyer_fullname">Full Name</label>
            <input
              className="form-control"
              type="text"
              name="buyer_fullname"
              id="buyer_fullname"
              onChange={handleChange}
              value={buyer_fullname}
              required
            />
          </div>

          <div className="row">
            <div className="form-group col-md-6 col-sm-12">
              <label htmlFor="buyer_phone_number">Phone Number</label>
              <input
                className="form-control"
                type="tel"
                name="buyer_phone_number"
                id="buyer_phone_number"
                onChange={handleChange}
                value={buyer_phone_number}
                required
              />
            </div>

            <div className="form-group col-md-6 col-sm-12">
              <label htmlFor="buyer_email">E-mail</label>
              <input
                className="form-control"
                type="email"
                name="buyer_email"
                id="buyer_email"
                onChange={handleChange}
                value={buyer_email}
                required
              />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Shipping Information</legend>

          <div className="form-group">
            <label htmlFor="shipping_address">Address</label>
            <input
              className="form-control"
              type="text"
              name="shipping_address"
              id="shipping_address"
              onChange={handleChange}
              value={shipping_address}
              required
            />
          </div>
          <div className="row">
            <div className="form-group col-md-4 col-sm-12">
              <label htmlFor="shipping_city">City</label>
              <input
                className="form-control"
                type="text"
                name="shipping_city"
                id="shipping_city"
                onChange={handleChange}
                value={shipping_city}
                required
              />
            </div>

            <div className="form-group col-md-4 col-sm-12">
              <label htmlFor="shipping_region">Region</label>
              <input
                className="form-control"
                type="text"
                name="shipping_region"
                id="shipping_region"
                onChange={handleChange}
                value={shipping_region}
                required
              />
            </div>

            <div className="form-group col-md-4 col-sm-12">
              <label htmlFor="shipping_country">Country</label>
              <input
                className="form-control"
                type="text"
                name="shipping_country"
                id="shipping_country"
                onChange={handleChange}
                value={shipping_country}
                required
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Products Information</legend>
          <OrderProducts setProducts={setProducts} products={products} />
        </fieldset>

        <div className="buttons text-center">
          <button type="submit" className="btn btn-primary">
            Create Order
          </button>
        </div>
      </form>
    </>
  );
};

export default OrderCreate;
