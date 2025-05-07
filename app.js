//import all required packages
require("dotenv").config();
console.log('MONGO_URL:', process.env.MONGO_URL);
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("./config/mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocal = require("./config/passport_local_strategy");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const customMware = require("./config/middleware");

// Increase payload limit and add proper body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

//serving the static files with proper caching
app.use(express.static("./public", {
  maxAge: '1h',
  etag: true
}));

//set up the view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// Add basic route for testing
app.get('/test', (req, res) => {
  res.send('Server is working!');
});

//handle session cookie with more robust configuration
app.use(
  session({
    name: "placement_portal_sid",
    secret: "asjfsdhd",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
      secure: false, // set to true if using https
      httpOnly: true
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        autoRemove: "disabled",
      ttl: 24 * 60 * 60 // 1 day
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedEmployee);
app.use(flash());
app.use(customMware.setFlash);

//express routes handler
app.use("/", require("./routes"));

// Log every login POST attempt
app.post('/employees/create-session', (req, res, next) => {
  console.log('POST /employees/create-session', req.body);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Something broke!');
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('Page not found');
});

//start the server with proper error handling
if (require.main === module) {
  const server = app.listen(port, '0.0.0.0', (err) => {
    if (err) {
      console.log(`Server Error ${err}`);
      return;
    }
    console.log(`Server is running on port ${port}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', error);
  });

  // Handle process termination
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

module.exports = app;
