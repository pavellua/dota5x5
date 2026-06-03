const selectIndividPlayerContainer = document.getElementById(
  "selectIndividPlayer",
);

export default function AddIndividPlayerInSelect(playerStats) {


    
  for (let playerId in playerStats) {
    const option = document.createElement("option");
    option.value = playerId;
    option.innerText = playerStats[playerId].name;
    selectIndividPlayerContainer.append(option);
  }
  console.log(playerStats);
}

// <option value="">-- Оберіть місто --</option>
//       <option value="kyiv">Київ</option>
//       <option value="lviv">Львів</option>
