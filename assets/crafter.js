let recipeData, namesData;

document.addEventListener('DOMContentLoaded', ()=>{
    const recipesUrl = "./assets/GDSRecipeData.json";
    fetch(recipesUrl)
    .then(response=>response.json())
    .then(data=>{
      const parsedRecipes = JSON.parse(data);
      recipeData = parsedRecipes.m_dataMap;
      console.log(recipeData); // temp: confirming data is valid.
    });

    const namesUrl = "./assets/GDSItemText_Noun.json";
    fetch(namesUrl)
    .then(response=>response.json())
    .then(data=>{
      const parsedNames = JSON.parse(data);
      namesData = parsedNames.m_dataMap;
      console.log(namesData);
    });
  })
