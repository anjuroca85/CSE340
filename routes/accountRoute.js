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

//processing the login resquest (Temporarily)
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(async (req, res) => {
    res.status(200).send("login process");
  }),
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