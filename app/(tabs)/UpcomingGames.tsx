import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { callGamesByDate } from "../../ApiScripts";
import { getAllFavTeamInfo, logDatabaseContents } from "../../database/db";
import { useFocusEffect } from "expo-router";

interface Game {
  id: string;
  date: Date;
  homeTeamId: number;  
  awayTeamId: number;
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
        console.warn(" No username found in AsyncStorage");
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
      const favTeamNames = favTeams.map((team: any) => team[0]);
      if (favTeamNames.length === 0) {
        console.warn("No favorite teams found.");
        setGames([]);
        return;
      }

      const currentDate = new Date();
      const endDate = new Date(currentDate);
      endDate.setDate(currentDate.getDate() + 14);

      const startDateString = currentDate.toISOString().split("T")[0];
      const endDateString = endDate.toISOString().split("T")[0];

      console.log("Fetching games from:", startDateString, "to:", endDateString);
 
      let allGames: Game[] = [];
      for (const teamID of favTeamNames) {
        console.log(`📡 Fetching games for team: ${teamID}`);
        const teamGames = await callGamesByDate(
          startDateString,
          endDateString,
          teamID
        );

        if (teamGames.length === 0) {
          console.warn(`No games found for team ${teamID}`);
        } else {
          allGames = [...allGames, ...teamGames];
        }
      }

      if (allGames.length === 0) {
        console.warn("No upcoming games found.");
      }
      setGames(allGames);
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
      console.log("re-fetching games...");
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
                {item.date.toLocaleDateString()}
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
