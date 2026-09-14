const playerRolesContainer = document.getElementById("playerRolesContainer");

const rolesTable = playerRolesContainer.querySelector("table");
const tableBody = rolesTable.querySelector("tbody");

export default function ShowPlayerRoles(playerStats, playerId, data) {
  const activeIndividContainer = document.querySelector(
    ".activeIndividContainer",
  );
  activeIndividContainer
    ? activeIndividContainer.classList.remove("activeIndividContainer")
    : null;
  playerRolesContainer.classList.add("activeIndividContainer");
  [...individualContainerInfo.children].forEach(
    (element) => (element.style.display = "none"),
  );
  playerRolesContainer.style.display = "block";

  tableBody.innerHTML = "";
  const playerRoles = playerStats[playerId].roles;

  const playerRolesMas = Object.entries(playerRoles)
    .map(([roleNumber, data]) => ({
      role: roleNumber,
      wins: data.wins,
      losses: data.lose,

      winrate: Math.round((data.wins / (data.wins + data.lose)) * 100),
    }))
    .sort((a, b) => a.role - b.role);
  console.log(playerRolesMas);
  for (let playerRole of playerRolesMas) {
    const winsNumber = playerRole.wins;
    const loseNumber = playerRole.losses;
    const gamesNumber = winsNumber + loseNumber;
    const winrate = playerRole.winrate;
    const roleTr = document.createElement("tr");
    tableBody.append(roleTr);
    roleTr.innerHTML = `

    
    <td>${roleName(playerRole.role)}</td>
    <td class="greenTd">${winsNumber}</td>
<td class="redTd">${loseNumber}</td>

    <td>${gamesNumber}</td>
 <td  class="winrate">${winrate}%</td>
     
`;
  }
}

function roleName(roleNumber) {
  let roleName;
  switch (roleNumber) {
    case "1":
      roleName = "Carry";
      break;
    case "2":
      roleName = "Midlaner";
      break;
    case "3":
      roleName = "Offlaner";
      break;
    case "4":
      roleName = "Soft Support";
      break;
    case "5":
      roleName = "Hard Support";
      break;

    default:
      break;
  }

  return roleName;
}
