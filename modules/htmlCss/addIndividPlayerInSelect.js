export default function AddIndividPlayerInSelect(playerStats) {
  const selectIndividPlayerContainer = document.getElementById("selectPlayer");

  for (let playerId in playerStats) {
    const option = document.createElement("option");
    option.value = playerId;
    option.innerText = playerStats[playerId].name;
    selectIndividPlayerContainer.append(option);
  }
  selectIndividPlayerContainer.value = "";
  console.log(selectIndividPlayerContainer.options[0]);
}

// <option value="">-- Оберіть місто --</option>
//       <option value="kyiv">Київ</option>
//       <option value="lviv">Львів</option>
