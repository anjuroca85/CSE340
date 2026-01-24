// This is the controllers/invController.js;
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);

  // New guard
 if (!data || data.length === 0) {return next({status: 404, message: "No vehicles found for that classification.",});
 }

  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next){
  const inv_id = req.params.inv_id;
  // Get the specific vehicle data from the model chosen
  const data = await invModel.getInventoryByInvId(inv_id);
  // If no vehicle found, trigger 404 through your error handler
  if (!data || data.length === 0) {
    return next({ status: 404, message: "Sorry, we could not find that vehicle."});
  }

  const nav = await utilities.getNav();

   // Title must be make + model as a requirement to fetch data correctly

   const vehicle = data[0];
   const title = `${vehicle.inv_make} ${vehicle.inv_model}`;

   // Build the HTML for the detail page 
   const vehicleDetail = await utilities.buildDetailView(vehicle);

   res.render("./inventory/detail",{
    title,
    nav,
    vehicleDetail,
   });
  };

module.exports = invCont;
