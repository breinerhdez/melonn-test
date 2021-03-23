require("./config");
const express = require("express");
const app = express();
const path = require("path");

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// parse application/json
app.use(express.json());
// expose frontend application
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.use(require("./orders"));

app.listen(process.env.PORT, () => {
  console.log(`Server run on port: ${process.env.PORT}`);
});
