"use strict";

// Get a list of items in inventory based on the classification_id
const classificationList = document.querySelector("#classificationList");

if (classificationList) {
  classificationList.addEventListener("change", async function () {
    const classification_id = classificationList.value;
    console.log(`classification_id is: ${classification_id}`);

    if (!classification_id) {
      const table = document.getElementById("inventoryDisplay");
      if (table) table.innerHTML = "";
      return;
    }


    const classIdURL = `/inv/getInventory/${classification_id}`;

    try {
      const response = await fetch(classIdURL);
      if (!response.ok) throw new Error("Network response was not OK");

      const data = await response.json();
      console.log(data);
      buildInventoryList(data);
    } catch (error) {
      console.log("There was a problem: ", error.message);
      const table = document.getElementById("inventoryDisplay");
      if (table) table.innerHTML = "";
    }
  });
}

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay");
  if (!inventoryDisplay) return;

  if (!Array.isArray(data) || data.length === 0) {
    inventoryDisplay.innerHTML =
      "<tbody><tr><td>No inventory found.</td></tr></tbody>";
    return;
  }

  let dataTable = "<thead>";
  dataTable += "<tr><th>Vehicle Name</th><th>Modify</th><th>Delete</th></tr>";
  dataTable += "</thead>";

  dataTable += "<tbody>";
  data.forEach((element) => {
    dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
    dataTable += `<td><a href="/inv/edit/${element.inv_id}" title="Click to update">Modify</a></td>`;
    dataTable += `<td><a href="/inv/delete/${element.inv_id}" title="Click to delete">Delete</a></td></tr>`;
  });
  dataTable += "</tbody>";

  inventoryDisplay.innerHTML = dataTable;
}

