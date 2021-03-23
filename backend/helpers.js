const axios = require("axios");

const host_sandbox = "https://yhua9e1l30.execute-api.us-east-1.amazonaws.com/sandbox";
const headers_sandbox = { "x-api-key": "oNhW2TBOlI1t4kWb3PEad1K1S1KxKuuI3GX6rGvT" };

const getShippingMethodRules = async (id) => {
  try {
    const url = `${host_sandbox}/shipping-methods/${id}`;
    const response = await axios(url, {
      headers: headers_sandbox,
    });
    return response.data;
  } catch (error) {
    console.log("getShippingMethodRules Error:", error);
    return false;
  }
};

const getOffDays = async () => {
  try {
    const url = `${host_sandbox}/off-days`;
    const response = await axios(url, {
      headers: headers_sandbox,
    });
    return response.data;
  } catch (error) {
    console.log("getOffDays Error:", error);
    return false;
  }
};

const calcNextBusinessDays = (offDays) => {
  let date = new Date();
  let businesDays = [];
  let month,
    day,
    fullday = null;

  do {
    date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
    month = date.getMonth() >= 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1);
    day = date.getDate() >= 9 ? date.getDate() : "0" + date.getDate();
    // set date un format YYYY-MM-DD
    fullday = [date.getFullYear(), month, day].join("-");
    if (!offDays.includes(fullday)) {
      businesDays.push(fullday);
    } else {
      console.log(`${fullday} is an off day.`);
    }
  } while (businesDays.length < 10);
  return businesDays;
};

const getCurrentDate = () => {
  // get current date
  let date = new Date();
  // get month in format MM
  let month = date.getMonth() >= 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1);
  let day = date.getDate() >= 9 ? date.getDate() : "0" + date.getDate();
  // set date un format YYYY-MM-DD
  return [date.getFullYear(), month, day].join("-");
};

const getFormatedDate = (date) => {
  // get month in format MM
  let month = date.getMonth() >= 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1);
  let day = date.getDate() >= 9 ? date.getDate() : "0" + date.getDate();
  // set date un format YYYY-MM-DD
  return [date.getFullYear(), month, day].join("-");
};

module.exports = { getShippingMethodRules, getOffDays, calcNextBusinessDays, getCurrentDate, getFormatedDate };
