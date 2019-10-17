const express = require("express");
const viewController = require("./../Controllers/viewController");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.req = req;
  next();
});

router.get("/", viewController.getIntro);

router.get("/:rollNo/overall", viewController.getOverall);

router.get("/:rollNo/:semester?", viewController.getResult);

router.get(
  "/college/:collegeName/:branch/:sem/:page",
  viewController.getOverAllResult
);

router.get("/university/:branch/:sem/:page", viewController.getOverAllResult);

module.exports = router;
