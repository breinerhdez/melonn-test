const express = require("express");
const app = express();
const cors = require("cors");

const { getCurrentDate, getShippingMethodRules, getOffDays, calcNextBusinessDays, getFormatedDate } = require("./helpers");

app.use(cors());

// obtener datos por defecto
var orderList = require("./data/data");

app.get("/orders", (req, res) => {
  res.json({
    ok: true,
    result: orderList,
  });
});

app.get("/orders/:id", (req, res) => {
  const order_id = req.params.id;
  const order = orderList.find((item) => item.order_number == order_id);
  res.json({
    ok: true,
    result: order,
  });
});

app.post("/orders", async (req, res) => {
  try {
    // get body request
    const order = req.body;

    let promiseInfo = {
      pack_promise_min: null,
      pack_promise_max: null,
      ship_promise_min: null,
      ship_promise_max: null,
      delivery_promise_min: null,
      delivery_promise_max: null,
      ready_pickup_promise_min: null,
      ready_pickup_promise_max: null,
    };

    // get current date
    order.creation_date = getFormatedDate(new Date());
    // set internal order number
    let date = new Date();
    order.order_number = `MSE-${date.getTime()}-${Math.floor(Math.random() * 100)}`;

    // get API information
    const shippingRules = await getShippingMethodRules(order.shipping_method);
    const offDays = await getOffDays();
    order.shipping_method_name = shippingRules.name;
    // console.log("\n\n### APIs Results\n"); // TODO remove
    // console.log("shippingRules", shippingRules); // TODO remove
    // console.log("offDays", offDays); // TODO remove

    // determine if current date is a business day
    const businessDay = !offDays.includes(order.creation_date);
    // console.log("\n\n### Business Day\n"); // TODO remove
    // console.log("Business Day", businessDay, order.creation_date); // TODO remove

    // nextBusinessDays 10 days
    const nextBusinessDays = calcNextBusinessDays(offDays);

    /**
     *  Validate based on weight availability
     */
    // console.log("\n\n### Validate based on weight availability"); // TODO remove
    // Calculate order weight
    let orderWeight = 0;
    order.products.forEach((product) => {
      orderWeight += parseFloat(product.product_weight);
    });
    // get min and max weight available
    const shippinWeightMin = shippingRules.rules.availability.byWeight.min;
    const shippinWeightMax = shippingRules.rules.availability.byWeight.max;

    if (!(orderWeight >= shippinWeightMin && orderWeight <= shippinWeightMax)) {
      console.log("Order weight is out range weight availables.", "End process.");
      return res.json({
        ok: false,
        result: promiseInfo,
        message: `Order weight validation. Order weight is ${orderWeight} and availability is between ${shippinWeightMin} and ${shippinWeightMax}.`,
      });
    }
    console.log("Order weight is OK."); // TODO

    /**
     * Validate based on request time availability
     */
    // console.log("\n\n### Validate based on request time availability"); // TODO remove
    const shippingReqTimeDayType = shippingRules.rules.availability.byRequestTime.dayType;
    if (shippingReqTimeDayType === "BUSINESS") {
      if (!businessDay) {
        console.log(`Order type day is ${shippingReqTimeDayType} but current date is an off day.`, "End process.");
        return res.json({
          ok: false,
          result: promiseInfo,
          message: `Order type day validation. Type day is ${shippingReqTimeDayType} and current date is an off day.`,
        });
      }
    }

    // console.log("Order type day is OK."); // TODO

    /**
     * Validate time of date
     */
    const shippingReqTimeFromTime = shippingRules.rules.availability.byRequestTime.fromTimeOfDay;
    const shippingReqTimeToTime = shippingRules.rules.availability.byRequestTime.toTimeOfDay;

    if (!(date.getHours() >= shippingReqTimeFromTime && date.getHours() <= shippingReqTimeToTime)) {
      console.log("Order time date is out range time availables.", "End process.");
      return res.json({
        ok: false,
        result: promiseInfo,
        message: `Order time date validation. Order time date is ${date.getHours()} and availability is between ${shippingReqTimeFromTime} and ${shippingReqTimeToTime}.`,
      });
    }
    // console.log(shippingReqTimeFromTime, `-- ${date.getHours()} --`, shippingReqTimeToTime); // TODO
    // console.log("Order date time is OK."); // TODO

    /**
     * Calculate promises
     */
    // console.log("\n\n### Calculate promises"); // TODO remove
    // get list of cases
    const cases = shippingRules.rules.promisesParameters.cases;
    let priority = 1;
    let workingCase = {};

    for (let i = 0; i < cases.length; i++) {
      let caseRules = cases.find((item) => item.priority == priority);
      if (!caseRules) {
        console.log("This shoud never happen", "End process.");
        return res.json({
          ok: false,
          result: promiseInfo,
          message: `Case validation does not exists.`,
        });
      }
      // console.log("Case exists, and continue...", caseRules); // TODO

      // get case conditions
      let dayType = caseRules.condition.byRequestTime.dayType;
      let fromTimeOfDay = caseRules.condition.byRequestTime.fromTimeOfDay;
      let toTimeOfDay = caseRules.condition.byRequestTime.toTimeOfDay;

      // validate dayType
      if (dayType == "BUSINESS") {
        if (!businessDay) {
          // call next case
          priority++;
          continue;
        }
      }
      // console.log("Case dayType validation OK"); // TODO

      // validate time of day
      if (!(date.getHours() >= fromTimeOfDay && date.getHours() <= toTimeOfDay)) {
        console.log("Time validation NOK, calling next case");
        priority++;
        continue;
      }
      // console.log("Case time of day validation OK"); // TODO

      // set working case
      workingCase = caseRules;
      break;
    }

    // working case
    // console.log("workingCase", workingCase);

    /***************************************************************
     * Calculate PACK PROMISE
     */
    let minType = workingCase.packPromise.min.type;
    let minDeltaHours = workingCase.packPromise.min.deltaHours;
    let minDeltaBusinessDays = workingCase.packPromise.min.deltaBusinessDays || 1;
    let minTimeOfDay = workingCase.packPromise.min.timeOfDay || 14;
    let maxType = workingCase.packPromise.max.type;
    let maxDeltaHours = workingCase.packPromise.max.deltaHours;
    let maxDeltaBusinessDays = workingCase.packPromise.max.deltaBusinessDays;
    let maxTimeOfDay = workingCase.packPromise.max.timeOfDay;

    /**
     * Pack Promise MIN
     */
    if (minType == "NULL") {
      promiseInfo.pack_promise_min = "NULL";
    } else if (minType == "DELTA-HOURS") {
      promiseInfo.pack_promise_min = new Date(date.getTime() + minDeltaHours * 60 * 60 * 1000);
    } else if (minType == "DELTA-BUSINESSDAYS") {
      let tmpDate = nextBusinessDays[minDeltaBusinessDays - 1];
      let tmpTime = minTimeOfDay;
      let newDate = new Date(`${tmpDate} ${tmpTime}:00:00`);
      promiseInfo.pack_promise_min = newDate;
    }

    /**
     * Pack Promise MAX
     */
    if (maxType == "NULL") {
      promiseInfo.pack_promise_max = "NULL";
    } else if (maxType == "DELTA-HOURS") {
      promiseInfo.pack_promise_max = new Date(date.getTime() + maxDeltaHours * 60 * 60 * 1000);
    } else if (maxType == "DELTA-BUSINESSDAYS") {
      let tmpDate = nextBusinessDays[maxDeltaBusinessDays - 1];
      let tmpTime = maxTimeOfDay;
      let newDate = new Date(`${tmpDate} ${tmpTime}:00:00`);
      promiseInfo.pack_promise_max = newDate;
    }

    /***************************************************************
     * Calculate SHIP PROMISE
     */
    minType = workingCase.shipPromise.min.type;
    minDeltaHours = workingCase.shipPromise.min.deltaHours;
    minDeltaBusinessDays = workingCase.shipPromise.min.deltaBusinessDays || 1;
    minTimeOfDay = workingCase.shipPromise.min.timeOfDay || 14;
    maxType = workingCase.shipPromise.max.type;
    maxDeltaHours = workingCase.shipPromise.max.deltaHours;
    maxDeltaBusinessDays = workingCase.shipPromise.max.deltaBusinessDays;
    maxTimeOfDay = workingCase.shipPromise.max.timeOfDay;

    /**
     * SHIP Promise MIN
     */
    if (minType == "NULL") {
      promiseInfo.ship_promise_min = "NULL";
    } else if (minType == "DELTA-HOURS") {
      promiseInfo.ship_promise_min = new Date(date.getTime() + minDeltaHours * 60 * 60 * 1000);
    } else if (minType == "DELTA-BUSINESSDAYS") {
      let tmpDate = nextBusinessDays[minDeltaBusinessDays - 1];
      let tmpTime = minTimeOfDay;
      let newDate = new Date(`${tmpDate} ${tmpTime}:00:00`);
      promiseInfo.ship_promise_min = newDate;
    }

    /**
     * SHIP Promise MAX
     */
    if (maxType == "NULL") {
      promiseInfo.ship_promise_max = "NULL";
    } else if (maxType == "DELTA-HOURS") {
      promiseInfo.ship_promise_max = new Date(date.getTime() + maxDeltaHours * 60 * 60 * 1000);
    } else if (maxType == "DELTA-BUSINESSDAYS") {
      let tmpDate = nextBusinessDays[maxDeltaBusinessDays - 1];
      let tmpTime = maxTimeOfDay;
      let newDate = new Date(`${tmpDate} ${tmpTime}:00:00`);
      promiseInfo.ship_promise_max = newDate;
    }

    /***************************************************************
     * Calculate DELIVERY PROMISE
     */
    minType = workingCase.deliveryPromise.min.type;
    minDeltaHours = workingCase.deliveryPromise.min.deltaHours;
    minDeltaBusinessDays = workingCase.deliveryPromise.min.deltaBusinessDays || 1;
    minTimeOfDay = workingCase.deliveryPromise.min.timeOfDay || 14;
    maxType = workingCase.deliveryPromise.max.type;
    maxDeltaHours = workingCase.deliveryPromise.max.deltaHours;
    maxDeltaBusinessDays = workingCase.deliveryPromise.max.deltaBusinessDays;
    maxTimeOfDay = workingCase.deliveryPromise.max.timeOfDay;

    /**
     * DELIVERY Promise MIN
     */
    if (minType == "NULL") {
      promiseInfo.delivery_promise_min = "NULL";
    } else if (minType == "DELTA-HOURS") {
      promiseInfo.delivery_promise_min = new Date(date.getTime() + minDeltaHours * 60 * 60 * 1000);
    } else if (minType == "DELTA-BUSINESSDAYS") {
      let tmpDate = nextBusinessDays[minDeltaBusinessDays - 1];
      let tmpTime = minTimeOfDay;
      let newDate = new Date(`${tmpDate} ${tmpTime}:00:00`);
      promiseInfo.delivery_promise_min = newDate;
    }

    /**
     * DELIVERY Promise MAX
     */
    if (maxType == "NULL") {
      promiseInfo.delivery_promise_max = "NULL";
    } else if (maxType == "DELTA-HOURS") {
      promiseInfo.delivery_promise_max = new Date(date.getTime() + maxDeltaHours * 60 * 60 * 1000);
    } else if (maxType == "DELTA-BUSINESSDAYS") {
      let tmpDate = nextBusinessDays[maxDeltaBusinessDays - 1];
      let tmpTime = maxTimeOfDay;
      let newDate = new Date(`${tmpDate} ${tmpTime}:00:00`);
      promiseInfo.delivery_promise_max = newDate;
    }

    /***************************************************************
     * Calculate PICK UP PROMISE
     */
    minType = workingCase.readyPickUpPromise.min.type;
    minDeltaHours = workingCase.readyPickUpPromise.min.deltaHours;
    minDeltaBusinessDays = workingCase.readyPickUpPromise.min.deltaBusinessDays || 1;
    minTimeOfDay = workingCase.readyPickUpPromise.min.timeOfDay || 14;
    maxType = workingCase.readyPickUpPromise.max.type;
    maxDeltaHours = workingCase.readyPickUpPromise.max.deltaHours;
    maxDeltaBusinessDays = workingCase.readyPickUpPromise.max.deltaBusinessDays;
    maxTimeOfDay = workingCase.readyPickUpPromise.max.timeOfDay;

    /**
     * PICK UP Promise MIN
     */
    if (minType == "NULL") {
      promiseInfo.ready_pickup_promise_min = "NULL";
    } else if (minType == "DELTA-HOURS") {
      promiseInfo.ready_pickup_promise_min = new Date(date.getTime() + minDeltaHours * 60 * 60 * 1000);
    } else if (minType == "DELTA-BUSINESSDAYS") {
      let tmpDate = nextBusinessDays[minDeltaBusinessDays - 1];
      let tmpTime = minTimeOfDay;
      let newDate = new Date(`${tmpDate} ${tmpTime}:00:00`);
      promiseInfo.ready_pickup_promise_min = newDate;
    }

    /**
     * PICK UP Promise MAX
     */
    if (maxType == "NULL") {
      promiseInfo.ready_pickup_promise_max = "NULL";
    } else if (maxType == "DELTA-HOURS") {
      promiseInfo.ready_pickup_promise_max = new Date(date.getTime() + maxDeltaHours * 60 * 60 * 1000);
    } else if (maxType == "DELTA-BUSINESSDAYS") {
      let tmpDate = nextBusinessDays[maxDeltaBusinessDays - 1];
      let tmpTime = maxTimeOfDay;
      let newDate = new Date(`${tmpDate} ${tmpTime}:00:00`);
      promiseInfo.ready_pickup_promise_max = newDate;
    }

    // set promise information
    order.promise_order = promiseInfo;

    // add order to order list
    orderList.push(order);
    res.json({ ok: true, result: order });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

module.exports = app;
