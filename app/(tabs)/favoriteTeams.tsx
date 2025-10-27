import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { callTeams } from "../../ApiScripts";
import {
  addTeamToFavs,
  removeTeamFromFav,
  getFavTeamNames,
  logDatabaseContents,
} from "../../database/db";
import { useLocalSearchParams } from "expo-router";

interface Team {
  id: string;
  name: string;
  city: string;
  logo: string;
}

const FavoriteTeams = () => {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initialize = async () => {
      if (!username) return;

      setLoading(true);
      try {
        // Load user's favorite teams from local DB
        const favTeams = await getFavTeamNames(username);
        setSelectedTeams(favTeams || []);

        // ✅ Fetch team data from backend
        const teamData = await callTeams();
        const formattedTeams = teamData.map((t: any) => ({
          id: t.teamId.toString(),
          name: t.teamName ?? "Unknown Team",
          city: t.teamCity ?? "",
          logo:
            t.logo ||
            `https://cdn.nba.com/logos/nba/${t.teamId}/primary/L/logo.svg`,
        }));

        setTeams(formattedTeams);
      } catch (error) {
        console.error("Error initializing Favorite Teams:", error);
      }
      setLoading(false);
    };

    initialize();
  }, [username]);

  const toggleTeamSelection = async (teamName: string) => {
    if (!username) return;

    let updatedTeams = [...selectedTeams];

    if (updatedTeams.includes(teamName)) {
      await removeTeamFromFav(username, teamName);
      updatedTeams = updatedTeams.filter((name) => name !== teamName);
    } else {
      await addTeamToFavs(username, teamName);
      updatedTeams.push(teamName);
    }

    setSelectedTeams(updatedTeams);
    await logDatabaseContents();
  };

  if (loading) {
    return (
      <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Favorite Teams</Text>
      {teams.length === 0 ? (
        <Text style={styles.errorText}>No teams available. Check API.</Text>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.teamItem,
                selectedTeams.includes(item.name) ? styles.selectedTeam : {},
              ]}
              onPress={() => toggleTeamSelection(item.name)}
            >
              <View style={styles.teamContainer}>
                <Image source={{ uri: item.logo }} style={styles.logo} />
                <View>
                  <Text style={styles.teamText}>{item.city}</Text>
                  <Text style={styles.subText}>{item.name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  teamItem: {
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  teamContainer: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, marginRight: 12, resizeMode: "contain" },
  selectedTeam: { backgroundColor: "#87CEFA" },
  teamText: { fontSize: 16, fontWeight: "600" },
  subText: { fontSize: 14, color: "#555" },
});

export default FavoriteTeams;
