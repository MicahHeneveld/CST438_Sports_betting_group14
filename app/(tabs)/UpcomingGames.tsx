import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { callGames } from "../../ApiScripts";
import { getAllFavTeamInfo, logDatabaseContents } from "../../database/db";
import { useFocusEffect } from "expo-router";

interface Game {
  id: string;
  gameDate: string;
  homeTeamId: number;  
  awayTeamId: number;
  homeTeamScore: number;
  awayTeamScore: number;
}

const UpcomingGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string | null>(null);

  // Fetch username from AsyncStorage
  useEffect(() => {
    const fetchUserName = async () => {
      const storedUserName = await AsyncStorage.getItem("username");
      if (storedUserName) {
        setUserName(storedUserName);
        console.log("Fetched Username: ", storedUserName);
      } else {
        console.warn("⚠️ No username found in AsyncStorage");
      }
    };
    fetchUserName();
  }, []);

  // Reusable fetchGames function
  const fetchGames = useCallback(async () => {
    if (!userName) return;
    setLoading(true);

    try {
      await logDatabaseContents();

      const favTeams = await getAllFavTeamInfo(userName);
      const favTeamIds = favTeams.map((team: any) => team[0]);
      if (favTeamIds.length === 0) {
        console.warn("No favorite teams found.");
        setGames([]);
        return;
      }

      // Calculate date range (next 14 days)
      const currentDate = new Date();
      const endDate = new Date(currentDate);
      endDate.setDate(currentDate.getDate() + 14);

      console.log("Fetching all games and filtering...");

      // Fetch all games from API
      const allGames = await callGames();

      const filteredGames = allGames.filter((game) => {
        const gameDate = new Date(game.gameDate);
        const isInDateRange = gameDate >= currentDate && gameDate <= endDate;
        const isFavTeam = favTeamIds.includes(game.homeTeamId) || favTeamIds.includes(game.awayTeamId);
        return isInDateRange && isFavTeam;
      });

      // Sort by date
      filteredGames.sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime());

      if (filteredGames.length === 0) {
        console.warn("No upcoming games found for favorite teams.");
      } else {
        console.log(`✅ Found ${filteredGames.length} upcoming games`);
      }

      setGames(filteredGames);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchGames();
  }, [userName, fetchGames]);

  useFocusEffect(
    useCallback(() => {
      console.log("🔄 re-fetching games...");
      fetchGames();
    }, [fetchGames])
  );

  if (loading)
    return (
      <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Games for Your Teams</Text>
      {games.length === 0 ? (
        <Text style={styles.errorText}>No upcoming games found.</Text>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.gameItem}>
              <Text style={styles.teamText}>
                Team {item.homeTeamId} vs Team {item.awayTeamId}
              </Text>
              <Text style={styles.dateText}>
                {new Date(item.gameDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  gameItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 12,
  },
  teamText: {
    fontSize: 16,
    textAlign: "center",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default UpcomingGames;
