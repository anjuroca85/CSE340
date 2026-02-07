/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
// Inventory routes
const inventoryRoute = require("./routes/inventoryRoute");//This seems to have been missed by the course training
const utilities = require("./utilities");
// The following were installed in week 4. pnpm add express-session connect-pg-simple express-messages connect-flash
const session = require("express-session");
const pool = require('./database/');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")

//mounting point route for account
const accountRoute = require("./routes/accountRoute");

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(cookieParser());
app.use(utilities.checkJWTToken);


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());


/* ***********************
 * Routes
 *************************/
app.use(static);
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));
// Inventory routes
app.use("/inv", inventoryRoute);

// used in the account route
app.use("/account", accountRoute)

//trigger error controller route
app.get("/error", utilities.handleErrors(baseController.triggerError));

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  const message = err.status == 404 ? err.message: "Oh no! There was a crash. Maybe try a different route?";

  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})


//The following is for troubleshooting.
// app.use(async (err, req, res, next) => {
//   let nav = await utilities.getNav();
//   console.error(`Error at: "${req.originalUrl}": ${err.message}`);

//   const message =
//     process.env.NODE_ENV === "development"
//       ? err.message
//       : err.status == 404
//         ? err.message
//         : "Oh no! There was a crash. Maybe try a different route?";

//   res.status(err.status || 500).render("errors/error", {
//     title: err.status || "Server Error",
//     message,
//     nav,
//   });
// });


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
