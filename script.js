const BASE_URL = "https://pokeapi.co/api/v2";
const loadingSpinnerRef = document.getElementById("loading_spinner");

let allNames = [];

let allPkmResource = [];

function init() {
  loadData("/pokemon?limit=20&offset=0");
}

async function loadData(path = "") {
  showLoadingSpinner();
  let initialData = await fetch(BASE_URL + path + ".json");
  allNames = await initialData.json();
  console.log(allNames.results);
  loadDetails(allNames.results);
  //renderPkmCards(allNames.results);
}

async function loadDetails(allNames) {
  let pkmDetails = "";
  for (let indexPkm = 0; indexPkm < allNames.length; indexPkm++) {
    let response = await fetch(allNames[indexPkm].url);
    pkmDetails = await response.json();
    allPkmResource.push(pkmDetails);
  }
  console.log(allPkmResource);
  hideLoadingSpinner();
  renderPkmCards();
}

function renderPkmCards(allNames) {
  let pkmCard = document.getElementById("content");
  for (let indexPkm = 0; indexPkm < allPkmResource.length; indexPkm++) {
    pkmCard.innerHTML += `
     <div class="pkmCard" onclick="showOverlay(${indexPkm})" id="pkm_details${indexPkm}">
      <div class="pkmCard_upper_section"><p class="left full-width"># ${
        indexPkm + 1
      }</p><p class="center full-width uppercase">${
      allPkmResource[indexPkm].name
    }</p><p class="full-width" ></p></div>
      <div class="pkmCard_middle_section bg_${
        allPkmResource[indexPkm].types[0].type.name
      }">
        <img class="pkmCardImg" src="${
          allPkmResource[indexPkm].sprites.other["official-artwork"].front_shiny
        }" alt="pokemon_img"></div>
      <div class="pkmCard_lower_section">
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
}

function fillDialog(indexPkm) {
  return `<div onclick="event.stopPropagation()" id="dialog" class="dialog prevent-select">
            <div class="dialogCard">
              <div class="pkmCard_upper_section">
                <p class="left full-width"># ${indexPkm + 1}</p>
                <p class="center full-width uppercase">${
                  allPkmResource[indexPkm].name
                }</p>
                <p onclick="hideOverlay()" class="full-width right highlight" >x</p>
              </div>
              <div class="pkmCard_middle_section bg_${
                allPkmResource[indexPkm].types[0].type.name
              }">
                <img class="pkmCardImg" src="${
                  allPkmResource[indexPkm].sprites.other["official-artwork"]
                    .front_shiny
                }" alt="pokemon_img">
              </div>
              <div class="pkmCard_lower_section">
                <span onclick="previousPkm(${
                  indexPkm - 1
                })" class="left_arrow highlight"><</span>
                <span onclick="nextPkm(${
                  indexPkm + 1
                })" class="right_arrow highlight">></span>
              </div>
            </div>
          </div>`;
}

function hideOverlay() {
  document.getElementById("overlay").classList.add("d_none");
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
}

function hideLoadingSpinner() {
  loadingSpinnerRef.classList.add("d_none");
}
