const { body, validationResult } = require("express-validator");
const utilities = require(".");
const validate = {};

/* ************************
 * Classification Validation Rules
 * ************************ */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage(
        "Classification name cannot contain spaces or special characters.",
      )
      .escape(),
  ];
};

/* ******************************
 * Check classification data and return errors or continue
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name, // sticky
    });
  }
  next();
};

/* ***************************
 * Inventory Data Validation Rules
 * ************************** */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification."),

    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Please provide a vehicle make."),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Please provide a vehicle model."),

    body("inv_year")
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Please provide a valid year."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description."),

    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),

    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Please provide valid mileage."),

    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Please provide a color."),
  ]
}

/* ***************************
 * Check inventory data and return errors or continue
 * ************************** */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  let nav = await utilities.getNav()

  if (!errors.isEmpty()) {
    const classificationList = await utilities.buildClassificationList(
      req.body.classification_id
    )

    return res.render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      errors,
      classificationList,
      ...req.body, // <-- This one enables stickiness
    })
  }
  next()
}

module.exports = validate;