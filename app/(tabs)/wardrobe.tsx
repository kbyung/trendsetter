import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const imgDir = FileSystem.documentDirectory + "images/";

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(imgDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(imgDir, { intermediates: true });
  }
};

export default function Wardrobe() {
  const [images, setImages] = useState<string[]>([]);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    await ensureDirExists();
    const files = await FileSystem.readDirectoryAsync(imgDir);
    if (files.length > 0) {
      setImages(files.map((f) => imgDir + f));
    }
  };

  const selectImage = async (useLibrary: boolean) => {
    let result;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
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

    if (!result?.canceled) {
      saveImage(result?.assets[0].uri);
      setShowAppOptions(true);
    } else {
      alert("You did not select any image.");
    }
  };

  const saveImage = async (uri: string) => {
    await ensureDirExists();
    const filename = new Date().getTime() + ".jpg";
    const dest = imgDir + filename;
    await FileSystem.copyAsync({ from: uri, to: dest });
    setImages([...images, dest]);
  };

  const deleteImage = async (uri: string) => {
    await FileSystem.deleteAsync(uri);
    setImages(images.filter((i) => i !== uri));
  };

  const renderItem = ({ item }: { item: string }) => {
    return (
      <View style={{ flexDirection: "row", margin: 1, alignItems: "center" }}>
        <Image source={{ uri: item }} style={{ width: 100, height: 100 }} />
        <Ionicons.Button name="trash" onPress={() => deleteImage(item)} />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, gap: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
        <Button title="Photo Library" onPress={() => selectImage(true)} />
        <Button title="Capture Image" onPress={() => selectImage(false)} />
      </View>
      <Text style={{ textAlign: "center", fontSize: 20, fontWeight: "500" }}>
        My Images
      </Text>
      <FlatList data={images} renderItem={renderItem} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#00000",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});
