var fs = require("fs"),
  child_process = require("child_process"),
  subjectParser = require("./Subject-Parser"),
  MongoClient = require("mongodb").MongoClient,
  studentParser = require("./Student-Parser"),
  fileName = "sem-3";

child_process.execSync(
  `pdftotext -raw Upload/${fileName}.pdf TXT/${fileName}.txt`
);

var pdf = fs.readFileSync(`TXT/${fileName}.txt`, "utf8");

var regexForStudents = /Result of Programme Code:([^]*?)\f/g;
var regexForSubjects = /S\.No\. Paper([^]*?)RESULT TAB/g;

var students = pdf.match(regexForStudents);
var subjects = pdf.match(regexForSubjects);

MongoClient.connect(
  process.env.MONGO_URL || "mongodb://localhost/Result",
  function(err, db) {
    // Properly parse subjects and store them in MongoDB.
    if (err) {
      console.log("Crashed while connecting to db");
      console.log(err);
      process.exit();
    }
    subjectParser(subjects, db, function(subjectArray) {
      console.log("Subjects parsed.");
      // Properly parse students and store them in MongoDB.
      studentParser(students, subjectArray, db, function(final) {
        console.log("Students parsed.");
        db.close();
      });
    });
  }
);
