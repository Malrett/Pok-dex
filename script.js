const BASE_URL = "https://pokeapi.co/api/v2";

let allNames = [];

function init() {
  loadData("/pokemon?limit=20&offset=0");
}

async function loadData(path = "") {
  let response = await fetch(BASE_URL + path + ".json");
  allNames = await response.json();
  console.log(allNames);
}
