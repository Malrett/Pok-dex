const BASE_URL = "https://pokeapi.co/api/v2";

let allNames = [];

function init() {
  loadData("/pokemon?limit=20&offset=0");
}

async function loadData(path = "") {
  let response = await fetch(BASE_URL + path + ".json");
  allNames = await response.json();
  console.log(allNames.results);
  renderPkmCards(allNames.results);
}

function renderPkmCards(allNames) {
  let pkmCard = document.getElementById("poke_cards");
  //let allNames = allNames.results;
  for (let indexPkm = 0; indexPkm < allNames.length; indexPkm++) {
    pkmCard.innerHTML += `
    <div><button onclick="showOverlay(${indexPkm})" id="pkm_details${indexPkm}">${allNames[indexPkm].name}</button></div>
    `;
  }
}
