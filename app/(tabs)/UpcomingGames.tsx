import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { callGames, callTeams } from "../../ApiScripts";
import { useFocusEffect } from "expo-router";

interface Game {
  id: string;
  gameDate: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamScore: number;
  awayTeamScore: number;
}

interface Team {
  id: string;
  name: string;
  logo: string;
  city: string;
}

const UpcomingGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGamesAndTeams = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching teams and games...");

      // Fetch both datasets in parallel
      const [gameData, teamData] = await Promise.all([callGames(), callTeams()]);

      // Map team IDs for quick lookup
      const teamMap: Record<string, Team> = {};
      teamData.forEach((team) => {
        teamMap[team.id] = team;
      });

      // Only show games in next 14 days
      const currentDate = new Date();
      const endDate = new Date();
      endDate.setDate(currentDate.getDate() + 14);

      const filteredGames = gameData.filter((game) => {
        const gameDate = new Date(game.gameDate);
        return gameDate >= currentDate && gameDate <= endDate;
      });

      // Sort by date
      filteredGames.sort(
        (a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime()
      );

      setTeams(teamMap);
      setGames(filteredGames);
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGamesAndTeams();
  }, [fetchGamesAndTeams]);

  useFocusEffect(
    useCallback(() => {
      console.log("Refreshing Upcoming Games");
      fetchGamesAndTeams();
    }, [fetchGamesAndTeams])
  );

  if (loading) {
    return (
      <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
    );
  }

  const renderGameItem = ({ item }: { item: Game }) => {
    const homeTeam = teams[item.homeTeamId];
    const awayTeam = teams[item.awayTeamId];

    return (
      <View style={styles.gameItem}>
        <View style={styles.teamRow}>
          {/* Away Team */}
          <View style={styles.teamContainer}>
            {awayTeam?.logo ? (
              <Image source={{ uri: awayTeam.logo }} style={styles.logo} />
            ) : (
              <View style={styles.placeholderLogo} />
            )}
            <Text style={styles.teamName}>
              {awayTeam?.name || `Team ${item.awayTeamId}`}
            </Text>
          </View>

          <Text style={styles.vsText}>vs</Text>

          {/* Home Team */}
          <View style={styles.teamContainer}>
            {homeTeam?.logo ? (
              <Image source={{ uri: homeTeam.logo }} style={styles.logo} />
            ) : (
              <View style={styles.placeholderLogo} />
            )}
            <Text style={styles.teamName}>
              {homeTeam?.name || `Team ${item.homeTeamId}`}
            </Text>
          </View>
        </View>

        <Text style={styles.dateText}>
          {new Date(item.gameDate).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Games</Text>
      {games.length === 0 ? (
        <Text style={styles.errorText}>No upcoming games found.</Text>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGameItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  gameItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  teamRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  teamContainer: { alignItems: "center", flex: 1 },
  logo: { width: 50, height: 50, resizeMode: "contain" },
  placeholderLogo: { width: 50, height: 50, backgroundColor: "#ccc", borderRadius: 25 },
  teamName: { fontSize: 14, fontWeight: "600", textAlign: "center", marginTop: 5 },
  vsText: { fontSize: 16, fontWeight: "bold", marginHorizontal: 10 },
  dateText: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 6 },
});

export default UpcomingGames;
