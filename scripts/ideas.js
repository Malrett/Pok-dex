function renderPokemon() {
  const POKEMON_CONTAINER = document.getElementById("pokemon");
  for (let index = 0; index < allPokemon.length; index++) {
    POKEMON_CONTAINER.innerHTML += getPokemonTemplate(index);
    checkSecondType(index);
    // getPokemonForms(index)
  }
}

function getPokemonTemplate(index) {
  return `
        <div class="card">
            <div class="card-id-name">
                <span>#${allPokemon[index].id}</span>
                <h3>${allPokemon[index].name}</h3>
            </div>

            <div class="pokemon-img" >
                <img src="${allPokemon[index].sprites.front_default}">
             </div>

             <div id="pokemon-types-${index}" class="pokemon-types" >
                <img src="./assets/icons-type/${allPokemon[index].types[0].type.name}.svg"> 
                
             </div>
        </div>
    `;
}

function checkSecondType(index) {
  const SECOND_TYPE = allPokemon[index].types[1];
  const TYPE_CONTAINER = document.getElementById(`pokemon-types-${index}`);
  if (SECOND_TYPE) {
    TYPE_CONTAINER.innerHTML += `<img src="./assets/icons-type/${SECOND_TYPE.type.name}.svg"> `;
  }
}
