// heroku backend API URL
const API_BASE_URL = 'https://jump-ball-df460ee69b61.herokuapp.com/api';

export const apiCall = async (endpoint) => {
  try {
    console.log("Calling:", `${API_BASE_URL}${endpoint}`);  
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json", 
      },
       credentials: "include", // send cookies if needed
    });
    
    console.log("Response status:", response.status); 
    
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    

    const contentType = response.headers.get("content-type");
    console.log("Content-Type:", contentType);  
    
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Response is not JSON:", text.substring(0, 200));
      throw new Error("Response is not JSON");
    }
    
    const json = await response.json();
    console.log("Successfully parsed JSON, data length:", json.length); 
    return json;
  } catch (error) {
    console.error("API Call Error:", error);
    return null;
  }
};


// all teams from backend
export const callTeams = async () => {
  try {
    const json = await apiCall("/teams/all");
    
    if (!json || json.length === 0) {
      throw new Error("Invalid API response");
    }

    const teamData = json  
      .map((team) => ({
        id: team.id,
        name: team.name,
        nickname: team.nickname,
        logo: team.logo,
      }));

    console.log("Returning team data, count:", teamData.length);  
    return teamData;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};

//all games 
export const getGamesByTeams = async () => {
  try {
    const json = await apiCall("/games/all");
    
    if (!json || json.length === 0) {
      throw new Error("Invalid API response");
    }

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
    const json = await apiCall(`/games/team/${teamID}`);
    
    if (!json || json.length === 0) {
      throw new Error("Invalid API response");
    }

    const gameData = json
      .filter((game) => {
        const gameDate = new Date(game.gameDateEst);  
        const start = new Date(startDate);
        const end = new Date(endDate);
        return gameDate >= start && gameDate <= end;
      })
      .map((game) => ({
        id: game.gameId,  
        date: new Date(game.gameDateEst), 
        homeTeamId: game.homeTeamId,  
        awayTeamId: game.awayTeamId,
      }));
      
    return gameData;
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};