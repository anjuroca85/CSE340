const { body, validationResult } = require("express-validator");
const utilities = require(".");
const validate = {};
const accountModel = require("../models/account-model");

/* ************************
 * Registration Data Validation Rules
 * ************************ */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .notEmpty()
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
        throw new Error("Email exists. Please log in or use different email")
        }
    }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address."),

    body("account_password")
      .trim()
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters.")
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$/,
      )
      .withMessage("Password does not meet complexity requirements."),
  ];
};

validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/login", {
      title: "Login",
      nav,
      errors,
      account_email, // sticky email only
    });
  }
  next();
};

validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* ************************
 * Account Update Validation Rules
 * ************************ */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        // Only block if the email belongs to someone else.
        const account_id = parseInt(req.body.account_id, 10)
        if (Number.isNaN(account_id)) throw new Error("Invalid account id.")

        const current = await accountModel.getAccountById(account_id)
        if (!current) throw new Error("Account not found.")

        // If the email didn't change, allow it.
        const currentEmail = String(current.account_email).toLowerCase();
        const incomingEmail = String(account_email).toLowerCase();
        if (currentEmail === incomingEmail) return true;

        // If it changed, make sure it's not already used.
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please use a different email.")
        }
        return true
      }),
  ]
}

validate.checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    // Re-render update view with stickiness
    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
      account_id: req.body.account_id,
    })
  }
  next()
}

/* ************************
 * Password Update Validation Rules
 * ************************ */
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),

    body("account_id")
      .notEmpty()
      .withMessage("Missing account id.")
      .bail()
      .isInt()
      .withMessage("Invalid account id."),
  ]
}

validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()

    // To keep the view sticky, we should reload account data (since password form doesn't send names/email)
    const account_id = parseInt(req.body.account_id, 10)
    const accountData = Number.isNaN(account_id)
      ? null
      : await accountModel.getAccountById(account_id)

    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors,
      account_firstname: accountData?.account_firstname || "",
      account_lastname: accountData?.account_lastname || "",
      account_email: accountData?.account_email || "",
      account_id: req.body.account_id,
    })
  }
  next()
}

module.exports = validate;
