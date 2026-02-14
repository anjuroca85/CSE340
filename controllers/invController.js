// This is the controllers/invController.js;
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const invCont = {};
const favModel = require("../models/favorite-model");

/* ***************************
 *  Add new classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  const { classification_name }= req.body
  const addResult = await invModel.addClassification(classification_name)

  if (addResult){
    req.flash("notice", `Success! "${classification_name}" was added.`);

    const newNav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()

    return res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav: newNav,
      classificationSelect,
    })
  }

  req.flash("notice", "Sorry, the classification could not be added.")
  return res.status(500).render("inventory/add-classification", {
    title: "Add classification",
    nav,
    errors: null,
    classification_name, 
  })
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    errors: null,
  });
};

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory Item",
    nav,
    classificationList,
    errors: null,
  })
}

/* ***************************
 *  Add new inventory item
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const nav = await utilities.getNav()

  const result = await invModel.addInventoryItem(req.body)

  if (result) {
  req.flash("notice", "Inventory item added successfully.")

  const newNav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList();

  res.render("inventory/management", {
    title: "Inventory Management",
    nav: newNav,
    classificationSelect,
  });

  } else {
    req.flash("notice", "Sorry, the inventory item could not be added.");
    const classificationList = await utilities.buildClassificationList(
      req.body.classification_id,
    );

    res.render("inventory/add-inventory", {
      title: "Add Inventory Item",
      nav,
      classificationList,
      errors: null,
      ...req.body, // This one enables stickiness
    });

  }
}

/* ***************************
 *  Update Inventory Item
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const nav = await utilities.getNav()

  // Always keep inv_id as an integer for safety
  const inv_id = parseInt(req.body.inv_id, 10)
  if (Number.isNaN(inv_id)) {
    return next({ status: 400, message: "Invalid inventory id." })
  }

  // Build the object we send to the model
  const updateData = {
    ...req.body,
    inv_id,
  }

  const updateResult = await invModel.updateInventoryItem(updateData)

  if (updateResult) {
    req.flash("notice", "Inventory item updated successfully.")

    // If you want to return to management after update (common for this course):
    const classificationSelect = await utilities.buildClassificationList()
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null,
    })

    // Alternative (also OK): redirect to the detail page
    // return res.redirect(`/inv/detail/${inv_id}`)
  }

  // FAILED update → rebuild dropdown and re-render edit view with stickiness
  req.flash("notice", "Sorry, the update failed.")

  const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  )

  return res.status(500).render("inventory/edit-inventory", {
    title: `Edit ${req.body.inv_make || ""} ${req.body.inv_model || ""}`.trim(),
    nav,
    classificationList,
    errors: null,
    ...req.body, // sticky values back into the form
    inv_id,      // ensure inv_id is present for the hidden field
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

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
invCont.buildDetailView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id, 10);

  if (Number.isNaN(inv_id)) {
    return next({ status: 400, message: "Invalid inventory id." });
  }

  const vehicle = await invModel.getInventoryByInvId(inv_id); // object

  if (!vehicle) {
    return next({
      status: 404,
      message: "Sorry, we could not find that vehicle.",
    });
  }

  const nav = await utilities.getNav();
  const title = `${vehicle.inv_make} ${vehicle.inv_model}`;
  const vehicleDetail = await utilities.buildDetailView(vehicle);

  let isFavorite = false;
  if (res.locals.loggedin) {
    const account_id = Number(res.locals.accountData.account_id);
    isFavorite = await favModel.isFavorite(account_id, inv_id);
  }

  res.render("./inventory/detail", {
    title,
    nav,
    vehicleDetail,
    vehicle,
    isFavorite
  });
};


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id, 10);

  //The following is a basic guard in case the param is missing or it is invalid
  if (Number.isNaN(classification_id)) {
    return next({ status: 400, message: "Invalid classification id." });
  }

  const invData =
    await invModel.getInventoryByClassificationId(classification_id);

  // Your model returns an array (rows). Make sure it has data.
  if (invData && invData.length > 0) {
    return res.json(invData);
  }

  return next({
    status: 404,
    message: "No inventory found for that classification.",
  });
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const inv_id = parseInt(req.params.inv_id, 10)

  if (Number.isNaN(inv_id)) {
    return next({ status: 400, message: "Invalid inventory id." })
  }

  // Model now returns a single object (rows[0])
  const itemData = await invModel.getInventoryByInvId(inv_id)

  if (!itemData) {
    return next({ status: 404, message: "Sorry, we could not find that vehicle." })
  }

  // Pre-select the item’s classification in the dropdown
  const classificationList = await utilities.buildClassificationList(
    itemData.classification_id
  )

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/edit-inventory", {
    title: `Edit ${itemName}`,
    nav,
    classificationList,
    errors: null,
    ...itemData, // makes fields available for stickiness in the view
  })
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteView = async function (req, res, next) {
  const nav = await utilities.getNav()
  const inv_id = parseInt(req.params.inv_id, 10)

  if (Number.isNaN(inv_id)) {
    return next({ status: 400, message: "Invalid inventory id." })
  }

  const itemData = await invModel.getInventoryByInvId(inv_id) // This one is to return rows[0]

  if (!itemData) {
    return next({ status: 404, message: "Sorry, we could not find that vehicle." })
  }

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/delete-confirm", {
    title: `Delete ${itemName}`,
    nav,
    errors: null,
    ...itemData,
  })
}

/* ***************************
 *  Process delete inventory item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const { inv_id } = req.body
  const id = parseInt(inv_id, 10)

  if (Number.isNaN(id)) {
    req.flash("notice", "Invalid inventory id.")
    return res.redirect("/account/")
  }

  const deleteResult = await invModel.deleteInventoryItem(id)

  if (deleteResult) {
    req.flash("notice", "Inventory item deleted successfully.")
    return res.redirect("/account/")
  }

  req.flash("notice", "Sorry, the delete failed.")
  return res.redirect(`/inv/delete/${id}`)
}

module.exports = invCont;
