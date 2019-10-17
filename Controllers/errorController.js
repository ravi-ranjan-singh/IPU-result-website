module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";
  err.message = `${err.statusCode}`.startsWith("4")
    ? err.message
    : "Something Went Very Wrong";
  res.status(err.statusCode).render("error", {
    error: err
  });
};
