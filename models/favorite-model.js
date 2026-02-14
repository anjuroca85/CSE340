
// The following is the favorit-module.js file
const pool = require("../database/");

async function addFavorite(account_id, inv_id) {
  try {
    const sql = `
      INSERT INTO favorites (account_id, inv_id)
      VALUES ($1, $2)
      ON CONFLICT (account_id, inv_id) DO NOTHING
      RETURNING favorite_id
    `;
    const result = await pool.query(sql, [account_id, inv_id]);
    return result.rows[0] || { alreadyExists: true };
  } catch (error) {
    console.error("addFavorite error:", error);
    return null;
  }
}

async function removeFavorite(account_id, inv_id) {
  try {
    const sql = `
      DELETE FROM favorites
      WHERE account_id = $1 AND inv_id = $2
      RETURNING favorite_id
    `;
    const result = await pool.query(sql, [account_id, inv_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("removeFavorite error:", error);
    return null;
  }
}

async function getFavoritesByAccountId(account_id) {
  try {
    const sql = `
      SELECT i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_thumbnail, i.inv_price
      FROM favorites f
      JOIN inventory i ON i.inv_id = f.inv_id
      WHERE f.account_id = $1
      ORDER BY f.created_at DESC
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  } catch (error) {
    console.error("getFavoritesByAccountId error:", error);
    return [];
  }
}

async function isFavorite(account_id, inv_id) {
  try {
    const sql = `
      SELECT favorite_id
      FROM favorites
      WHERE account_id = $1 AND inv_id = $2
    `;
    const result = await pool.query(sql, [account_id, inv_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("isFavorite error:", error);
    return false;
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavoritesByAccountId,
  isFavorite,
};
