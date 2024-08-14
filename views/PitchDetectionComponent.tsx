import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Easing } from 'react-native';
import { request, PERMISSIONS } from 'react-native-permissions';
import { PitchDetector } from 'react-native-pitch-detector';

const PitchDetectionComponent = () => {
  const [note, setNote] = useState('');
  const [frequency, setFrequency] = useState('');
  const rotation = useRef(new Animated.Value(0)).current;

  // Interpolate rotation from -90 to 90 degrees
  const interpolateRotation = rotation.interpolate({
    inputRange: [-90, 0, 90],
    outputRange: ['-90deg', '0deg', '90deg'],
  });

  useEffect(() => {
    const requestMicrophonePermission = async () => {
      const result = await request(
        Platform.select({
          android: PERMISSIONS.ANDROID.RECORD_AUDIO,
          ios: PERMISSIONS.IOS.MICROPHONE,
        })
      );
      if (result === 'granted') {
        startPitchDetection();
      } else {
        console.log('Microphone permission denied');
      }
    };

    const startPitchDetection = async () => {
      try {
        await PitchDetector.start();
        const subscription = PitchDetector.addListener((result) => {
          const { frequency, tone } = result;
          const noteWithOctave = calculateNoteWithOctave(frequency, tone);
          const nearestFrequency = getNearestFrequency(noteWithOctave);

          setFrequency(frequency.toFixed(2));
          setNote(noteWithOctave);

          // Calculate rotation based on the relative difference
          const rotateValue = getRotation(frequency, nearestFrequency);

          // Animate the rotation with a slower duration and easing
          Animated.timing(rotation, {
            toValue: rotateValue,
            duration: 500, // Increase the duration for slower movement
            easing: Easing.out(Easing.quad), // Use easing for smoother movement
            useNativeDriver: true,
          }).start();
        });
        return () => {
          if (subscription) {
            PitchDetector.removeListener(subscription);
          }
          PitchDetector.stop();
        };
      } catch (error) {
        console.error('Error starting pitch detection:', error);
      }
    };

    requestMicrophonePermission();
  }, []);

  const calculateNoteWithOctave = (frequency, tone) => {
    const A4 = 440;
    const C0 = A4 * Math.pow(2, -4.75);
    const halfSteps = Math.round(12 * Math.log2(frequency / C0));
    const octave = Math.floor(halfSteps / 12);
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = (halfSteps % 12 + 12) % 12;

    return `${noteNames[noteIndex]}${octave}`;
  };

  const getNearestFrequency = (noteWithOctave) => {
    const noteFrequencies = {
      "C0": 16.35, "C#0": 17.32, "D0": 18.35, "D#0": 19.45, "E0": 20.60, "F0": 21.83, "F#0": 23.12, "G0": 24.50, "G#0": 25.96, "A0": 27.50, "A#0": 29.14, "B0": 30.87,
      "C1": 32.70, "C#1": 34.65, "D1": 36.71, "D#1": 38.89, "E1": 41.20, "F1": 43.65, "F#1": 46.25, "G1": 49.00, "G#1": 51.91, "A1": 55.00, "A#1": 58.27, "B1": 61.74,
      "C2": 65.41, "C#2": 69.30, "D2": 73.42, "D#2": 77.78, "E2": 82.41, "F2": 87.31, "F#2": 92.50, "G2": 98.00, "G#2": 103.83, "A2": 110.00, "A#2": 116.54, "B2": 123.47,
      "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94,
      "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
      "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.26, "F5": 698.46, "F#5": 739.99, "G5": 783.99, "G#5": 830.61, "A5": 880.00, "A#5": 932.33, "B5": 987.77,
      "C6": 1046.50, "C#6": 1108.73, "D6": 1174.66, "D#6": 1244.51, "E6": 1318.51, "F6": 1396.91, "F#6": 1479.98, "G6": 1567.98, "G#6": 1661.22, "A6": 1760.00, "A#6": 1864.66, "B6": 1975.53,
      "C7": 2093.00, "C#7": 2217.46, "D7": 2349.32, "D#7": 2489.02, "E7": 2637.02, "F7": 2793.83, "F#7": 2959.96, "G7": 3135.96, "G#7": 3322.44, "A7": 3520.00, "A#7": 3729.31, "B7": 3951.07,
      "C8": 4186.01
    };
    return noteFrequencies[noteWithOctave] || 0;
  };

  const getRotation = (currentFrequency, targetFrequency) => {
    const maxRotation = 90; // Maximum rotation in degrees

    // Calculate the difference from the target frequency
    const frequencyDiff = currentFrequency - targetFrequency;

    // Set a scaling factor, where a certain frequency difference will correspond to the full rotation
    const scalingFactor = targetFrequency * 0.01; // 1% of the target frequency

    // Calculate rotation based on the scaled frequency difference
    const rotation = (frequencyDiff / scalingFactor) * maxRotation;

    // Constrain rotation to be within the range of -90 to 90 degrees
    return Math.min(Math.max(rotation, -maxRotation), maxRotation);
  };

  return (
    <View style={styles.container}>
      <View style={styles.dial}>
        <Animated.View style={[styles.needle, { transform: [{ rotate: interpolateRotation }] }]}>
          <View style={styles.arrowhead} />
        </Animated.View>
      </View>
      <Text style={styles.noteText}>{note}</Text>
      <Text style={styles.frequencyText}>{frequency} Hz</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
  },
  dial: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c2c2c',
  },
  needle: {
    width: 4,
    height: 100,
    backgroundColor: '#ff0000',
    position: 'absolute',
    bottom: '50%', // Anchor the bottom of the needle to the center of the dial
    left: '50%',
    transform: [{ translateX: -2 }, { translateY: 50 }], // Center the needle's bottom
    transformOrigin: 'bottom center', // Rotate around the bottom center
    alignItems: 'center',
  },
  arrowhead: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ff0000',
    position: 'absolute',
    top: -10, // Position the arrowhead at the top of the needle
  },
  noteText: {
    fontSize: 48,
    color: '#00ff00',
    marginTop: 20,
  },
  frequencyText: {
    fontSize: 24,
    color: '#ffffff',
    marginTop: 10,
  },
});

export default PitchDetectionComponent;
