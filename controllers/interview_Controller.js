//import all required packages
const Interview = require("../models/interview");
const Student = require("../models/student");
const Employee = require("../models/employee")
//list of interviews (view all interviews)
module.exports.allInterviews = async (req, res) => {
  try {
    let employee = await Employee.findById(req.user.id).
    populate("interviews");

    const interviews = employee.interviews;
    return res.render("interview", { interviews });
  } catch (err) {
    console.log(`Error in view all interviews controller ${err}`);
    return;
  }
};

//add new interview (form to create an interview )
module.exports.create = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id);
    if(employee){
      const interview = await Interview.create(req.body);
      interview.user = req.user.id;
      //add to student to employee
      employee.interviews.push(interview);
      employee.save();
      interview.save();
      req.flash("success", "Interview Added Successfully");
      return res.redirect("/interviews");
    }
  } catch (err) {
    console.log(`Error in create controller ${err}`);
    return;
  }
};

//allocate a student to an interview
module.exports.allocateStudent = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    const student = await Student.findById(req.body.studentId);
    student.interviews.push(interview);
    await student.save();
    interview.students.push(student);
    await interview.save();
    req.flash("success", "Allocated Student to Interview Successfully");
    return res.redirect("/interviews/" + req.params.interviewId);
  } catch (err) {
    console.log(`Error in allocateStudent controller ${err}`);
    return;
  }
};

//view students for a specific interview 
module.exports.interviewDetails = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId).populate("students");
    const allocatedStudents = interview.students.map(s => s._id.toString());
    const allStudents = await Student.find();
    // Students not yet allocated to this interview
    const unallocatedStudents = allStudents.filter(s => !allocatedStudents.includes(s._id.toString()));
    return res.render("interview_Details", {
      interview,
      students: unallocatedStudents,
      allocatedStudents: interview.students
    });
  } catch (err) {
    console.log(`Error in result controller ${err}`);
    return;
  }
};

// mark the result status
module.exports.markResult = async (req, res) => {
  try {
    let student = await Student.findById(req.body.studentId);
    let interview = await Interview.findById(req.params.interviewId);
    let result = req.body.result;
    interview.results.push({ student, result });
    await interview.save();
    req.flash("success", "Marked Result successfully");
    console.log("success fully marked");
    return res.redirect("back");
  } catch (err) {
    console.log(`Error in markResult controller ${err}`);
    return;
  }
};
