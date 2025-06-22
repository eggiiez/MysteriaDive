let recipeData, namesData;

document.addEventListener('DOMContentLoaded', ()=>{
    const recipesUrl = "GDSRecipeData.json";
    fetch(recipesUrl)
    .then(response=>response.text())
    .then(data=>{
      const parsedRecipes = JSON.parse(data);
      recipeData = parsedRecipes.m_dataMap;
      console.log(recipeData); // temp: confirming data is valid.
    });

    const namesUrl = "GDSItemText_Noun.json";
    fetch(namesUrl)
    .then(response=>response.text())
    .then(data=>{
      const parsedNames = JSON.parse(data);
      namesData = parsedNames.m_dataMap;
      console.log(namesData);
    });
  })
