import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { trpc } from '../lib/trpc';

export default function TrpcTest() {
  const [name, setName] = useState<string>('World');
  
  const hiMutation = trpc.example.hi.useMutation();

  const handleTest = () => {
    hiMutation.mutate({ name });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>tRPC Test</Text>
      
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleTest}
        disabled={hiMutation.isPending}
      >
        <Text style={styles.buttonText}>
          {hiMutation.isPending ? 'Loading...' : 'Say Hi'}
        </Text>
      </TouchableOpacity>
      
      {hiMutation.data && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            Response: {hiMutation.data.hello}
          </Text>
          <Text style={styles.resultText}>
            Date: {hiMutation.data.date.toLocaleString()}
          </Text>
        </View>
      )}
      
      {hiMutation.error && (
        <Text style={styles.error}>
          Error: {hiMutation.error.message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#4267FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  result: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultText: {
    color: '#2d5a2d',
    marginBottom: 5,
  },
  error: {
    color: 'red',
    backgroundColor: '#ffe8e8',
    padding: 12,
    borderRadius: 8,
  },
});