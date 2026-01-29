//this is the routes/accountRoute.js file

// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// Route to build login view
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
);

//processing the loging resquest (Temporarily)
router.post(
    "/login",
    utilities.handleErrors(accountController.accountLogin)
);

//route to build registration view
router.get(
    "/register",
    utilities.handleErrors(accountController.buildRegister)
);

//process the registration request
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

module.exports = router;