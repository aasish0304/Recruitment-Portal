//import required packages
const Student = require("../models/student");
const csv = require("fast-csv");
const fs = require("fs");
const Employee = require("../models/employee");
//list the all students (view all students)
module.exports.allStudents = async (req, res) => {
  try {
    let employee = await Employee.findById(req.user.id).
    populate("students");

    const students = employee.students;
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
    return res.render("student", { students , BASE_URL });
  } catch (err) {
    console.log(`Error in view all students controller ${err}`);
    return;
  }
};

//Add new student (from to create a student )
module.exports.create = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id);
    if(employee){
      const student = await Student.create(req.body);
      student.user = req.user.id;
      //add to student to employee
      employee.students.push(student);
      employee.save();
      student.save();
      req.flash("success", "Student Added Successfully");
      return res.redirect("/students");
    }
  } catch (err) {
    console.log(`Error in create student controller ${err}`);
    req.flash("success", "Please Fill Correct Fields");
    return res.redirect("back");
  }
};

//Download a complete CSV of all the data of students
module.exports.downloadCSV = async (req, res) => {
  try {
    let students = await Student.find().populate("interviews");
    const csvStream = csv.format({ headers: true });

    if (!fs.existsSync("public/files/export")) {
      if (!fs.existsSync("public/files")) {
        fs.mkdirSync("public/files/");
      }
      if (!fs.existsSync("public/files/export/")) {
        fs.mkdirSync("./public/files/export/");
      }
    }

    const filePath = "public/files/export/students.csv";
    const writeableStream = fs.createWriteStream(filePath);

    csvStream.pipe(writeableStream);

    if (students.length > 0) {
      students.forEach((student) => {
        // Write student data even if they have no interviews
        csvStream.write({
          Student_id: student._id ? student._id : "-",
          Student_Name: student.name ? student.name : "-",
          Student_Batch: student.batch ? student.batch : "-",
          Student_College: student.college ? student.college : "-",
          Student_Status: student.status ? student.status : "-",
          Student_DSAFinalScore: student.DSAFinalScore ? student.DSAFinalScore : "-",
          Student_WebDFinalScore: student.WebDFinalScore ? student.WebDFinalScore : "-",
          Student_ReactFinalScore: student.ReactFinalScore ? student.ReactFinalScore : "-",
          Interview_Date: "-",
          Interview_Company: "-",
          Interview_Result: "-"
        });

        // If student has interviews, write each interview
        if (student.interviews && student.interviews.length > 0) {
          student.interviews.forEach((interview) => {
            if (interview.results && interview.results.length > 0) {
              interview.results.forEach((result) => {
                csvStream.write({
                  Student_id: student._id ? student._id : "-",
                  Student_Name: student.name ? student.name : "-",
                  Student_Batch: student.batch ? student.batch : "-",
                  Student_College: student.college ? student.college : "-",
                  Student_Status: student.status ? student.status : "-",
                  Student_DSAFinalScore: student.DSAFinalScore ? student.DSAFinalScore : "-",
                  Student_WebDFinalScore: student.WebDFinalScore ? student.WebDFinalScore : "-",
                  Student_ReactFinalScore: student.ReactFinalScore ? student.ReactFinalScore : "-",
                  Interview_Date: interview.date ? interview.date : "-",
                  Interview_Company: interview.companyName ? interview.companyName : "-",
                  Interview_Result: result.result ? result.result : "-"
                });
              });
            }
          });
        }
      });
    }

    csvStream.end();
    writeableStream.on("finish", function () {
      res.download(filePath, "students.csv");
    });
  } catch (err) {
    console.log(`error in download CSV controller ${err}`);
    return res.status(500).json({ error: "Error generating CSV" });
  }
};
