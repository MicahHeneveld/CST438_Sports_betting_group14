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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { callTeams } from "../../ApiScripts";
import {
  addTeamToFavs,
  removeTeamFromFav,
  getFavTeamNames,
  logDatabaseContents,
} from "../../database/db";

interface Team {
  id: string;
  name: string;
  city: string;
  logo: string;
}

const FavoriteTeams = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        //Get username from AsyncStorage 
        const storedUser = await AsyncStorage.getItem("username");
        if (storedUser) setUsername(storedUser);
        else console.warn("⚠️ No username found in AsyncStorage");

        // Load user's favorite teams from local DB
        const favTeams = storedUser ? await getFavTeamNames(storedUser) : [];
        setSelectedTeams(favTeams || []);

        //Fetch all teams from backend
        const teamData = await callTeams();
        console.log("✅ Teams fetched:", teamData.length);

        const formattedTeams = teamData.map((t: any) => ({
          id: (t.teamId || t.id)?.toString(),
          name: t.teamName || t.name || "Unknown Team",
          city: t.teamCity || t.city || "",
          logo:
            t.logo && t.logo.startsWith("http")
              ? t.logo
              : `https://cdn.nba.com/logos/nba/${t.teamId || t.id}/primary/L/logo.svg`,
        }));

        setTeams(formattedTeams);
      } catch (error) {
        console.error("Error initializing Favorite Teams:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Toggle favorite
  const toggleTeamSelection = async (teamName: string) => {
    if (!username) {
      console.warn("⚠️ Cannot modify favorites — username missing");
      return;
    }

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

  // ✅ Loading state
  if (loading) {
    return (
      <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
    );
  }

  // ✅ Render teams
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

// ✅ Styles
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
