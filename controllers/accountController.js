const utilities = require("../utilities/");
const accountController = {};
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
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

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    const passwordsMatch = await bcrypt.compare(
      account_password,
      accountData.account_password
    )

    if (passwordsMatch) {
      delete accountData.account_password

      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 } // seconds (1 hour)
      )

      const cookieOptions =
        process.env.NODE_ENV === "development"
          ? { httpOnly: true, maxAge: 3600 * 1000 }
          : { httpOnly: true, secure: true, maxAge: 3600 * 1000 }

      res.cookie("jwt", accessToken, cookieOptions)
      return res.redirect("/account/")
    }

    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

accountController.buildAccountManagement = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
  });
};

/* ****************************************
 *  Process logout
 * ************************************ */
accountController.accountLogout = async function (req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

/* ****************************************
 *  Build account update view
 * ************************************ */
accountController.buildUpdateAccount = async function (req, res, next) {
  const nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id, 10)

  if (Number.isNaN(account_id)) {
    req.flash("notice", "Invalid account id.")
    return res.redirect("/account/")
  }

  // Optional safety: only allow user to edit themself (unless Admin)
  const loggedInId = Number(res.locals.accountData?.account_id)
  const accountType = res.locals.accountData?.account_type

  if (loggedInId !== account_id && accountType !== "Admin") {
    req.flash("notice", "You are not authorized to update that account.")
    return res.redirect("/account/")
  }

  const accountData = await accountModel.getAccountById(account_id)

  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/")
  }

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  });
}

/* ****************************************
 *  Process account update
 * ************************************ */
accountController.updateAccount = async function (req, res, next) {
  const nav = await utilities.getNav()

  const account_id = parseInt(req.body.account_id, 10)
  if (Number.isNaN(account_id)) {
    req.flash("notice", "Invalid account id.")
    return res.redirect("/account/")
  }

  // Only allow user to update themself (unless Admin)
  const loggedInId = Number(res.locals.accountData?.account_id)
  const accountType = res.locals.accountData?.account_type
  if (loggedInId !== account_id && accountType !== "Admin") {
    req.flash("notice", "You are not authorized to update that account.")
    return res.redirect("/account/")
  }

  const { account_firstname, account_lastname, account_email } = req.body

  try {
    const updateResult = await accountModel.updateAccountInfo({
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })

    if (!updateResult) {
      req.flash("notice", "Sorry, the account update failed.")
      return res.status(500).render("account/update-account", {
        title: "Update Account",
        nav,
        errors: null,
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      })
    }

    req.flash("notice", "Account information updated successfully.")

    const freshAccount = await accountModel.getAccountById(account_id)
    const tokenPayload = {
      ...res.locals.accountData,
      account_firstname: freshAccount.account_firstname,
      account_lastname: freshAccount.account_lastname,
      account_email: freshAccount.account_email,
    }
    const accessToken = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
    const cookieOptions =
      process.env.NODE_ENV === "development"
        ? { httpOnly: true, maxAge: 3600 * 1000 }
        : { httpOnly: true, secure: true, maxAge: 3600 * 1000 }
    res.cookie("jwt", accessToken, cookieOptions)

    return res.redirect("/account/")
  } catch (error) {
    return next(error)
  }
}

/* ****************************************
 *  Process password change
 * ************************************ */
accountController.updatePassword = async function (req, res, next) {
  const nav = await utilities.getNav()

  const account_id = parseInt(req.body.account_id, 10)
  if (Number.isNaN(account_id)) {
    req.flash("notice", "Invalid account id.")
    return res.redirect("/account/")
  }

  // Only allow user to update themself (unless Admin)
  const loggedInId = Number(res.locals.accountData?.account_id)
  const accountType = res.locals.accountData?.account_type
  if (loggedInId !== account_id && accountType !== "Admin") {
    req.flash("notice", "You are not authorized to update that account.")
    return res.redirect("/account/")
  }

  const { account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const result = await accountModel.updatePassword(account_id, hashedPassword)

    if (!result) {
      req.flash("notice", "Sorry, the password update failed.")
      // re-render view with account info
      const accountData = await accountModel.getAccountById(account_id)
      return res.status(500).render("account/update-account", {
        title: "Update Account",
        nav,
        errors: null,
        ...accountData,
      })
    }

    req.flash("notice", "Password updated successfully.")
    return res.redirect("/account/")
  } catch (error) {
    return next(error)
  }
}


module.exports = accountController;