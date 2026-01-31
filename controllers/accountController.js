const utilities = require("../utilities/");
const accountController = {};
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

/* ***************************
 *  Build login view
 * ************************** */

accountController.buildLogin = async function (req, res, next) {
    const nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
    });    
};

/* ****************************************
*  Process login request (stub)
* *************************************** */
accountController.accountLogin = async function (req, res, next) {
  req.flash("notice", "Login processing is not implemented yet.");
  res.redirect("/account/login");
};

/* ****************************************
*  Build registration view
* *************************************** */
accountController.buildRegister = async function (req, res, next) {
    const nav = await utilities.getNav();
    res.render("account/register", {
        title: "Registration",
        nav,
        errors: null,
    });
};

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function (req, res, next) {
  let nav = await utilities.getNav();

  // Destructure fields from the request body
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Send data to the model. **This one was altered in week 4 to replace it with an encrypt password**
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  }catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    const nav = await utilities.getNav()
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  // If registration is correct or not
  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`,
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}


module.exports = accountController;