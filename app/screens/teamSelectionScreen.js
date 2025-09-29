import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

export default function teamSelectionScreen() {
  return (
    <ImageBackground style={styles.background} source={require('../../assets/images/teamCountry.jpg')}></ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

