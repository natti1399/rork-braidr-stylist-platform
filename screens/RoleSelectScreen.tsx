import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  onSelect: (role: 'stylist' | 'customer') => void;
}

export default function RoleSelectScreen({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who are you?</Text>
      <TouchableOpacity style={[styles.button, styles.stylist]} onPress={() => onSelect('stylist')}>
        <Text style={styles.buttonText}>I'm a Stylist</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onSelect('customer')}>
        <Text style={styles.buttonText}>I'm a Customer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 40,
    color: '#222',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4267FF',
    marginBottom: 16,
    shadowColor: '#4267FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  stylist: {
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});