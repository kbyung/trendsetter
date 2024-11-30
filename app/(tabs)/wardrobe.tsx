import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Image,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const imgDir = FileSystem.documentDirectory + "images/";
const metadataFile = FileSystem.documentDirectory + "image_metadata.json";

type MetadataItem = {
  uri: string;
  description: string;
};

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(imgDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
  }
};

const loadMetadata = async (): Promise<MetadataItem[]> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(metadataFile);
    if (fileInfo.exists) {
      const metadata = await FileSystem.readAsStringAsync(metadataFile);
      return JSON.parse(metadata); // Parse JSON into an array of objects
    }
  } catch (error) {
    console.error("Error loading metadata:", error);
  }
  return []; // Return an empty array if no metadata exists
};

const saveMetadata = async (metadata: MetadataItem[]) => {
  try {
    await FileSystem.writeAsStringAsync(metadataFile, JSON.stringify(metadata));
  } catch (error) {
    console.error("Error saving metadata:", error);
  }
};

export default function Wardrobe() {
  const [images, setImages] = useState<MetadataItem[]>([]); // Array of images with descriptions
  const [photoUploaded, setPhotoUploaded] = useState(false); // Toggle between views
  const [uploadedPhotoUri, setUploadedPhotoUri] = useState<string | null>(null); // Store photo URI
  const [description, setDescription] = useState<string>(""); // Store user input

  useEffect(() => {
    const initialize = async () => {
      await ensureDirExists();
      const metadata = await loadMetadata();
      setImages(metadata);
    };

    initialize();
  }, []);

  const selectImage = async (useLibrary: boolean) => {
    let result;
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    };

    if (useLibrary) {
      result = await ImagePicker.launchImageLibraryAsync(options);
    } else {
      await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync(options);
    }

    if (!result?.canceled && result.assets.length > 0) {
      setUploadedPhotoUri(result.assets[0].uri); // Store the selected photo's URI
      setPhotoUploaded(true); // Show the input form
    } else {
      alert("You did not select any image.");
    }
  };

  const saveImage = async () => {
    if (!uploadedPhotoUri) {
      Alert.alert("Error", "No photo selected.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description for the image.");
      return;
    }

    try {
      await ensureDirExists();
      const filename = new Date().getTime() + ".jpg";
      const dest = imgDir + filename;

      // Save image to filesystem
      await FileSystem.copyAsync({ from: uploadedPhotoUri, to: dest });

      const newImage = { uri: dest, description };
      const updatedImages = [...images, newImage];

      setImages(updatedImages); // Update state
      setDescription(""); // Clear the input field
      setUploadedPhotoUri(null); // Reset uploaded photo
      setPhotoUploaded(false); // Go back to the main wardrobe screen

      await saveMetadata(updatedImages); // Save metadata persistently
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Failed to save the image.");
    }
  };

  const deleteImage = async (uri: string) => {
    try {
      await FileSystem.deleteAsync(uri); // Delete image from filesystem
      const updatedImages = images.filter((i) => i.uri !== uri);

      setImages(updatedImages); // Update state
      await saveMetadata(updatedImages); // Update metadata file
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const renderItem = ({ item }: { item: MetadataItem }) => (
    <View style={{ flexDirection: "row", margin: 10, alignItems: "center" }}>
      <Image source={{ uri: item.uri }} style={{ width: 100, height: 100 }} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontSize: 16 }}>{item.description}</Text>
      </View>
      <Ionicons.Button
        name="trash"
        onPress={() => deleteImage(item.uri)}
        backgroundColor="red"
      />
    </View>
  );

  // If photo is uploaded, show the input form
  if (photoUploaded) {
    return (
      <SafeAreaView style={styles.detailsContainer}>
        <Text style={styles.title}>Add a Description</Text>
        {uploadedPhotoUri && (
          <Image
            source={{ uri: uploadedPhotoUri }}
            style={styles.uploadedPhoto}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Enter a description..."
          value={description}
          onChangeText={setDescription}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
          <Button title="Submit" onPress={saveImage} />
          <Button
            title="Cancel"
            onPress={() => {
              setUploadedPhotoUri(null);
              setDescription("");
              setPhotoUploaded(false); // Go back without saving
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Default Wardrobe view
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
        <Button title="Photo Library" onPress={() => selectImage(true)} />
        <Button title="Capture Image" onPress={() => selectImage(false)} />
      </View>
      <Text style={styles.title}>My Images</Text>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  detailsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  uploadedPhoto: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    width: "80%",
    marginBottom: 20,
    fontSize: 16,
  },
});
