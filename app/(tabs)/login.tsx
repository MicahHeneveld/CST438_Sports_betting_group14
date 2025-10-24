import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import loginPic from "../../assets/images/loginPic2.jpg";

import { verifyUserLogin, getUserID, initializeDatabase } from "../../database/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginWithOAuth, isAuthenticated } from "../../ApiScripts";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize database
        await initializeDatabase();
        setDbInitialized(true);

        // Check if user is already authenticated with OAuth
        const authenticated = await isAuthenticated();
        if (authenticated) {
          router.replace("/favoriteTeams");
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    initialize();
  }, []);

  // Local database login (your existing method)
  const handleLocalLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const isValidUser = await verifyUserLogin(username, password);
      setLoading(false);

      if (isValidUser) {
        const userID = await getUserID(username);

        if (userID) {
          await AsyncStorage.setItem("username", username);
          Alert.alert("Welcome", "You are now logged in!");

          setTimeout(() => {
            router.push({ pathname: "/favoriteTeams", params: { username } });
          }, 500);
        } else {
          Alert.alert("Error", "User not found.");
        }
      } else {
        Alert.alert("Error", "Incorrect username or password.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "An error occurred while verifying login.");
      console.error(error);
    }
  };

  // OAuth login (new method)
  const handleOAuthLogin = async (provider: string) => {
    setLoading(true);
    try {
      const success = await loginWithOAuth(provider);

      if (success) {
        Alert.alert("Success", "You are now logged in with OAuth!");
        setTimeout(() => {
          router.replace("/favoriteTeams");
        }, 500);
      } else {
        Alert.alert("Login Failed", "OAuth login was cancelled or failed.");
      }
    } catch (error) {
      console.error("OAuth login error:", error);
      Alert.alert("Error", "An error occurred during OAuth login.");
    } finally {
      setLoading(false);
    }
  };

  if (!dbInitialized || checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ImageBackground source={loginPic} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Jump Ball Login</Text>

          {/* Local Login Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Local Login</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Button title="Login" onPress={handleLocalLogin} />
            )}
          </View>

         
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* OAuth Login Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Login with OAuth</Text>

            <TouchableOpacity
              style={[styles.oauthButton, styles.googleButton]}
              onPress={() => handleOAuthLogin("google")}
              disabled={loading}
            >
              <Text style={styles.oauthButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.oauthButton, styles.githubButton]}
              onPress={() => handleOAuthLogin("github")}
              disabled={loading}
            >
              <Text style={styles.oauthButtonText}>Continue with GitHub</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.oauthButton, styles.microsoftButton]}
              onPress={() => handleOAuthLogin("microsoft")}
              disabled={loading}
            >
              <Text style={styles.oauthButtonText}>Continue with Microsoft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.oauthButton, styles.discordButton]}
              onPress={() => handleOAuthLogin("discord")}
              disabled={loading}
            >
              <Text style={styles.oauthButtonText}>Continue with Discord</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  oauthButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  googleButton: {
    backgroundColor: "#4285F4",
  },
  githubButton: {
    backgroundColor: "#24292e",
  },
  microsoftButton: {
    backgroundColor: "#00A4EF",
  },
  discordButton: {
    backgroundColor: "#5865F2",
  },
  oauthButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});