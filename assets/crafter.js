let recipeData, namesData;

let selectedItems;
let savedRecipeList = [];
let selectedRecipeList = new Map();
let changeAmountSelection;
let previousAmount = 0;

document.addEventListener('DOMContentLoaded', ()=>{
    const recipesUrl = "./assets/GDSRecipeData.json";
    fetch(recipesUrl)
    .then(response=>response.json())
    .then(data=>{
      recipeData = data.m_dataMap;
      if(namesData != null) { onReady(); }
    });

    const namesUrl = "./assets/GDSItemText_Noun.json";
    fetch(namesUrl)
    .then(response=>response.json())
    .then(data=>{
      namesData = data.m_dataMap;
      if(recipeData != null) { onReady(); }
    });
  });

  function onReady() {
    let searchModal = document.getElementById("add-item-modal");
    if(searchModal != null) {
      searchModal.addEventListener('hidden.bs.modal', resetSearch);
    }
    
    let addButton = document.getElementById("add-selected-items-btn");
    if(addButton != null) {
      addButton.addEventListener('click', addSelectedItems);
    }

    let amountModal = document.getElementById("change-amount-modal");
    if(amountModal != null) {
      amountModal.addEventListener('hidden.bs.modal', resetChangeAmountSelection);
    }

    let changeButton = document.getElementById("change-amount-btn");
    if(changeButton != null) {
      changeButton.addEventListener('click', changeWantedAmount);
    }

    if(typeof(Storage) !== "undefined") {
      let savedRecipeList = localStorage.getItem("shopping_list");
      if(savedRecipeList != "") {
        selectedRecipeList = new Map(JSON.parse(savedRecipeList));
        updateRecipeList();
      }
    }
  }

  function updateSearch(event) {
  if(event.key !== "Enter") {
    return;
  }

  let searchResultsForm = document.getElementById("search-results-form");
  if(searchResultsForm == null) {
    console.err("search results form not found");
  }

  searchResultsForm.innerHTML = '';
  searchResultsForm.scrollTop = 0;
  selectedItems = [];
  updateAddButton();

  let searchTerm = event.target.value.toUpperCase();
  if(searchTerm.length == 0) {
    return;
  }

  // do search here:
  let searchResults = namesData.filter(item => {
    let itemName = item.Value.textInfo[0].nounSingularForm_en.toUpperCase();
    return itemName.indexOf(searchTerm) > -1;
  });
  console.log(Array.from(searchResults, (item => item.Value.textInfo[0].nounSingularForm_en)));

  searchResults.forEach(resultItem => {
    const itemName = resultItem.Value.textInfo[0].nounSingularForm_en;
    const itemId = resultItem.Key.substring(5);
    const itemType = itemId.substring(0, 3);

    const recipeItems = recipeData.filter(item => item.Value.ItemId == itemId);
    if(recipeItems.length == 0) {
      return;
    }

    const hasQualities = recipeItems.find(item => item.Value.titleType > 0) != null;

    let grp = document.createElement('div');
    grp.setAttribute("class", "input-group mb-1");
    grp.setAttribute("id", itemId);

    let check = document.createElement('div');
    check.setAttribute("class", "input-group-text");

    let input = document.createElement('input');
    input.setAttribute("class", "form-check-input mt-0");
    input.setAttribute("type", "checkbox");
    input.setAttribute("value", "");
    input.setAttribute("aria-label", "checkbox for " + itemName);
    input.setAttribute("onclick", "searchResultSelected()");
    input.setAttribute("item-id", itemId);
    check.appendChild(input);

    let name = document.createElement('span');
    name.setAttribute("class", "input-group-text text-wrap text-start");
    if(hasQualities) {
      name.setAttribute("style", "width:35%");
    }
    else {
      name.setAttribute("style", "width:55%;");
    }
    name.textContent = itemName;

    grp.appendChild(check);
    grp.appendChild(name);

    if(hasQualities) {
      let quality = document.createElement('select');
      quality.setAttribute("class", "form-select");
      quality.setAttribute("id", "quality-selector-" + itemId);
      quality.setAttribute("style", "width: 20%");

      let idx = 0;
      recipeItems.forEach(recipe => {
        let titleType = recipe.Value.titleType;

        let option = document.createElement('option');
        option.setAttribute("class", "dropdown-item");
        option.setAttribute("value", titleType);

        if(idx == 0) {
          option.setAttribute("selected", "");
          idx++;
        }

        option.textContent = getQualityText(titleType);
        quality.appendChild(option);
      });

      grp.appendChild(quality);
    }

    let inputNum = document.createElement('input');
    inputNum.setAttribute("type", "number");
    inputNum.setAttribute("class", "form-control");
    inputNum.setAttribute("value", "1");
    inputNum.setAttribute("aria-label", "amount input for " + itemName);
    inputNum.setAttribute("id", itemId + "-amt");

    let btn = document.createElement('button');
    btn.setAttribute("class", "btn btn-outline-secondary");
    btn.setAttribute("type", "button");
    btn.setAttribute("style", "border: var(--bs-border-width) solid var(--bs-border-color);");
    btn.setAttribute("data-bs-dismiss", "modal");
    btn.addEventListener('click', addItem);
    btn.textContent = "Add";

    grp.appendChild(inputNum);
    grp.appendChild(btn);

    searchResultsForm.appendChild(grp);
  });
}

function resetSearch() {
  let modalForm = document.getElementById("search-results-form");
  if(modalForm != null) {
    modalForm.innerHTML = '';
    modalForm.scrollTop = 0;
  }

  let searchInput = document.getElementById("item-search-input");
  if(searchInput != null) {
    searchInput.value = "";
  }

  selectedItems = [];
  updateAddButton();
}

function searchResultSelected() {
  let option = event.target;
  let id = option.getAttribute("item-id");
  if(option.checked) {
    selectedItems.push(id);
  }
  else {
    let idx = selectedItems.indexOf(id);
    if(idx > -1) {
      selectedItems.splice(idx, 1);
    }
  }
  updateAddButton();
}

function updateAddButton() {
  let btn = document.getElementById("add-selected-items-btn");
  if(btn == null) {
    return;
  }

  if(selectedItems.length > 0) {
    btn.removeAttribute("disabled");
  }
  else {
    btn.setAttribute("disabled", "");
  }
}

function addItem() {
  let item = event.target.parentElement.getAttribute("id");

  let amtElem = document.getElementById(item + "-amt");
  let amt = Number(amtElem.value);
  if(amt < 1) { return; }
  let qualElem = document.getElementById("quality-selector-" +item);
  let qual = 0;
  if(qualElem != null) { qual = qualElem.value; }

  let itemRecipe = recipeData.find(recipe => recipe.Value.ItemId == item && recipe.Value.titleType == qual);
  if(itemRecipe == null) { 
    console.error("unable to find a matching recipe for " + item + " with a quality type of " + qual);
    return;
  }

  console.log(selectedRecipeList);
  let currAmt = selectedRecipeList.get(itemRecipe.Key);
  if(currAmt != null) {
    selectedRecipeList.set(itemRecipe.Key, currAmt + amt);
  }
  else {
    selectedRecipeList.set(itemRecipe.Key, amt);
  }

  updateRecipeList();
}

function addSelectedItems() {
  if(selectedItems.length <= 0) {
    return;
  }

  selectedItems.forEach(item => {
    let amtElem = document.getElementById(item + "-amt");
    let amt = Number(amtElem.value);
    if(amt < 1) { return; }
    let qualElem = document.getElementById("quality-selector-" +item);
    let qual = 0;
    if(qualElem != null) { qual = qualElem.value; }

    let itemRecipe = recipeData.find(recipe => recipe.Value.ItemId == item && recipe.Value.titleType == qual);
    if(itemRecipe == null) { 
      console.error("unable to find a matching recipe for " + item + " with a quality type of " + qual);
      return;
    }

    let currAmt = selectedRecipeList.get(itemRecipe.Key);
    if(currAmt != null) {
      selectedRecipeList.set(itemRecipe.Key, currAmt + amt);
    }
    else {
      selectedRecipeList.set(itemRecipe.Key, amt);
    }

    updateRecipeList();
  });
}

function changeWantedAmount() {
  let value = -1;
  let inputAmt = document.getElementById("change-amount-input");
  if(inputAmt != null) {
    value = inputAmt.value;
  }
  if(value == -1) {
    return;
  }

  if(value == inputAmt.defaultValue) {
    return;
  }

  if(changeAmountSelection != null) {
    if(value == 0) {
      removeRecipe(changeAmountSelection);
      return;
    }
    updateItemAmount(changeAmountSelection, value);
    selectedRecipeList.set(changeAmountSelection, value);
    updateLocalStorage();
    updateNeededItems();
  }
}

function openChangeAmountModal() {
  changeAmountSelection = event.target.getAttribute("recipeId");
  let amtInput = document.getElementById("change-amount-input");
  if(amtInput != null) {
    let amtValue = selectedRecipeList.get(changeAmountSelection);
    amtInput.setAttribute("value", amtValue);
  }
}

function resetChangeAmountSelection() {
  changeAmountSelection = null;
}

function updateItemInfoOffcanvas() {
  const itemId = event.target.parentElement.getAttribute("itemId");

  const nameInfo = namesData.find(nameData => nameData.Key == "name_" +itemId);
  if(nameInfo != null) {
    let title = document.getElementById("item-info-label");
    title.textContent = nameInfo.Value.textInfo[0].nounSingularForm_en;
  }
}

function updateRecipeList() {
  let finalItemsContainer = document.getElementById("final-items-body");
  selectedRecipeList.forEach((amt, recipeId) => {
    let foundRecipe;
    let alreadyFound = false;

    if(savedRecipeList.length > 0) {
      foundRecipe = savedRecipeList.find(curr => curr.Key == recipeId);
    }

    if(foundRecipe == null) {
      foundRecipe = recipeData.find(recipe => recipe.Key == recipeId);

      if(foundRecipe != null) {
        savedRecipeList.push(foundRecipe);
      }
      else {
        console.error("unable to find a recipe for " + recipeId);
        return;
      }
    }
    else {
      alreadyFound = true;
    }

    // update final items list
    if(!alreadyFound) {
      const recipeName = namesData.find(item => item.Key == "name_"+foundRecipe.Value.ItemId).Value.textInfo[0].nounSingularForm_en;
      let itemCont = document.createElement('div');
      itemCont.setAttribute("class", "hstack gap-1");
      itemCont.setAttribute("id", recipeId);
      itemCont.setAttribute("itemId", foundRecipe.Value.ItemId);

      const titleType = foundRecipe.Value.titleType;
      let optionText = "";
      if(titleType > 0) {
        optionText = getQualityText(titleType);
      }

      let itemText = document.createElement('a');
      itemText.setAttribute("class", "mb-0 text-reset text-decoration-none");
      // itemText.setAttribute("data-bs-toggle", "offcanvas");
      // itemText.setAttribute("href", "#item-info-offcanvas");
      // itemText.setAttribute("aria-controls", "item-info-offcanvas");
      // itemText.addEventListener('click', updateItemInfoOffcanvas);
      itemText.setAttribute("id", recipeId + "-text");
      if(titleType > 0) {
        itemText.innerHTML = recipeName + " (" + optionText + ") <strong>x" + amt + "</strong>";
      } else {
        itemText.innerHTML = recipeName + " <strong>x" + amt + "</strong";
      }
      itemCont.appendChild(itemText);

      let amountGroup = document.createElement('div');
      amountGroup.setAttribute("class", "input-group ms-auto");
      amountGroup.setAttribute("style", "width: fit-content; flex-wrap: nowrap;");
      itemCont.appendChild(amountGroup);

      let amountInput = document.createElement('input');
      amountInput.setAttribute("type", "number");
      amountInput.setAttribute("class", "form-control");
      amountInput.setAttribute("value", "0");
      amountInput.setAttribute("min", "0");
      amountInput.setAttribute("max", amt);
      amountInput.setAttribute("step", "1");
      amountInput.setAttribute("inputmode", "decimal")
      amountInput.setAttribute("aria-label", "current-amount-for-" + recipeName);
      amountInput.setAttribute("id", "current-amount-" + recipeId);
      amountInput.setAttribute("autocomplete", "off");
      amountInput.setAttribute("recipeId", recipeId);
      // amountInput.setAttribute("style", "min-width: 70px; max-width: 70px;");
      amountInput.setAttribute("style", "width: 70px;");
      amountInput.addEventListener('input', craftAmountChanged);
      amountInput.addEventListener('beforeinput', savePreviousAmount);
      amountGroup.appendChild(amountInput);

      let amountText = document.createElement('span');
      amountText.setAttribute("class", "input-group-text");
      amountText.setAttribute("id", "amount-total-" + recipeId);
      amountText.textContent = "/" + amt;
      amountGroup.appendChild(amountText);

      let changeBtn = document.createElement('button');
      changeBtn.setAttribute("type", "button");
      changeBtn.setAttribute("class", "btn btn-primary");
      changeBtn.textContent = "Change Amount";
      changeBtn.setAttribute("data-bs-toggle", "modal");
      changeBtn.setAttribute("recipeId", recipeId);
      changeBtn.setAttribute("data-bs-target", "#change-amount-modal");
      changeBtn.addEventListener('click', openChangeAmountModal);
      itemCont.appendChild(changeBtn);

      let removeBtn = document.createElement('button');
      removeBtn.setAttribute("type", "button");
      removeBtn.setAttribute("class", "btn btn-danger");
      removeBtn.setAttribute("recipeId", recipeId);
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener('click', removeRecipeClick);
      itemCont.appendChild(removeBtn);

      finalItemsContainer.appendChild(itemCont);
    }
    else {
      updateItemAmount(recipeId, amt);
    }
  });

  updateLocalStorage();
  updateNeededItems();
}

function updateLocalStorage() {
  console.log("updating storage...")
  if(typeof(Storage) !== "undefined") {
    console.log(selectedRecipeList);
    localStorage.setItem("shopping_list", JSON.stringify(Array.from(selectedRecipeList.entries())));
  }
}

function updatePrecraftList(precraftItems) {
  let precraftContainer = document.getElementById("precraft-items-body");
  if(precraftContainer == null) {
    console.error("no container for precraft items");
  }

  precraftItems.forEach((amt, itemId) => {
    let precraftCont = document.getElementById(itemId + "-precraft");
    if(precraftCont != null) {
      updatePrecraftAmount(itemId, amt);
      return;
    }

    const foundRecipe = recipeData.find(recipe => recipe.Value.ItemId == itemId);
    if(foundRecipe == null) { 
      console.error("unable to find a recipe for " + itemId);
      return;
    }

    const recipeName = namesData.find(item => item.Key == "name_"+itemId).Value.textInfo[0].nounSingularForm_en;
    precraftCont = document.createElement('div');
    precraftCont.setAttribute("class", "hstack gap-1");
    precraftCont.setAttribute("id", itemId + "-precraft");
    precraftCont.setAttribute("itemId", itemId);

    const titleType = foundRecipe.Value.titleType;
    if(titleType > 0) {
      const optionText = getQualityText(titleType);
    }

    let itemText = document.createElement('p');
    itemText.setAttribute("class", "mb-0 text-reset text-decoration-none");
    itemText.setAttribute("id", itemId + "-precraft-text");
    // itemText.setAttribute("data-bs-toggle", "offcanvas");
    // itemText.setAttribute("href", "#item-info-offcanvas");
    // itemText.setAttribute("aria-controls", "item-info-offcanvas");
    // itemText.addEventListener('click', updateItemInfoOffcanvas);
    if(titleType > 0) {
      itemText.innerHTML = recipeName + " (" + optionText + ") <strong>x" + amt + "</strong>";
    }
    else {
      itemText.innerHTML = recipeName + " <strong>x" + amt + "</strong>";
    }
    precraftCont.appendChild(itemText);

    let amountGroup = document.createElement('div');
    amountGroup.setAttribute("class", "input-group ms-auto");
    amountGroup.setAttribute("style", "width: fit-content; flex-wrap: nowrap;");
    precraftCont.appendChild(amountGroup);

    let amountInput = document.createElement('input');
    amountInput.setAttribute("type", "number");
    amountInput.setAttribute("class", "form-control");
    amountInput.setAttribute("value", "0");
    amountInput.setAttribute("min", "0");
    amountInput.setAttribute("max", amt);
    amountInput.setAttribute("step", "1");
    amountInput.setAttribute("inputmode", "numeric");
    amountInput.setAttribute("aria-label", "current-amount-for-" + recipeName);
    amountInput.setAttribute("id", "current-amount-precraft-" + itemId);
    amountInput.setAttribute("itemId", itemId);
    amountInput.setAttribute("autocomplete", "off");
    amountInput.setAttribute("style", "width: 70px;");
    amountInput.addEventListener('input', precraftAmountChanged);
    amountInput.addEventListener('beforeinput', savePreviousAmount);
    amountGroup.appendChild(amountInput);

    let amountText = document.createElement('span');
    amountText.setAttribute("class", "input-group-text");
    amountText.setAttribute("id", "amount-total-precraft-" + itemId);
    amountText.textContent = "/" + amt;
    amountGroup.appendChild(amountText);

    precraftContainer.appendChild(precraftCont);
  });

  let childrenToRemove = [];
  for(let i = 0; i < precraftContainer.children.length; i++) {
    let child = precraftContainer.children[i];
    const childId = child.getAttribute("itemId");
    const precraftItem = precraftItems.get(childId);
    if(precraftItem == null) { 
      childrenToRemove.push(child);
    }
  }
  childrenToRemove.forEach(child => child.remove())
}

function savePreviousAmount() {
  previousAmount = event.target.value;
}

function precraftAmountChanged() {
  const min = event.target.getAttribute("min");
  const max = event.target.getAttribute("max");
  let value = event.target.value;
  if(value < min) { event.target.value = min; }
  else if(value > max) { event.target.value = max; }
  value = event.target.value;
  const prevValue = previousAmount;
  previousAmount = 0;
  const change = value - prevValue;

  if(value == max) {
    event.target.parentElement.parentElement.setAttribute("style", "background-color: #5eff5b26;");
  }
  else {
    event.target.parentElement.parentElement.setAttribute("style", "");
  }

  const itemId = event.target.getAttribute("itemid");

  const recipeData = recipeData.find(recipe => recipe.Value.ItemId == itemId);
  const recipeItems = recipeData.Value.itemList;
  recipeItems.forEach(recipeItem => {
    updatePrecraftItemCount(change, recipeItem)
  });
}

function updatePrecraftItemCount(change, item) {
  // need to add (change * itemNum) for all recipe item
  const recipeItemId = item.ItemId;
  const itemAmount = item.numItems;

  let amountInput = document.getElementById("current-amount-gather-" + recipeItemId);
  let currentInputMin = Number(amountInput.getAttribute("min"));
  currentInputMin += (change * itemAmount);
  amountInput.setAttribute("min", currentInputMin);
  let currentValue = Number(amountInput.value);
  if(change < 0) {
    // negative change, always remove the items?
    currentValue += (change * itemAmount);
    amountInput.value = currentValue;
  } else {
    // positive change, only add what's missing
    console.log("change: " + change);
    console.log("current value: " + currentValue);
    console.log("current min: " + currentInputMin);
    if(currentValue < currentInputMin) {
      amountInput.value = currentInputMin;
    }
  }
}

function craftAmountChanged() {
  const min = event.target.getAttribute("min");
  const max = event.target.getAttribute("max");
  let value = event.target.value;
  if(value < min) { event.target.value = min; }
  else if(value > max) { event.target.value = max; }
  value = event.target.value;
  const prevValue = previousAmount;
  previousAmount = 0;
  const change = value - prevValue;

  if(value == max) {
    event.target.parentElement.parentElement.setAttribute("style", "background-color: #5eff5b26;");
  }
  else {
    event.target.parentElement.parentElement.setAttribute("style", "");
  }

  // need to add (change * itemNum) for all recipe items
  const recipeId = event.target.getAttribute("recipeId");
  const recipeData = recipeData.find(recipe => recipe.Key == recipeId);

  const recipeItems = recipeData.Value.itemList;
  recipeItems.forEach(recipeItem => {
    const recipeItemId = recipeItem.ItemId;
    const itemAmount = recipeItem.numItems;

    const recipeItemPrecraftData = recipeData.find(recipe => recipe.Value.ItemId == recipeItemId);
    if(recipeItemPrecraftData != null) {
      let amountInput = document.getElementById("current-amount-precraft-" + recipeItemId);
      let currentInputMin = Number(amountInput.getAttribute("min"));
      currentInputMin += (change * itemAmount);
      amountInput.setAttribute("min", currentInputMin);
      let currentValue = Number(amountInput.value);
      if(change < 0) {
        // negative change, always remove the items?
        currentValue += (change * itemAmount);
        amountInput.value = currentValue;
      } else {
        // positive change, only add what's missing
        console.log("change: " + change);
        console.log("current value: " + currentValue);
        console.log("current min: " + currentInputMin);
        if(currentValue < currentInputMin) {
          amountInput.value = currentInputMin;
        }
      }

      const precraftItems = recipeItemPrecraftData.Value.itemList;
      precraftItems.forEach(item => {
        updatePrecraftItemCount(change * item.numItems, item);
      });
    }
    else {
      let amountInput = document.getElementById("current-amount-gather-" + recipeItemId);
      let currentInputMin = Number(amountInput.getAttribute("min"));
      currentInputMin += (change * itemAmount);
      amountInput.setAttribute("min", currentInputMin);
      let currentValue = Number(amountInput.value);
      if(change < 0) {
        // negative change, always remove the items?
        currentValue += (change * itemAmount);
        amountInput.value = currentValue;
      } else {
        // positive change, only add what's missing
        console.log("change: " + change);
        console.log("current value: " + currentValue);
        console.log("current min: " + currentInputMin);
        if(currentValue < currentInputMin) {
          amountInput.value = currentInputMin;
        }
      }
    }
  });
}

function updateGatheringList(gatheringItems) {
  let gatheringContainer = document.getElementById("gathering-items-body");
  if(gatheringContainer == null) {
    console.error("no container for gathering items");
  }

  gatheringItems.forEach((amt, itemId) => {
    let gatheringCont = document.getElementById(itemId);
    if(gatheringCont != null) {
      updateGatheringAmount(itemId, amt);
      return;
    }

    const recipeName = namesData.find(item => item.Key == "name_"+itemId).Value.textInfo[0].nounSingularForm_en;
    gatheringCont = document.createElement('div');
    gatheringCont.setAttribute("class", "hstack gap-1");
    gatheringCont.setAttribute("id", itemId);
    gatheringCont.setAttribute("itemId", itemId);

    let itemText = document.createElement('p');
    itemText.setAttribute("class", "mb-0 text-reset text-decoration-none");
    itemText.setAttribute("id", itemId + "-gather-text");
    // todo: add offcanvas with item info
    // itemText.setAttribute("data-bs-toggle", "offcanvas");
    // itemText.setAttribute("href", "#item-info-offcanvas");
    // itemText.setAttribute("aria-controls", "item-info-offcanvas");
    // itemText.addEventListener('click', updateItemInfoOffcanvas);
    itemText.innerHTML = recipeName + " <strong>x" + amt + "</strong>";
    gatheringCont.appendChild(itemText);

    let amountGroup = document.createElement('div');
    amountGroup.setAttribute("class", "input-group ms-auto");
    amountGroup.setAttribute("style", "width: fit-content; flex-wrap: nowrap;");
    gatheringCont.appendChild(amountGroup);

    let amountInput = document.createElement('input');
    amountInput.setAttribute("type", "number");
    amountInput.setAttribute("class", "form-control");
    amountInput.setAttribute("value", "0");
    amountInput.setAttribute("min", "0");
    amountInput.setAttribute("max", amt);
    amountInput.setAttribute("step", "1");
    amountInput.setAttribute("inputmode", "decimal")
    amountInput.setAttribute("aria-label", "current-amount-for-" + recipeName);
    amountInput.setAttribute("id", "current-amount-gather-" + itemId);
    amountInput.setAttribute("autocomplete", "off");
    amountInput.addEventListener('input', gatherAmountChanged);
    amountInput.setAttribute("style", "width: 70px;");
    amountGroup.appendChild(amountInput);

    let amountText = document.createElement('span');
    amountText.setAttribute("class", "input-group-text");
    amountText.setAttribute("id", "amount-total-gather-" + itemId);
    amountText.textContent = "/" + amt;
    amountGroup.appendChild(amountText);

    gatheringContainer.appendChild(gatheringCont);
  });

  let childrenToRemove = [];
  for(let i = 0; i < gatheringContainer.children.length; i++) {
    let child = gatheringContainer.children[i];
    const childId = child.getAttribute("id");
    const gatheringItem = gatheringItems.get(childId);
    if(gatheringItem == null) { 
      childrenToRemove.push(child);
    }
  }
  childrenToRemove.forEach(child => child.remove())
}

function gatherAmountChanged() {
  const min = event.target.getAttribute("min");
  const max = event.target.getAttribute("max");
  let value = event.target.value;
  if(value < min) { event.target.value = min; }
  else if(value > max) { event.target.value = max; }
  value = event.target.value;

  if(value == max) {
    event.target.parentElement.parentElement.setAttribute("style", "background-color: #5eff5b26;");
  }
  else {
    event.target.parentElement.parentElement.setAttribute("style", "");
  }
}

function removeRecipeClick() {
  let recipeId = event.target.getAttribute("recipeId");
  removeRecipe(recipeId);
}

function removeRecipe(recipeId) {
  let elem = document.getElementById(recipeId);
  if(elem != null) {
    elem.remove();
  }

  selectedRecipeList.delete(recipeId);
  savedRecipeList = savedRecipeList.filter(recipe => recipe.Key != recipeId);

  updateLocalStorage();
  updateNeededItems();
}

function updateItemAmount(id, amount) {
  let itemText = document.getElementById(id + "-text");
  if(itemText != null) {
    itemText.childNodes[1].textContent = "x" + amount;
  }

  let amountText = document.getElementById("amount-total-" + id);
  if(amountText != null) {
    amountText.textContent = "/" + amount;
  }

  let amountInput = document.getElementById("current-amount-" + id);
  if(amountInput != null) {
    amountInput.setAttribute("max", amount);
  }
}

function updatePrecraftAmount(id, amount) {
  let itemText = document.getElementById(id + "-precraft-text");
  if(itemText != null) { 
    itemText.childNodes[1].textContent = "x" + amount;
  } 

  let amountText = document.getElementById("amount-total-precraft-" + id);
  if(amountText != null) {
    amountText.textContent = "/" + amount;
  }

  let amountInput = document.getElementById("current-amount-precraft-" + id);
  if(amountInput != null) {
    amountInput.setAttribute("max", amount);
  }
}

function updateGatheringAmount(id, amount) {
  let itemText = document.getElementById(id + "-gather-text");
  if(itemText != null) { 
    itemText.childNodes[1].textContent = "x" + amount;
  }

  let amountText = document.getElementById("amount-total-gather-" + id);
  if(amountText != null) {
    amountText.textContent = "/" + amount;
  }

  let amountInput = document.getElementById("current-amount-gather-" + id);
  if(amountInput != null) {
    amountInput.setAttribute("max", amount);
  }
}

function getQualityText(titleType) {
  switch(titleType) {
  case 1:
    return "Ordinary";
  case 2:
    return "Fine";
  case 3:
    return "Notable";
  case 4:
    return "Supreme";
  case 5:
    return "Legendary";
  default:
    console.error(titleType);
    return "Unknown";
  }
}

function updateNeededItems() {
  console.log("updating item list...");

  let neededItems = new Map();
  let preCraftItems = new Map();

  selectedRecipeList.forEach((amt, recipeId) => {
    const recipeData = savedRecipeList.find(recipe => recipe.Key == recipeId);
    if(recipeData == null) {
      console.error("no recipe data saved for " + recipeId);
      return;
    }

    const recipeItems = recipeData.Value.itemList;
    recipeItems.forEach(item => {
      let foundRequirements = getNeededItems(item, amt * item.numItems);
      foundRequirements.neededItemsList.forEach((amt, item) => {
        let currAmt = neededItems.get(item);
        if(currAmt == null) { neededItems.set(item, amt); }
        else { neededItems.set(item, amt + currAmt); }
      });
      foundRequirements.preCraftList.forEach((amt, item) => {
        let currAmt = preCraftItems.get(item);
        if(currAmt == null) { preCraftItems.set(item, amt); }
        else { preCraftItems.set(item, amt + currAmt); }
      });
    })
  });

  updatePrecraftList(preCraftItems);
  updateGatheringList(neededItems);
}

function getNeededItems(recipe, amount) {
  const itemId = recipe.ItemId;
  let neededItems = new Map();
  let precraftItems = new Map();
  let itemRecipeData = recipeData.find(subrecipe => subrecipe.Value.ItemId == itemId);
  if(itemRecipeData != null) {
    // add to precraft list
    precraftItems.set(itemId, amount);
    
    const itemRecipeItems = itemRecipeData.Value.itemList;
    itemRecipeItems.forEach(item => {
      const foundRequirements = getNeededItems(item, item.numItems * amount);
      foundRequirements.neededItemsList.forEach((amt, item) => {
        let currAmt = neededItems.get(item);
        if(currAmt == null) { neededItems.set(item, amt); }
        else { neededItems.set(item, amt + currAmt); }
      });
      foundRequirements.preCraftList.forEach((amt, item) => {
        let currAmt = precraftItems.get(item);
        if(currAmt == null) { precraftItems.set(item, amt); }
        else { precraftItems.set(item, amt + currAmt); }
      })
    })
  } else {
    let currAmt = neededItems.get(itemId);
    if(currAmt == null) { neededItems.set(itemId, amount); }
    else { neededItems.set(itemId, amount + currAmt); }
  }

  return { preCraftList: precraftItems, 
           neededItemsList: neededItems,
         };
}
