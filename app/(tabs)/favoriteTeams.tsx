import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { callTeams } from "../../ApiScripts";
import { addTeamToFavs, removeTeamFromFav, getFavTeamNames, logDatabaseContents } from "../../database/db";
import { useLocalSearchParams } from "expo-router";

interface Team {
  id: string;
  name: string;
  nickname: string;
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
        const favTeams = await getFavTeamNames(username);
        setSelectedTeams(favTeams || []);

        const teamData = await callTeams();
        setTeams(teamData || []);
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
      updatedTeams = updatedTeams.filter(name => name !== teamName);
    } else {
      await addTeamToFavs(username, teamName);
      updatedTeams.push(teamName);
    }

    setSelectedTeams(updatedTeams);
    await logDatabaseContents();
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Favorite Teams</Text>
      {teams.length === 0 ? (
        <Text style={styles.errorText}>No teams available. Check API Key.</Text>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.teamItem, selectedTeams.includes(item.name) ? styles.selectedTeam : {}]}
              onPress={() => toggleTeamSelection(item.name)}
            >
              <View style={styles.teamContainer}>
                <Image source={{ uri: item.logo }} style={styles.logo} />
                <Text style={styles.teamText}>{item.name}</Text>
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
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  teamItem: { padding: 15, marginBottom: 5, borderWidth: 1, borderColor: "#ddd", borderRadius: 5, flexDirection: "row", alignItems: "center" },
  teamContainer: { flexDirection: "row", alignItems: "center" },
  logo: { width: 40, height: 40, marginRight: 10, resizeMode: "contain" },
  selectedTeam: { backgroundColor: "#87CEFA" },
  teamText: { fontSize: 18 },
});

export default FavoriteTeams;
