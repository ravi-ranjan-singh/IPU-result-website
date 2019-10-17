var os = require("os");

var Sem,
  Name,
  Batch,
  Examination,
  Institution,
  InstitutionCode,
  final = [],
  len = 0; // Globals for same set of students.
var currentSubjects = []; // Stores the names and subject codes for current set of students.
var previousResult = {};

module.exports = function(data, subjectArray, db, cb) {
  var regexForStudentsLinux = /\d{11}([^]*?)\n\w\w?\*?(\(..?\))?\n\w\w?\n/g;
  var regexForStudentsWindows = /\n\d{11}([^]*?)\n\w\w?\*?(\(..?\))?\r\n\w\w?\r/g;
  // console.log(data)
  // process.exit()
  var regexForStudents;
  if (os.platform() === "linux") {
    regexForStudents = regexForStudentsLinux;
  } else {
    regexForStudents = regexForStudentsWindows;
  }
  data.forEach(students => {
    // console.log(students)
    var studentList = students.match(regexForStudents);
    if (studentList) {
      studentList = studentList.map(ele => ele.split(os.EOL));
      // console.log(studentList)
      Sem = students.match(/Sem\.\/Year: (\d+)/)[1];
      Name = students.match(/Programme Name: ([^]*?) Sem/)[1];
      if (students.match(/Batch: ([^]*?) Exa/)) {
        Batch = students.match(/Batch: ([^]*?) Exa/)[1];
        // if (parseInt(Batch) < 2013) {
        // 	return;
        // }
      } else {
        return;
      }
      // Institution = students.match(/Institution: ([^]*?)\r/)[1];
      Institution = students.match(
        new RegExp("Institution: ([^]*?)" + os.EOL)
      )[1];
      InstitutionCode = students.match(/Institution Code: (\d+)/)[1];
      // Examination = students.match(/Examination: ([^]*?)\r\n/)[1];
      Examination = students.match(
        new RegExp("Examination: ([^]*?)" + os.EOL)
      )[1];
      if (matchSubjectList()) {
        currentSubjects = subjectArray.shift();
      }
      studentList.forEach(student => {
        console.log(student);
        if (os.platform() === "linux") {
          // student.shift();
          student.pop();
        }
        var obj = studentBlueprint();
        if (os.platform() === "linux") {
          obj.EnrollmentNumber = student.shift();
        } else {
          obj.EnrollmentNumber = student.shift().substr(1);
        }
        obj.Name = student.shift();
        obj.CreditsSecured = student.pop().match(/(\w+)/);
        try {
          obj.CreditsSecured = obj.CreditsSecured[1];
        } catch (e) {
          obj.CreditsSecured = "";
        }
        var present = false;
        // Get rid of unwanted data.
        student.shift();
        student.shift();
        while (student.length) {
          var marks = marksBlueprint();
          var id = student.shift();
          marks.Id = id.match(/\w+/)[0];
          marks.Name = getNameFromCurrentList(marks.Id);
          try {
            marks.Credits = id.match(/\((\w+)\)/)[1];
          } catch (e) {}
          if (student.length) {
            marksValue = student.shift().split(" ");
          } else {
            return;
          }
          marks.Internal = marksValue[0];
          marks.External = marksValue[1];
          var total = student.shift();
          if (!total) continue;
          marks.Total = parseInt(total.match(/\w+/)[0]);
          if (isNaN(marks.Total)) {
            marks.Total = 0;
          } else {
            present = true;
          }
          if (total.match(/\((.+)\)/)) {
            marks.Grade = total.match(/\((.+)\)/)[1];
          }
          obj.Marks.push(marks);
        }
        if (!present) {
          return;
        }
        final[len++] = obj;
      });
    }
  });
  db.collection("results").insertMany(final, { ordered: false }, function(err) {
    if (err) {
      console.error(err);
    }
    cb(final);
  });
};

var studentBlueprint = function() {
  return {
    Semester: Sem,
    Programme: Name,
    Batch: Batch,
    Examination: Examination,
    Institution: Institution,
    CollegeCode: InstitutionCode,
    EnrollmentNumber: null,
    Name: null,
    Marks: [],
    CreditsSecured: null
  };
};

var marksBlueprint = function() {
  return {
    Id: null,
    Credits: null,
    Internal: null,
    External: null,
    Total: null,
    Grade: null
  };
};

var matchSubjectList = function() {
  var currentResult = studentBlueprint();
  if (JSON.stringify(currentResult) === JSON.stringify(previousResult)) {
    return false;
  }
  previousResult = currentResult;
  return true;
};

var getNameFromCurrentList = function(id) {
  // console.log('Required', id)
  for (var i = 0; i < currentSubjects.length; i++) {
    // console.log('Current', currentSubjects[i]['_id'])
    if (currentSubjects[i]["_id"] === id) {
      return currentSubjects[i]["Name"];
    }
  }
};
