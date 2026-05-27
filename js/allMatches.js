import { GetData } from "../modules/dataStore.js";
import ShowAllGames from "../modules/htmlCss/showAllGames.js";
let data = await GetData();

ShowAllGames(data);
