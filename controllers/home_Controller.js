//import all required packages
module.exports.home = async (req, res) => {
  try {
    
    return res.render("home", {
      title: "Recruitment Portal",
    });
  } catch (err) {
    console.log(`error in home controller ${err}`);
    return;
  }
};

// rendering profile ejs 
module.exports.profile = async (req, res) => {
  try {
    return res.render("profile", {
      title: "Recruitment Portal",
    });
  } catch (err) {
    console.log(`error in home controller ${err}`);
    return;
  }
};
// rendering download ejs 
module.exports.download = async (req, res) => {
  try {
    const BASE_URL = process.env.BASE_URL;
    return res.render("download", {
      title: "Recruitment Portal",
      BASE_URL
    });
  } catch (err) {
    console.log(`error in home controller ${err}`);
    return;
  }
};
