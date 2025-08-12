const BASE_URL = "https://pokeapi.co/api/v2";
const loadingSpinnerRef = document.getElementById("loading_spinner");
const loadingBtnRef = document.getElementById("loadingBtn");

let apiOffset = 0;
let allNames = [];
let allPkmResource = [];

function init() {
  loadData();
}

async function loadData(path = "") {
  showLoadingSpinner();
  try {
    let response = await fetch(
      `${BASE_URL}/pokemon?limit=20&offset=${apiOffset}`
    );
    if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`);

    let data = await response.json();

    // Namen hinzufügen
    allNames.push(...data.results);

    // Details laden
    await loadDetails(data.results);

    // Nur neue Karten rendern
    renderPkmCards(allPkmResource.length - data.results.length);
  } catch (err) {
    console.error("Fehler beim Laden der Pokémon-Liste:", err);
    alert("Konnte Pokémon-Daten nicht laden. Bitte später erneut versuchen.");
  } finally {
    hideLoadingSpinner();
  }
}

async function loadMoreData() {
  apiOffset += 20;
  await loadData();
}

async function loadDetails(pokemonList) {
  try {
    // Alle Requests gleichzeitig starten
    const detailPromises = pokemonList.map(async (pkm) => {
      let response = await fetch(pkm.url);
      if (!response.ok)
        throw new Error(`HTTP-Fehler bei ${pkm.name}: ${response.status}`);
      return response.json();
    });

    // Warten, bis alle fertig sind
    const detailsArray = await Promise.all(detailPromises);

    // Ergebnisse hinzufügen
    allPkmResource.push(...detailsArray);
  } catch (err) {
    console.error("Fehler beim Laden der Pokémon-Details:", err);
    alert("Einige Pokémon konnten nicht geladen werden.");
  }
}

//async function loadDetails(pokemonList) {
//  for (let pkm of pokemonList) {
//    let response = await fetch(pkm.url);
//    let details = await response.json();
//    allPkmResource.push(details);
//  }
//
//  console.log("Alle Details bisher:", allPkmResource);
//  hideLoadingSpinner();
//}

//async function loadDetails(allNames) {
//  let pkmDetails = "";
//  for (let indexPkm = apiOffset; indexPkm < allNames.length; indexPkm++) {
//    let response = await fetch(allNames[indexPkm].url);
//    pkmDetails = await response.json();
//    allPkmResource.push(pkmDetails);
//  }
//
//  console.log(allPkmResource);
//  hideLoadingSpinner();
//  renderPkmCards();
//}

// Holt die Typen-Icons als HTML-String
function getTypeIcons(pokemon) {
  if (!pokemon.types || pokemon.types.length === 0) {
    return "";
  }
  return pokemon.types
    .map((t) => {
      const typeName = t.type.name;
      return `
      <div class="icon ${typeName}">
      <img 
      src="./assets/svg/${typeName}.svg" 
      alt="${typeName} icon" 
      class="type_icon"
    /></div>`;
    })
    .join("");
}

function renderPkmCards(startIndex) {
  let pkmCard = document.getElementById("content");
  for (
    let indexPkm = startIndex;
    indexPkm < allPkmResource.length;
    indexPkm++
  ) {
    const pokemon = allPkmResource[indexPkm];
    pkmCard.innerHTML += `
    <div class="pkmCard scale_effect" onclick="showOverlay(${indexPkm})" id="pkm_details${indexPkm}">
      <div class="pkmCard_upper_section"><p class="left full-width"># ${
        indexPkm + 1
      }</p><p class="center full-width uppercase">${
      pokemon.name
    }</p><p class="full-width" ></p></div>
      <div class="pkmCard_middle_section ${pokemon.types[0].type.name}">
        <img class="pkmCardImg" src="${
          pokemon.sprites.other["official-artwork"].front_shiny
        }" alt="pokemon_img"></div>
      <div class="pkmCard_lower_section">
        ${getTypeIcons(pokemon)}
      </div>
    </div>
    
    `;
  }
}

function showOverlay(indexPkm) {
  let dialogContent = document.getElementById("overlay");
  dialogContent.innerHTML = "";
  document.getElementById("overlay").classList.remove("d_none");
  dialogContent.innerHTML += fillDialog(indexPkm);
  document.body.classList.add("hide");
}

function fillDialog(indexPkm) {
  return `<div onclick="event.stopPropagation()" id="dialog" class="dialog prevent-select">
            <div class="dialogCard_upper_section half-height">
              <div
                class="pkmCard dialog_width" id="pkm_details${indexPkm}">
                <div class="pkmCard_upper_section">
                  <p class="left full-width"># ${indexPkm + 1}</p>
                  <p class="center full-width uppercase">
                    ${allPkmResource[indexPkm].name}
                  </p>
                  <span onclick="hideOverlay()" class="close_img highlight full-width right" >x</span>
                </div>
                <div
                  class="pkmCard_middle_section ${
                    allPkmResource[indexPkm].types[0].type.name
                  }">
                  <img class="pkmCardImg" src="${
                    allPkmResource[indexPkm].sprites.other["official-artwork"]
                      .front_shiny
                  }" alt="pokemon_img">
                </div>
                <div class="pkmCard_lower_section">
                ${getTypeIcons(allPkmResource[indexPkm])}</div>
              </div>
            </div>
            <div class="dialogCard_lower_section half-height">        
                <span onclick="previousPkm(${
                  indexPkm - 1
                })" class="left_arrow highlight"><</span>
                <span onclick="nextPkm(${
                  indexPkm + 1
                })" class="right_arrow highlight">></span>
            </div>
          </div>`;
}

function hideOverlay() {
  document.getElementById("overlay").classList.add("d_none");
  document.body.classList.remove("hide");
}

function nextPkm(i) {
  if (i == allPkmResource.length) {
    i = 0;
  }
  showOverlay(i);
}

function previousPkm(i) {
  if (i == -1) {
    i = allPkmResource.length - 1;
  }
  showOverlay(i);
}

function showLoadingSpinner() {
  loadingSpinnerRef.classList.remove("d_none");
  loadingBtnRef.classList.add("d_none");
}

function hideLoadingSpinner() {
  loadingSpinnerRef.classList.add("d_none");
  loadingBtnRef.classList.remove("d_none");
}

//function loadMorePkm() {
//  apiOffset += 20;
//  loadData("/pokemon?limit=20&offset=");
//}
