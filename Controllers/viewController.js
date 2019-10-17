const Result = require("./../Models/resultModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");

exports.getIntro = (req, res) => {
  res.status(200).render("intro");
};

exports.getOverall = catchAsync(async (req, res, next) => {
  const results = await Result.find({
    EnrollmentNumber: req.params.rollNo
  });
  res.status(200).render("overall", { results });
});

exports.getResult = catchAsync(async (req, res) => {
  const results = await Result.find({
    EnrollmentNumber: req.params.rollNo
  });

  const semesters = Array.from(
    Array(Math.max(...results.map(o => parseInt(o.Semester)), 1)).keys()
  );
  if (results.length === 0)
    new AppError("No result found for that enrollment No");
  const result = results.find(
    el => el.Semester === `0${req.params.semester || semesters.length}`
  );
  if (!result) new AppError("No result found for that semester");
  res.status(200).render("resultPage", {
    result,
    semesters
  });
});

exports.getOverAllResult = catchAsync(async (req, res) => {
  const page = req.params.page * 1 || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  let searchObj = {
    Examination: { $regex: "^REGULAR", $options: "i" },
    Semester: `0${req.params.sem}`,
    Programme: `BACHELOR OF TECHNOLOGY (${req.params.branch.toUpperCase()})`
  };
  if (req.originalUrl.startsWith("/college"))
    searchObj.Institution = req.params.collegeName.toUpperCase();

  let overallResult = await Result.find(searchObj);

  overallResult.sort(function(a, b) {
    return b.aggregatePercentage - a.aggregatePercentage;
  });

  overallResult = overallResult.slice(skip, skip + limit);

  let url;
  if (page > 9) url = req.originalUrl.substr(0, req.originalUrl.length - 2);
  else url = req.originalUrl.substr(0, req.originalUrl.length - 1);

  res.status(200).render("rank", {
    Results: overallResult,
    page,
    url
  });
});
