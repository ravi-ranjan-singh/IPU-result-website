const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    Semester: String,
    Programme: String,
    Batch: String,
    Examination: String,
    Institution: String,
    CollegeCode: String,
    EnrollmentNumber: String,
    Name: String,
    Marks: Array,
    CreditsSecured: String
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

resultSchema.virtual("aggregatePercentage").get(function() {
  let sum = 0;
  this.Marks.forEach(element => {
    sum = sum + parseInt(element.Total);
  });
  return Math.round((sum / this.Marks.length) * 100) / 100;
});

resultSchema.virtual("totalMarksObtained").get(function() {
  let sum = 0;
  this.Marks.forEach(element => {
    sum = sum + element.Total;
  });
  return sum;
});

resultSchema.virtual("totalMarks").get(function() {
  return this.Marks.length * 100;
});

resultSchema.post(/^find/, function(docs, next) {
  docs.forEach(result => {
    const Marks = result.Marks.filter(el => el.Id.length == 5);
    result.Marks = Marks;
  });
  next();
});

const Result = mongoose.model("result", resultSchema, "results");

module.exports = Result;
