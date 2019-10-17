const express = require("express");
const path = require("path");
const resultRouter = require("./routes/resultRouter");
const globalErrorHandler = require("./Controllers/errorController");
const AppError = require("./utils/AppError");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10kb" }));

app.use("/", resultRouter);

app.all("*", (req, res, next) => {
  next(new AppError("Page Not Found", 404));
});

app.use(globalErrorHandler);

module.exports = app;
