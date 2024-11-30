import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as FileSystem from "expo-file-system";
import OpenAI from "openai";
import { SafeAreaView } from "react-native-safe-area-context";

const metadataFile = FileSystem.documentDirectory + "image_metadata.json";
const apiKey = process.env.EXPO_PUBLIC_API_KEY;
const openai = new OpenAI({ apiKey: apiKey });

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export default function Generate() {
  const [wardrobe, setWardrobe] = useState<string>(""); // Stores wardrobe descriptions
  const [query, setQuery] = useState<string>(""); // User's input
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You are a helpful assistant that provides outfit suggestions based on a given wardrobe. Respond in a friendly, conversational tone.",
    },
  ]);

  useEffect(() => {
    const loadWardrobe = async () => {
      try {
        const fileInfo = await FileSystem.getInfoAsync(metadataFile);
        if (fileInfo.exists) {
          const data = await FileSystem.readAsStringAsync(metadataFile);
          const wardrobeData = JSON.parse(data)
            .map((item: { description: string }) => item.description)
            .join("\n");
          setWardrobe(wardrobeData); // Load wardrobe descriptions
        } else {
          alert("No wardrobe data found.");
        }
      } catch (error) {
        console.error("Error loading wardrobe data:", error);
      }
    };

    loadWardrobe();
  }, []);

  const handleSend = async () => {
    if (!query.trim()) {
      alert("Please enter your query!");
      return;
    }

    const userMessage: Message = { role: "user", content: query };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    const prompt = `
      The user has the following clothes:
      ${wardrobe}

      User request: ${query}
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          ...messages,
          { role: "user", content: prompt }, // Send the prompt with the wardrobe and query
        ],
      });

      const content =
        response?.choices?.[0]?.message?.content?.trim() ||
        "Sorry, I couldn’t generate a response.";

      const aiMessage: Message = {
        role: "assistant",
        content,
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I couldn’t process your request.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setQuery(""); // Clear input
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90} // Adjust for proper offset
      >
        <View style={styles.container}>
          {/* Chat Section */}
          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.role === "user" ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text style={styles.messageText}>{item.content}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            style={styles.chatContainer}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          {/* Input Section */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What do you need help with?"
              value={query}
              onChangeText={setQuery}
            />
            <Button title="Send" onPress={handleSend} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#d1e7dd",
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e9ecef",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    fontSize: 16,
  },
});
