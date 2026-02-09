//This is the models/inventory-model.js

const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name",
  );
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]
  } catch (error) {
    console.error("addClassification error:", error)
    return null
  }
}

/* ***************************
 *  Add new inventory item
 * ************************** */
async function addInventoryItem(data) {
  try {
    const sql = `
      INSERT INTO inventory (
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
      ) RETURNING *
    `
    const result = await pool.query(sql, [
      data.inv_make,
      data.inv_model,
      data.inv_year,
      data.inv_description,
      data.inv_image,
      data.inv_thumbnail,
      data.inv_price,
      data.inv_miles,
      data.inv_color,
      data.classification_id,
    ])
    return result.rows[0]
  } catch (error) {
    console.error("addInventoryItem error:", error)
    return null
  }
}

/* ***************************
 *  Update inventory item
 * ************************** */
async function updateInventoryItem(data) {
  try {
    const sql = `
      UPDATE public.inventory
      SET
        inv_make = $1,
        inv_model = $2,
        inv_year = $3,
        inv_description = $4,
        inv_image = $5,
        inv_thumbnail = $6,
        inv_price = $7,
        inv_miles = $8,
        inv_color = $9,
        classification_id = $10
      WHERE inv_id = $11
      RETURNING *
    `

    const result = await pool.query(sql, [
      data.inv_make,
      data.inv_model,
      data.inv_year,
      data.inv_description,
      data.inv_image,
      data.inv_thumbnail,
      data.inv_price,
      data.inv_miles,
      data.inv_color,
      data.classification_id,
      data.inv_id,
    ])

    return result.rows[0] // updated row
  } catch (error) {
    console.error("updateInventoryItem error:", error)
    return null
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get vehicle details by inventory id
 * ************************** */
async function getInventoryByInvId(inv_id) {
  try {
    const sql = `
      SELECT *
      FROM public.inventory
      WHERE inv_id = $1
    `
    const result = await pool.query(sql, [inv_id])
    return result.rows[0] // This one aims to deal with only one object
  } catch (error) {
    console.error("getInventoryByInvId error:", error)
    throw error
  }
}

/* ***************************
 *  Delete inventory item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
    const result = await pool.query(sql, [inv_id])
    return result.rowCount
  } catch (error) {
    throw error
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByInvId,
  addClassification,
  addInventoryItem,
  updateInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};