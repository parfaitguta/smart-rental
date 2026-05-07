// components/Logo.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Logo({ size = 'large', showText = true }) {
  const getSize = () => {
    switch(size) {
      case 'small':
        return { iconSize: 40, fontSize: 16, padding: 8 };
      case 'medium':
        return { iconSize: 70, fontSize: 22, padding: 12 };
      case 'large':
        return { iconSize: 100, fontSize: 28, padding: 16 };
      default:
        return { iconSize: 60, fontSize: 18, padding: 10 };
    }
  };
  
  const dimensions = getSize();
  
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { width: dimensions.iconSize, height: dimensions.iconSize }]}>
        <Text style={[styles.iconText, { fontSize: dimensions.iconSize * 0.5 }]}>🏠</Text>
      </View>
      {showText && (
        <>
          <Text style={[styles.title, { fontSize: dimensions.fontSize }]}>Smart Rental</Text>
          <Text style={styles.subtitle}>Find your perfect home</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    borderRadius: 100,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconText: {
    color: 'white',
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});