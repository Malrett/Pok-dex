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
  let pkmDetails;
  for (let indexPkm = 0; indexPkm < allNames.length; indexPkm++) {
    let response = await fetch(allNames[indexPkm].url);
    pkmDetails = await response.json();
    allPkmResource.push(pkmDetails);
  }
  console.log(allPkmResource);
  hideLoadingSpinner();
  renderPkmCards(allNames);
}

function renderPkmCards(allNames) {
  let pkmCard = document.getElementById("content");
  let pkmId;
  for (let indexPkm = 0; indexPkm < allNames.length; indexPkm++) {
    pkmCard.innerHTML += `
     <div class="pkmCard" onclick="showOverlay(${indexPkm})" id="pkm_details${indexPkm}">
      <div class="pkmCard_upper_section"><p class="left full-width"># ${indexPkm + 1}</p><p class="center full-width uppercase">${allNames[indexPkm].name}</p><p class="full-width" ></p></div>
      <div class="pkmCard_middle_section bg_${allPkmResource[indexPkm].types[0].type.name}">
        <img class="pkmCardImg" src="${allPkmResource[indexPkm].sprites.other["official-artwork"].front_shiny}" alt="pokemon_img"></div>
      <div class="pkmCard_lower_section"></div>
    </div>
    
    `;
  }
}

function showLoadingSpinner() {
  loadingSpinnerRef.classList.remove("d_none");
}

function hideLoadingSpinner() {
  loadingSpinnerRef.classList.add("d_none");
}
