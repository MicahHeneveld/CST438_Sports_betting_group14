// heroku backend API URL
const API_BASE_URL = 'https://jump-ball-df460ee69b61.herokuapp.com/api';


export const apiCall = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json", 
      },
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const callTeams = async () => {
  try {
    const json = await apiCall("/teams/all");
    
    if (!json || json.length === 0) {
      throw new Error("Invalid API response");
    }
    // the data we want to show. this was the project's owner was using last semester.
    //  I'm just doing the same thing
    const teamData = json  
      .map((team) => ({
        id: team.id,
        name: team.name,
        nickname: team.nickname,
        logo: team.logo,
      }));

    return teamData;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};

export const getGamesByTeams= async () => {
  try {
    const json = await apiCall("/games/teams/all");
    
    if (!json || json.length === 0) {
      throw new Error("Invalid API response");
    }
    // the data we want to show. this was the project's owner was using last semester.
    //  I'm just doing the same thing
    const teamData = json  
      .map((team) => ({
        id: team.id,
        name: team.name,
        nickname: team.nickname,
        logo: team.logo,
      }));

    return teamData;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};


export const callGamesByDate = async (startDate, endDate, teamID) => {
  try {
    const json = await apiCall(
      `https://api-nba-v1.p.rapidapi.com/games?league=standard&season=2024&team=${teamID}`
    );
    if (!json || !json.response) {
      throw new Error("Invalid API response");
    }
    // Filter games based on the provided date range. It was a lot easier to filter out games outside the range
    // than to select each date in the range and check.
    // this also prevents having to check if there is a game on a specific date
    const gameData = json.response
      .filter((game) => {
        const gameDate = new Date(game.date.start);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return gameDate >= start && gameDate <= end;
      })
      // I think I could make call Teams redundant with this stuff at some point.
      .map((game) => ({
        id: game.id,
        date: new Date(game.date.start),
        homeTeam: {
          id: game.teams.home.id,
          name: game.teams.home.name,
          nickname: game.teams.home.nickname,
          logo: game.teams.home.logo,
        },
        awayTeam: {
          id: game.teams.visitors.id,
          name: game.teams.visitors.name,
          nickname: game.teams.visitors.nickname,
          logo: game.teams.visitors.logo,
        },
      }));
    return gameData; // Return the filtered and mapped game data
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};