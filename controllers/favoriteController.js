// favoriteController.js file
const utilities = require("../utilities/");
const favModel = require("../models/favorite-model");

const favController = {};

/* ***************************
 * Build favorites view
 * ************************** */
favController.buildFavorites = async function (req, res, next) {
  const nav = await utilities.getNav();

  const account_id = Number(res.locals.accountData?.account_id);
  if (!account_id) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }

  const favorites = await favModel.getFavoritesByAccountId(account_id);

  res.render("account/favorites", {
    title: "My Favorites",
    nav,
    errors: null,
    favorites,
  });
};

/* ***************************
 * Add favorite
 * ************************** */
favController.addFavorite = async function (req, res, next) {
  const account_id = Number(res.locals.accountData?.account_id);
  const inv_id = parseInt(req.body.inv_id, 10);

  if (!account_id) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
  if (Number.isNaN(inv_id)) {
    req.flash("notice", "Invalid vehicle id.");
    return res.redirect("/");
  }

  const result = await favModel.addFavorite(account_id, inv_id);

  if (!result) {
    req.flash("notice", "Sorry, we could not save that favorite.");
  } else if (result.alreadyExists) {
    req.flash("notice", "That vehicle is already in your favorites.");
  } else {
    req.flash("notice", "Saved to favorites.");
  }

  // nice UX to go back to vehicle detail
  return res.redirect(`/inv/detail/${inv_id}`);
};

/* ***************************
 * Remove favorite
 * ************************** */
favController.removeFavorite = async function (req, res, next) {
  const account_id = Number(res.locals.accountData?.account_id);
  const inv_id = parseInt(req.body.inv_id, 10);

  if (!account_id) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
  if (Number.isNaN(inv_id)) {
    req.flash("notice", "Invalid vehicle id.");
    return res.redirect("/account/favorites");
  }

  const result = await favModel.removeFavorite(account_id, inv_id);

  if (!result) req.flash("notice", "Favorite not found (or already removed).");
  else req.flash("notice", "Removed from favorites.");

  return res.redirect("/account/favorites");
};

module.exports = favController;
