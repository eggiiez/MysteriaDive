var shopsData, shopBin, shopStr;
var itemNamesData, charaNamesData;

var loadedMapShopData = new Map();
var loadedMapNPCData = new Map();

const mapShopFileName = "GDSMapShopConfig";
const mapNPCFileName = "GDSNPCSetting";

const shouldDebug = false;

document.addEventListener('DOMContentLoaded', ()=>{
  const shopUrl = "./assets/data/GDSShopData.json";
  fetch(shopUrl)
  .then(response=>response.json())
  .then(data=>{
		console.log("loaded shop data");
    shopsData = data.m_dataMap;
    shopBin = data.m_autoBin;
    shopStr = data.m_autoStr;
    if(itemNamesData != null && charaNamesData != null) { onReady(); }
  });

	const itemNamesUrl = "./assets/data/GDSItemText_Noun.json";
	fetch(itemNamesUrl)
	.then(response=>response.json())
	.then(data=>{
		console.log("loaded item name data");
		itemNamesData = data.m_dataMap;
		if(shopsData != null && charaNamesData != null) { onReady(); }
	});

	const charaNamesUrl = "./assets/data/GDSCharaText_Noun.json";
	fetch(charaNamesUrl)
	.then(response=>response.json())
	.then(data=>{
		console.log("loaded chara name data");
		charaNamesData = data.m_dataMap;
		console.log(charaNamesData);
		if(shopsData != null && itemNamesData != null) { onReady(); }
	})
});

function onReady() {
  console.log("ready");
	if(shouldDebug) { console.log(shopsData); }

	let shopsContainer = document.getElementById("shops-container"); // sorry!
	if(shopsContainer == null) { return; }

	shopsData.forEach(shop => {
		const shopData = shop.Value;
		if(shouldDebug) { console.log(shopData); }

		// console.log("reading " + shopData.ID);
		const shopDataArray = shopData.ID.split("_");
		const mapId = shopDataArray.find(str => str.slice(0,3) == "Map");
		if(mapId == null) { console.log("no map id for " + shopData.ID); }
		else {
			const mapStr = mapId.slice(0, 3) + "_" + mapId.slice(3);
			const foundMapData = loadedMapShopData.get(mapStr);
			if(foundMapData != null) {
				mapDataFound(foundMapData, shop, mapStr);
			}
			else {
				const mapUrl = "./assets/data/Maps/" + mapStr + "/" + mapStr + "_GDSMapShopConfig.json";
				fetch(mapUrl)
				.then(response=> response.json())
				.then(data=>{
					// console.log("loaded map shop data for map " + mapStr);
					loadedMapShopData.set(mapStr, data.m_dataMap);
					mapDataFound(data.m_dataMap, shop, mapStr);			
				});
			}
		}
	});
  //   let newShopElem = document.createElement('div');
	// 	newShopElem.setAttribute("id", shop.Key);
	// 	shopsContainer.appendChild(newShopElem);

	// 	let shopName = document.createElement('h5');
	// 	shopName.textContent = shop.Key;
	// 	newShopElem.appendChild(shopName);

	// 	let itemsSubtitle = document.createElement('h6');
	// 	itemsSubtitle.textContent = "Items";
	// 	newShopElem.appendChild(itemsSubtitle);

	// 	let ul = document.createElement('ul');
	// 	newShopElem.appendChild(ul);

	// 	const shopItems = shop.Value.itemInfoList;
	// 	shopItems.forEach(item => {
	// 		let li = document.createElement('li');
	// 		const idArray = item.ItemId.split("_");
	// 		const itemId = idArray[idArray.length-1];
	// 		const nameData = itemNamesData.find(data => data.Key == "name_" + itemId);

	// 		if(item.stockType == 0) {
	// 			li.textContent = nameData.Value.textInfo[0].nounSingularForm_en;
	// 		}
	// 		else {
	// 			li.textContent = "Recipe: " + nameData.Value.textInfo[0].nounSingularForm_en;
	// 		}

	// 		ul.appendChild(li);
	// 	});

	// 	let signSubtitle = document.createElement('h6');
	// 	signSubtitle.textContent = "Buy Shop Name IDs";
	// 	newShopElem.appendChild(signSubtitle);

	// 	let ul2 = document.createElement('ul');
	// 	newShopElem.appendChild(ul2);

	// 	const signInfo = shop.Value.signInfo;
	// 	signInfo.buyShopNameIdArray.forEach(iconId => {
	// 		let li = document.createElement('li');
	// 		li.textContent = iconId;
	// 		ul2.appendChild(li);
	// 	}) */

  //   /*
  //   <div class="accordion" id="shop-accordion">
  //   <div class="accordion-item">
  //       <h2 class="accordion-header">
  //       <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#shop-1-item-list" aria-expanded="false" aria-controls="shop-1-item-list">
  //           Shop 1
  //       </button>
  //       </h2>

  //       <div id="shop-1-item-list" class="accordion-collapse collapse" data-bs-parent="#shop-1-accordion">
  //       <div class="accordion-body" id="shop-1-items-accordion" role="tablist" aria-multiselectable="true">
  //           <!-- Tabs -->
  //           <ul class="nav nav-tabs" role="tablist" id="shop-1-tabs">
  //           <li class="nav-item" role="presentation">
  //               <button class="nav-link active" id="shop-1-tab-1" data-bs-toggle="tab" data-bs-target="#shop-1-tab-1" type="button" role="tab" aria-controls="shop-1-tab-1" aria-selected="true">Tab 1</button>
  //           </li>
  //           <li class="nav-item" role="presentation">
  //               <button class="nav-link" id="shop-1-tab-2" data-bs-toggle="tab" data-bs-target="#shop-1-tab-2" type="button" role="tab" aria-controls="shop-1-tab-2" aria-selected="false">Tab 2</button>
  //           </li>
  //           </ul>

  //           <!-- Recipe Tables -->
  //           <div class="tab-content" id="cook-tab-content">

  //           <!-- Cook Meals -->
  //           <div role="tabpanel" class="tab-pane show active" id="cook-meals">
  //               <table class="table table-hover">
  //               <tbody id="cook-meals-recipes">
  //                   <tr>
  //                   <th>Name</th>
  //                   <th>Level</th>
  //                   <th>Recommended Skill</th>
  //                   <th>Materials</th>
  //                   </tr>
  //               </tbody>
  //               </table>
  //           </div>

  //           <!-- Cook Objects -->
  //           <div role="tabpanel" class="tab-pane" id="cook-objects">
  //               <table class="table table-hover">
  //               <thead>
  //                   <tr>
  //                   <th>Name</th>
  //                   <th>Level</th>
  //                   <th>Recommended Skill</th>
  //                   <th>Materials</th>
  //                   </tr>
  //               </thead>
  //               <tbody id="cook-objects-recipes"></tbody>
  //               </table>
  //           </div>
  //           </div>
  //       </div>
  //       </div>
  //   </div>
  //   </div>
  //   */
  // });
}

function mapDataFound(mapShopData, shopData, mapStr) {
	if(shouldDebug) { console.log(mapShopData); }

	mapShopData.forEach(mapData => {
		const mapIdArray = mapData.Key.Name.split("_");
		// console.log("reading map shop data for " + mapData.Key.Name);
		if(shouldDebug) {
			console.log("Map DATA:");
			console.log(mapData);
			console.log("Map ID = " + mapData.Value.ID.Name);
			console.log("Map String = " + mapStr);
		}

		const foundNPCData = loadedMapNPCData.get(mapStr);
		if(foundNPCData != null) {
			npcDataFound(foundNPCData, mapData, shopData);
		}
		else {
			const npcUrl = "./assets/data/Maps/" + mapStr + "/" + mapStr + "_GDSNPCSetting.json";
			fetch(npcUrl)
			.then(response=> response.json())
			.then(data=>{
				if(data != null) {
					// console.log("loaded map npc data for " + mapStr);
					loadedMapNPCData.set(mapStr, data.m_dataMap);
					npcDataFound(data.m_dataMap, mapData, shopData);	
				}		
			});
		}
	});
}

function npcDataFound(npcData, mapData, shopData) {
	console.log("FOUND NPC DATA");
	console.log(mapData);
	console.log(shopData);

	const foundNpcData = npcData.find(npc => npc.Value.npcID == mapData.Value.ID.Name);
	if(foundNpcData == null) { console.error("couldnt find npc data for " + mapData.Value.ID.Name); }

	console.log(foundNpcData);

	let shopsContainer = document.getElementById("shops-container"); // sorry!
	if(shopsContainer == null) { return; }

	let shopDiv = document.getElementById(shopData.Value.ID);
	if(shopDiv == null) {
		shopDiv = document.createElement('div');
		shopDiv.setAttribute("id", shopData.Value.ID);
		shopsContainer.appendChild(shopDiv);
		
		let shopTitle = document.createElement('h5');
		shopTitle.textContent = shopData.Value.ID;
		shopDiv.appendChild(shopTitle);
	}


	let mapDataText = document.createElement('h6');
	mapDataText.textContent = mapData.Value.ID.Name;
	// shopDiv.appendChild(mapDataText);

	let npcDataText = document.createElement('h6');
	let npcNameId = "";
	if(foundNpcData.Value.overWriteCharaNameId != "None") {
		npcNameId = foundNpcData.Value.overWriteCharaNameId;
	} else {
		npcNameId = foundNpcData.Value.charaID;
	}
	npcDataText.textContent = npcNameId;
	// shopDiv.appendChild(npcDataText);

	let shopNameText = document.createElement('h6');
	const foundNameData = charaNamesData.find(charaNameData => charaNameData.Key == npcNameId);
	if(foundNameData != null) { 
		shopNameText.textContent = foundNameData.Value.textInfo[0].nounSingularForm_en;
	}
	shopDiv.appendChild(shopNameText);

	const shopItems = shopData.Value.itemInfoList;

}