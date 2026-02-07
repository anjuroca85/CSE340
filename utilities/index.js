
const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  //console.log(data);
  let list = "<ul class='main-nav'>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid = ""
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ************************
 * Build classification dropdown list
 * ************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* **************************************
 * Build the inventory detail view HTML
 * ************************************ */
Util.buildDetailView = async function (vehicle) {
  let detail = "";

  detail += `<section class="vehicle-detail"> <h2 class="visually-hidden">
            Vehicle details for ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}
            </h2>`;

  detail += `
    <div class="vehicle-detail__image">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
    </div>
  `;

  detail += `
    <div class="vehicle-detail__info">
      <p class="vehicle-detail__title">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</p>
      <p class="vehicle-detail__price">$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</p>
      <p class="vehicle-detail__miles"><strong>Mileage:</strong> ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)} miles</p>
      <p class="vehicle-detail__color"><strong>Color:</strong> ${vehicle.inv_color || "N/A"}</p>
      <p class="vehicle-detail__description"><strong>Description:</strong> ${vehicle.inv_description}</p>
    </div>
  `;

  detail += `</section>`;

  return detail;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
 * Middleware to check token validity
 * *************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      (err, accountData) => {
        if (err) {
          req.flash("notice", "Please log in.")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    return next()
  }
  req.flash("notice", "Please log in.")
  return res.redirect("/account/login")
}
/* ****************************************
 *  Check Account Type (Authorization)
 *  Only allow Employee or Admin
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  // must be logged in first
  if (!res.locals.loggedin || !res.locals.accountData) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }

  const type = res.locals.accountData.account_type
  if (type === "Employee" || type === "Admin") {
    return next()
  }

  req.flash("notice", "You are not authorized to access that area.")
  return res.redirect("/account/")
}

module.exports = Util;