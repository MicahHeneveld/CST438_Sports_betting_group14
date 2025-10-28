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
import { router, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import loginPic from "../../assets/images/loginPic2.jpg";

import { verifyUserLogin, getUserID, initializeDatabase } from "../../database/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginWithOAuth, isAuthenticated, setSession } from "../../ApiScripts";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<{ name?: string; email?: string; avatar?: string } | null>(null);
  
  // Get query parameters from the URL (OAuth callback)
  const { name, email, avatar, authenticated } = useLocalSearchParams();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize database
        await initializeDatabase();
        setDbInitialized(true);

        // Check for OAuth callback parameters
        if (authenticated === 'true' && (name || email)) {
          console.log('OAuth callback detected:', { name, email, avatar });
          // Save user to state and localStorage
          const userData = {
            name: Array.isArray(name) ? name[0] : name,
            email: Array.isArray(email) ? email[0] : email,
            avatar: Array.isArray(avatar) ? avatar[0] : avatar,
          };
          setUser(userData);
          await setSession(userData);
          await AsyncStorage.setItem("username", userData.email || userData.name || "oauth_user");
          
          Alert.alert("Welcome", `You are now logged in as ${userData.name || userData.email}!`);
          
          setTimeout(() => {
            router.replace("/favoriteTeams");
          }, 500);
          return;
        }

        // Check if user is already authenticated with OAuth
        const authenticatedStatus = await isAuthenticated();
        if (authenticatedStatus) {
          router.replace("/favoriteTeams");
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    initialize();
  }, [name, email, avatar, authenticated]);

  // Add Linking event listener for OAuth callback
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      console.log('🔗 Deep link received:', url);
      
      const { queryParams } = Linking.parse(url);
      console.log('📋 Query params:', queryParams);
      
      if (queryParams?.authenticated === 'true') {
        console.log('✅ User authenticated via OAuth:', queryParams);
        
        const userData = {
          name: queryParams.name as string,
          email: queryParams.email as string,
          avatar: queryParams.avatar as string,
        };
        
        setUser(userData);
        setSession(userData);
        AsyncStorage.setItem("username", userData.email || userData.name || "oauth_user");
        
        Alert.alert("Welcome", `You are now logged in as ${userData.name || userData.email}!`);
        
        setTimeout(() => {
          router.replace("/favoriteTeams");
        }, 500);
      }
    };

    // Add event listener
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🚀 App opened with URL:', url);
        handleDeepLink({ url });
      }
    });

    // Cleanup
    return () => {
      subscription.remove();
    };
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

          {/* Test OAuth Callback Button */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test OAuth Callback</Text>
            <TouchableOpacity
              style={[styles.oauthButton, { backgroundColor: "#FF6B6B" }]}
              onPress={() => {
                // Simulate OAuth callback with test data
                router.push({
                  pathname: "/login",
                  params: {
                    name: "Test User",
                    email: "testuser@example.com",
                    avatar: "https://i.pravatar.cc/150?img=3",
                    authenticated: "true",
                  },
                });
              }}
            >
              <Text style={styles.oauthButtonText}>🧪 Test OAuth Callback</Text>
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