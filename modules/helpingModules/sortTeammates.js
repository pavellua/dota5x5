export default function SortTeammates(sortingData, sortParam) {
  let sortMas = Object.entries(sortingData).sort((a, b) => {
    return b[1][sortParam] - a[1][sortParam];
  });

  let sortObject = Object.fromEntries(sortMas);

  console.log(sortObject);
  return sortObject;
}
