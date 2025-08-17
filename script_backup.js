const BASE_URL = "https://pokeapi.co/api/v2";
const loadingSpinnerRef = document.getElementById("loading_spinner");
const loadingBtnRef = document.getElementById("loadingBtn");
let apiOffset = 0;
let allNames = [];
let allPkmResource = [];
let evoChainCache = {};
let pkmDataCache = {};
let activeCategoryId = "pkm_info_container"; // Standard ist "Main" let currentSearchQuery = "";

function init() {
  loadData();
  initPokemonSearch();
}

async function loadData(path = "") {
  toggleLoading(true); // Spinner an, Button aus
  try {
    const data = await fetchPokemonList();
    const startIndex = allPkmResource.length; // Startindex merken (vor dem Einfügen)
    allNames.push(...data.results); // Namen in Order
    await loadDetails(data.results); // Details laden (geordnet einfügen)
    renderPkmCards(startIndex); // Nur neue Karten rendern
  } catch (err) {
    handleLoadError(err);
  } finally {
    toggleLoading(false); // Spinner aus, Button an
  }
}

async function fetchPokemonList() {
  const response = await fetch(`${BASE_URL}/pokemon?limit=20&offset=${apiOffset}`);
  if (!response.ok) throw new Error(`HTTP-Fehler:         ${response.status}`);
  return response.json();
}

function handleLoadError(err) {
  console.error("Error loading Pokémon list:", err);
  alert("Couldn't load Pokémons. PLease try again later.");
}

async function loadMoreData() {
  apiOffset += 20;
  await loadData();
  applySearchFilter(); // Filter bleibt aktiv
}

async function preloadEvolutionChain(pokemon) {
  if (evoChainCache[pokemon.name]) return;
  try {
    const evoNames = await getEvolutionNames(pokemon);
    await preloadEvolutionImages(evoNames);
    await cacheEvolutionHTML(pokemon.name, evoNames);
  } catch (err) {
    logEvolutionWarning(pokemon.name, err);
  }
}

async function getEvolutionNames(pokemon) {
  //kümmert sich um das Abrufen und Parsen der Evolutionsnamen
  const speciesData = await fetchSpeciesData(pokemon);
  const evoChainData = await fetchEvolutionChain(speciesData);
  return parseEvolutionNames(evoChainData.chain);
}

async function preloadEvolutionImages(evoNames) {
  //lädt alle Bilder vor und cached sie im Browser
  await Promise.all(
    evoNames.map(async (name) => {
      const pkmData = await fetchPokemonDataByName(name);
      const imageUrl = pkmData.sprites.other["official-artwork"].front_default;
      const img = new Image();
      img.src = imageUrl;
    })
  );
}

async function cacheEvolutionHTML(pokemonName, evoNames) {
  //baut das HTML und speichert es im Cache
  const evoHTML = await buildEvolutionHTML(evoNames);
  evoChainCache[pokemonName] = evoHTML;
}

function logEvolutionWarning(pokemonName, err) {
  //einheitliche Fehlerausgabe
  console.warn(`Evo-Chain could not be pre-cached: ${pokemonName}`, err);
}

async function loadDetails(pokemonList) {
  try {
    const detailsArray = await fetchAllPokemonDetails(pokemonList);
    storePokemonDetails(detailsArray);
  } catch (err) {
    handleDetailsLoadError(err);
  }
}

async function fetchAllPokemonDetails(pokemonList) {
  const detailPromises = pokemonList.map((pkm) =>
    fetch(pkm.url).then((res) => {
      if (!res.ok) throw new Error(`HTTP-error at ${pkm.name}: ${res.status}`);
      return res.json();
    })
  );
  return Promise.all(detailPromises);
}

function storePokemonDetails(detailsArray) {
  const base = allPkmResource.length;
  detailsArray.forEach((d, i) => {
    allPkmResource[base + i] = d; // Reihenfolge stabil
    pkmDataCache[d.name] = d; // optional: in den Cache
    preloadEvolutionChain(d); // async, blockiert nicht
  });
}

function handleDetailsLoadError(err) {
  console.error("Error while loading Pokémon-Details:", err);
  alert("Some Pokémons could not be loaded.");
}

// Holt die Typen-Icons als HTML-String
function getTypeIcons(pokemon) {
  if (!pokemon.types || pokemon.types.length === 0) {
    return "";
  }
  return pokemon.types.map((t) => getTypeIconsTemplate(t.type.name)).join("");
}

function getTypeAbilities(pokemon) {
  if (!pokemon.abilities || pokemon.abilities.length === 0) {
    return "";
  }
  const abilitiesText = pokemon.abilities.map((a) => a.ability.name).join(", ");
  return getTypeAbilitiesTemplate(abilitiesText);
}

function getStatsBars(pokemon) {
  const maxStatValue = 255;
  if (!pokemon.stats || pokemon.stats.length === 0) {
    return "";
  }
  let html = `<table class=" table statsTable">`;
  pokemon.stats.forEach((statObj) => {
    const value = statObj.base_stat;
    const name = statObj.stat.name;
    const percentage = Math.max(1, (value / maxStatValue) * 100); // mind. 1%
    html += getStatRowTemplate(name, percentage, value);
  });
  html += html += `</table>`;
  return html;
}

function renderPkmCards(startIndex) {
  let pkmCard = document.getElementById("content");
  for (let indexPkm = startIndex; indexPkm < allPkmResource.length; indexPkm++) {
    const pokemon = allPkmResource[indexPkm];
    pkmCard.innerHTML += renderPkmCardsTemplate(pokemon, indexPkm);
  }
}

function showOverlay(indexPkm) {
  let dialogContent = document.getElementById("overlay");
  dialogContent.innerHTML = "";
  document.getElementById("overlay").classList.remove("d_none");
  dialogContent.innerHTML += fillDialogTemplate(indexPkm);
  document.body.classList.add("hide"); // Falls Evo-Tab aktiv war, direkt Evolution Chain laden
  if (activeCategoryId === "pkm_evochain_container") {
    loadEvolutionChain(indexPkm);
  }
}

async function fetchJSON(url, errorMessage = "HTTP error") {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${errorMessage}: ${res.status}`);
  return res.json();
}

async function fetchSpeciesData(pokemon) {
  return fetchJSON(pokemon.species.url, "Error loading Species-Data");
}

async function fetchEvolutionChain(speciesData) {
  return fetchJSON(speciesData.evolution_chain.url, "Error loading Evolution Chain");
}

function parseEvolutionNames(chain) {
  const evoNames = [];
  function traverse(chainPart) {
    evoNames.push(chainPart.species.name);
    if (chainPart.evolves_to.length > 0) {
      chainPart.evolves_to.forEach((next) => traverse(next));
    }
  }
  traverse(chain);
  return evoNames;
}

async function fetchPokemonDataByName(name) {
  const cached = getPokemonFromCache(name) || getPokemonFromResource(name);
  if (cached) return cached;
  const pkmData = await fetchPokemonFromAPI(name);
  pkmDataCache[name] = pkmData;
  return pkmData;
}

function getPokemonFromCache(name) {
  return pkmDataCache[name] || null;
}

function getPokemonFromResource(name) {
  const found = allPkmResource.find((p) => p.name === name);
  if (found) {
    pkmDataCache[name] = found;
    return found;
  }
  return null;
}

async function fetchPokemonFromAPI(name) {
  return fetchJSON(`${BASE_URL}/pokemon/${name}, Fehler beim Laden von ${name}`);
}

async function buildEvolutionHTML(evoNames) {
  const evoHTMLParts = [];
  for (let i = 0; i < evoNames.length; i++) {
    const name = evoNames[i];
    const pkmData = await fetchPokemonDataByName(name);
    const imageUrl = pkmData.sprites.other["official-artwork"].front_default;
    evoHTMLParts.push(getEvolutionStageTemplate(name, imageUrl));
    if (i < evoNames.length - 1) {
      evoHTMLParts.push(getEvolutionArrowTemplate());
    }
  }
  return evoHTMLParts.join("");
}

async function loadEvolutionChain(pokemonIndex) {
  //ist jetzt ein reiner Ablaufplan (Lesbarkeit + Wartbarkeit)
  const pokemon = allPkmResource[pokemonIndex];
  if (showEvolutionFromCache(pokemon)) return;
  try {
    await preloadEvolutionChain(pokemon);
    displayEvolutionHTML(pokemon.name);
  } catch (err) {
    handleEvolutionChainError(err);
  }
}

function showEvolutionFromCache(pokemon) {
  //kümmert sich nur um den Cache-Check und die Anzeige
  if (evoChainCache[pokemon.name]) {
    document.getElementById("pkm_evochain_container").innerHTML = evoChainCache[pokemon.name];
    return true;
  }
  return false;
}

function displayEvolutionHTML(pokemonName) {
  //setzt das HTML im DOM
  document.getElementById("pkm_evochain_container").innerHTML = evoChainCache[pokemonName] || "<p>No evolution data available.</p>";
}

function handleEvolutionChainError(err) {
  //Fehlerbehandlung und die Fallback-Anzeige
  console.error("Error loading Evolution Chain:", err);
  document.getElementById("pkm_evochain_container").innerHTML = "<p>No evolution data available.</p>";
}

function showCategory(showContainer1, hideContainer2, hideContainer3, btn) {
  //ist jetzt nur noch ein Ablaufplan, leicht lesbar
  activeCategoryId = showContainer1;
  toggleContainers(showContainer1, hideContainer2, hideContainer3);
  updateActiveCategoryButton(btn);
  maybeLoadEvolutionChain(showContainer1);
}

function toggleContainers(showId, hideId1, hideId2) {
  // kümmert sich rein um Sichtbarkeit der Container
  document.getElementById(showId).classList.remove("d_none");
  document.getElementById(hideId1).classList.add("d_none");
  document.getElementById(hideId2).classList.add("d_none");
}

function updateActiveCategoryButton(btn) {
  document.querySelectorAll(".category_selection button").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function maybeLoadEvolutionChain(showId) {
  //lädt Evolutionsdaten nur bei Bedarf
  if (showId !== "pkm_evochain_container") return;
  if (document.getElementById(showId).hasChildNodes()) return;
  const currentIndex = getCurrentOverlayPokemonIndex();
  if (currentIndex !== null) {
    loadEvolutionChain(currentIndex);
  }
}

// Hilfsfunktion: Pokémon-Index aus aktuellem Overlay ermitteln
function getCurrentOverlayPokemonIndex() {
  const overlay = document.getElementById("overlay");
  if (!overlay) return null;
  const pkmCard = overlay.querySelector(".pkmCard");
  if (!pkmCard || !pkmCard.id) return null; // ID hat Form "pkm_detailsX" → Index extrahieren
  const match = pkmCard.id.match(/pkm_details(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function hideOverlay() {
  document.getElementById("overlay").classList.add("d_none");
  document.body.classList.remove("hide");
  activeCategoryId = "pkm_info_container"; // zurück auf Main
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

function toggleLoading(show) {
  loadingSpinnerRef.classList.toggle("d_none", !show);
  loadingBtnRef.classList.toggle("d_none", show);
}

//≥ 3 Buchstaben → Filter aktiv, sucht gleichzeitig in: pokemon.name, pokemon.types[*].type.name (z. B. "fire", "water")
// Nach „Load More“ wird sofort mit dem aktuellen Suchtext erneut gefiltert.
// Wenn Eingabe kürzer als 3 Zeichen → alle Pokémon anzeigen

function initPokemonSearch() {
  const inp = document.getElementById("pokemonSearch");
  const clear = document.getElementById("clearSearch");
  if (!inp) return;
  inp.addEventListener("input", handleSearchInput);
  clear.addEventListener("click", () => {
    inp.value = "";
    currentSearchQuery = "";
    applySearchFilter();
  });
}

//nur für Eingabe-Event zuständig
function handleSearchInput(e) {
  currentSearchQuery = e.target.value.trim().toLowerCase();
  document.getElementById("clearSearch").style.display = currentSearchQuery ? "block" : "none";
  applySearchFilter();
}

//steuert Ablauf zwischen Vollanzeige & Filter

function applySearchFilter() {
  const results = currentSearchQuery ? filterPokemon(currentSearchQuery) : allPkmResource;
  renderPokemonList(results, !!currentSearchQuery);
  showDropdownResults(results);
  toggleLoadMoreButton();
}

//filtert nach Namen oder Typ
function filterPokemon(q) {
  return allPkmResource.filter((p) => p.name.toLowerCase().includes(q) || p.types?.some((t) => t.type.name.toLowerCase().includes(q)));
}

//kümmert sich ums Rendern, optional mit Original-Index
function renderPokemonList(list, keepIndex = false) {
  const c = document.getElementById("content");
  c.innerHTML = "";
  list.forEach((p, i) => {
    const idx = keepIndex ? allPkmResource.findIndex((ap) => ap.name === p.name) : i;
    c.innerHTML += renderPkmCardsTemplate(p, idx);
  });
}

function createDropdownItem(p, inp, dd) {
  const div = Object.assign(document.createElement("div"), { textContent: p.name });
  div.onclick = () => {
    inp.value = p.name;
    currentSearchQuery = p.name.toLowerCase();
    dd.style.display = "none";
    renderPokemonList([p], true);
    toggleLoadMoreButton();
  };
  return div;
}

function showDropdownResults(results) {
  const dd = document.getElementById("searchDropdown");
  const inp = document.getElementById("pokemonSearch");
  dd.innerHTML = "";
  if (!currentSearchQuery) return (dd.style.display = "none");
  results.slice(0, 10).forEach((p) => dd.appendChild(createDropdownItem(p, inp, dd)));
  dd.style.display = results.length ? "block" : "none";
}

function toggleLoadMoreButton() {
  document.getElementById("loadingBtn").classList.toggle("d_none", !!currentSearchQuery);
}

function showLegalOverlay(templateFn, withBodyHide = false) {
  const legalRef = document.getElementById("legal_overlay_container");
  legalRef.classList.remove("d_none");
  legalRef.innerHTML = templateFn();
  if (withBodyHide) document.body.classList.add("hide");
}

function closeLegalOverlay() {
  document.getElementById("legal_overlay_container").classList.add("d_none");
  document.body.classList.remove("hide");
}

function showImprint() {
  showLegalOverlay(getImprintTemplate);
}
function showPolicy() {
  showLegalOverlay(getPolicyTemplate, true);
}
