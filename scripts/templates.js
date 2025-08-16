function getTypeIconsTemplate(typeName) {
  return `
    <div class="icon ${typeName}">
      <img 
        src="./assets/svg/${typeName}.svg" 
        alt="${typeName} icon" 
        class="type_icon"
      />
    </div>
  `;
}

function getTypeAbilitiesTemplate(abilitiesText) {
  return `<p>${abilitiesText}</p>`;
}

function getStatRowTemplate(name, percentage, value) {
  return `
    <tr>
      <td>${name}</td>
      <td>
        <div class="statBarOuter">
          <div class="statBarInner" style="width:${percentage}%;"></div>
        </div>
      </td>
      <td style="padding-left:8px;">${value}</td>
    </tr>
  `;
}

function renderPkmCardsTemplate(pokemon, indexPkm) {
  return `
    <div class="pkmCard clickable scale_effect" onclick="showOverlay(${indexPkm})" id="pkm_details${indexPkm}">
      <div class="pkmCard_upper_section">
        <p class="left full-width"># ${indexPkm + 1}</p>
        <p class="center full-width uppercase">${pokemon.name}</p>
        <p class="full-width"></p>
      </div>
      <div class="pkmCard_middle_section ${pokemon.types[0].type.name}">
        <img 
          class="pkmCardImg" 
          src="${pokemon.sprites.other["official-artwork"].front_shiny}" 
          alt="pokemon_img"
        >
      </div>
      <div class="pkmCard_lower_section">
        ${getTypeIcons(pokemon)}
      </div>
    </div>
  `;
}

function fillDialogTemplate(indexPkm) {
  return `<div  id="dialog" class="dialog prevent-select">
            <div class="dialogCard_upper_section half-height">
              <div
                class="pkmCard dialog_width" id="pkm_details${indexPkm}">
                <div class="pkmCard_upper_section">
                  <p class="left full-width"># ${indexPkm + 1}</p>
                  <p class="center full-width uppercase">
                    ${allPkmResource[indexPkm].name}
                  </p>
                  <span onclick="hideOverlay()" class="close_img clickable highlight full-width right" >x</span>
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
                <div class="pkmCard_lower_section dialog_version">
                  <span onclick="previousPkm(${
                    indexPkm - 1
                  })" class="left_arrow clickable highlight"><</span>
                  <div class="icons">
                    ${getTypeIcons(allPkmResource[indexPkm])}
                  </div>
                  <span onclick="nextPkm(${
                    indexPkm + 1
                  })" class="right_arrow clickable highlight">>
                  </span>
                </div>
              </div>
            </div>
            <div class="dialogCard_lower_section half-height"> 
              <section class="category_selection">
                <button class="${
                  activeCategoryId === "pkm_info_container" ? "active" : ""
                }" 
                        onclick="showCategory('pkm_info_container', 'pkm_stats_container', 'pkm_evochain_container', this)">Main</button>
                <button class="${
                  activeCategoryId === "pkm_stats_container" ? "active" : ""
                }" 
                        onclick="showCategory('pkm_stats_container', 'pkm_info_container', 'pkm_evochain_container', this)">Stats</button>
                <button class="${
                  activeCategoryId === "pkm_evochain_container" ? "active" : ""
                }" 
                        onclick="showCategory('pkm_evochain_container', 'pkm_info_container', 'pkm_stats_container', this)">Evo chain</button>
              </section>       
              
              <div id="pkm_info_container" class="${
                activeCategoryId === "pkm_info_container" ? "" : "d_none"
              }">
                  <table class="infoTable">
                    <tr><td><p><b>Height:</b></p></td><td><p>${
                      allPkmResource[indexPkm].height
                    }</p></td></tr>
                    <tr><td><p><b>Weight:</b></p></td><td><p>${
                      allPkmResource[indexPkm].weight
                    }</p></td></tr>
                    <tr><td><p><b>Base Experience:</b></p></td><td><p>${
                      allPkmResource[indexPkm].base_experience
                    }</p></td></tr>  
                    <tr><td><p><b>Abilities:</b></p></td><td><p>${getTypeAbilities(
                      allPkmResource[indexPkm]
                    )}</p></td></tr>  
                  </table>
              </div>
              <div id="pkm_stats_container" class=" uppercase ${
                activeCategoryId === "pkm_stats_container" ? "" : "d_none"
              }">
                ${getStatsBars(allPkmResource[indexPkm])}
              </div>
              <div id="pkm_evochain_container" class="${
                activeCategoryId === "pkm_evochain_container" ? "" : "d_none"
              }"></div>
            </div>  
          </div>`;
}

function getEvolutionStageTemplate(name, imageUrl) {
  return `
    <div class="evoStage">
      <img src="${imageUrl}" alt="${name}">
      <p class="uppercase">${name}</p>
    </div>
  `;
}

function getEvolutionArrowTemplate() {
  return `<span class="evoArrow"> ➜ </span>`;
}
