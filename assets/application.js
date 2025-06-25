function levelChange(src)
    {
      let tableRow = src.closest("tr");
      if(recipes == null || tableRow == null) {
        return;
      }
      let rowName = tableRow.firstChild.textContent; 

      let tableContainer = tableRow.closest("div");
      let tableId = tableContainer.getAttribute("id");
      let tableAttrs = tableId.split("-");
      for(let i=0; i<recipes.length; i++) {
        let jobAttr = recipes[i].getAttribute("job").toLowerCase();
        let categoryAttr = recipes[i].getAttribute("category").toLowerCase();
        if(tableAttrs[0] == jobAttr && tableAttrs[1] == categoryAttr) {
          // check name
          let recipe = recipes[i];
          let recipeName = recipe.getElementsByTagName("name")[0].firstChild.nodeValue;
          if(rowName == recipeName) {
            // found match!
            let qualityInfo = recipe.getElementsByTagName(src.value)[0];
            tableRow.childNodes[1].textContent = qualityInfo.getElementsByTagName("level")[0].firstChild.nodeValue;
            tableRow.childNodes[2].textContent = qualityInfo.getElementsByTagName("skill")[0].firstChild.nodeValue;
            // materials...
            let materialsText = "";
            let materialsInfo = qualityInfo.getElementsByTagName("material");
            for(let j=0; j<materialsInfo.length; j++) {
              // name
              if(materialsInfo[j].getElementsByTagName("name")[0] != null){
                materialsText += materialsInfo[j].getElementsByTagName("name")[0].firstChild.nodeValue;
              }
              // amount
              if(materialsInfo[j].getElementsByTagName("amount")[0] != null){
                materialsText += " x" + materialsInfo[j].getElementsByTagName("amount")[0].firstChild.nodeValue;
              }
              // line break
              if(materialsInfo[j+1] != null){
                materialsText += "\r\n";
              }
            }
            tableRow.childNodes[3].textContent = materialsText;
          }
        }
      }
    }

function buildRecipeList() {
  const tableMap = new Map();

  for(let i=0; i<recipes.length; i++) {
    let recipe = recipes[i];

    // get category attr
    let tableId = recipe.getAttribute("job") + "-" + recipe.getAttribute("category") + "-recipes";
    let table = document.getElementById(tableId.toLowerCase());
    if(table == null) {
      continue;
    }

    if(tableMap.get(tableId) == null) {
      tableMap.set(tableId, 0);
    }
    else {
      tableMap.set(tableId, tableMap.get(tableId)+1);
    }

    // make new row
    let tr = document.createElement('tr');

    // name col
    if(recipe.getElementsByTagName("name")[0] != null) {
      let name = recipe.getElementsByTagName("name")[0].firstChild.nodeValue;
      let tdName = document.createElement('td');
      tdName.textContent = name;
      tr.appendChild(tdName);
    }

    // find quality level info
    let levelsContainer = recipe.getElementsByTagName("versions")[0];
    let allLevels = levelsContainer.children;
    let selectedLevel = allLevels[0];

    if(selectedLevel != null) {
      // level col
      if(selectedLevel.getElementsByTagName("level")[0] != null) {
        let lvl = selectedLevel.getElementsByTagName("level")[0].firstChild.nodeValue;
        let tdLvl = document.createElement('td');
        tdLvl.textContent = lvl;
        tr.appendChild(tdLvl);
      }

      // skill col
      if(selectedLevel.getElementsByTagName("skill")[0] != null) {
        let skill = selectedLevel.getElementsByTagName("skill")[0].firstChild.nodeValue;
        let tdSkill = document.createElement('td');
        tdSkill.textContent = skill;
        tr.appendChild(tdSkill);
      }

      // materials col
      let materials = selectedLevel.getElementsByTagName("material");
      if(materials != null && materials.length > 0) {
        let tdMats = document.createElement('td');
        for(let j=0; j<materials.length; j++) {
          // name
          if(materials[j].getElementsByTagName("name")[0] != null){
            tdMats.textContent += materials[j].getElementsByTagName("name")[0].firstChild.nodeValue;
          }

          if(materials[j].getElementsByTagName("amount")[0] != null){
            tdMats.textContent += " x" + materials[j].getElementsByTagName("amount")[0].firstChild.nodeValue;
          }

          if(materials[j+1] != null){
            tdMats.textContent += "\r\n";
          }
        }
        tr.appendChild(tdMats);
      }

      // version select col
      let tdVersions = document.createElement('td');
      let versionsDiv = document.createElement('div');
      versionsDiv.setAttribute("class", "btn-group recipe-level-select");
      versionsDiv.setAttribute("data-toggle", "buttons");
      tdVersions.appendChild(versionsDiv);

      for(var j = 0; j < allLevels.length; j++) {
        let versionLabel = document.createElement('label');
        if(j == 0) {
          versionLabel.setAttribute("class", "btn btn-primary active");
        }
        else {
          versionLabel.setAttribute("class", "btn btn-primary");
        }

        switch(allLevels[j].nodeName) {
          case "Ordinary":
            versionLabel.textContent = '\u2605';
            break;
          case "Fine":
            versionLabel.textContent = "\u2605\u2605";
            break;
          case "Notable":
            versionLabel.textContent = "\u2605\u2605\u2605";
            break;
          case "Supreme":
            versionLabel.textContent = "\u2605\u2605\u2605\u2605";
            break;
          default:
            versionLabel.textContent = "?";
            break;
        }
        console.log(versionLabel.textContent);
        versionsDiv.appendChild(versionLabel);

        let versionInput = document.createElement('input');
        versionInput.setAttribute("type", "radio");
        // versionInput.setAttribute("id", allLevels[j].nodeName.toLowerCase());
        versionInput.setAttribute("name", "recipe-level");
        versionInput.setAttribute("onchange", "levelChange(this)");
        versionInput.setAttribute("value", allLevels[j].nodeName);
        versionLabel.appendChild(versionInput);
      }

      tr.appendChild(tdVersions);
    }
    else {
      let tdMissing = document.createElement('td');
      tdMissing.setAttribute("colspan", "3");
      tdMissing.textContent = "No recipe data for this item";
      tr.appendChild(tdMissing);
    }

    if(table.childNodes[tableMap.get(tableId)] != null){
      table.replaceChild(tr, table.childNodes[tableMap.get(tableId)]);
    }
    else{
      table.appendChild(tr);
    }
  }
}
