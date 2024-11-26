import { Text, View, StyleSheet } from 'react-native';

export default function TabTwoSCreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Wardrobe screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#00000',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
