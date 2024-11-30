import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 

function LoginScreen() {
  return (
    <ImageBackground
      source={require("../../assets/images/trendsetter3.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Trendsetter</Text>
        <Text style={styles.subtitle}>
          Create your free account to backup outfits and sync across devices.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Icon name="apple" size={20} color="black" style={styles.icon} />
          <Text style={styles.buttonText}>Continue with Apple</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Icon name="google" size={20} color="black" style={styles.icon} />
          <Text style={styles.buttonText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Icon name="envelope" size={20} color="black" style={styles.icon} />
          <Text style={styles.buttonText}>Continue with Email</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    flexDirection: "row", 
    width: "90%",
    paddingVertical: 15,
    backgroundColor: "white",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  icon: {
    marginRight: 10, 
  },
  buttonText: {
    fontSize: 16,
    color: "black",
    fontWeight: "500",
  },
});
