function fillDialog(indexPkm, allNames) {
  return `<div onclick="event.stopPropagation()" id="dialog" class="dialog pkmCard prevent-select">
            <span onclick="hideOverlay()" class="close_img highlight" >x</span>
            <div class="pkmCard_upper_section">
              <p class="left full-width"># ${indexPkm + 1}</p>
              <p class="center full-width uppercase">${
                allNames[indexPkm].name
              }</p>
              <p class="full-width" ></p>
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
          `;
}
