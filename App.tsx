import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import PitchDetectionComponent from './views/PitchDetectionComponent';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: '#1c1c1c', // Set the background color to #1c1c1c
    flex: 1, // Ensure the container takes up the full screen
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        <View style={styles.container}>
          <Text style={styles.title}>Accorda sta chitarra!!</Text>
          <Image
            source={require('./assets/img1.jpg')}
            style={styles.image}
          />
          <PitchDetectionComponent />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
});

export default App;
