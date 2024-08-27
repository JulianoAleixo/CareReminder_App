import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";

export function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e5e7eb", // bg-neutral-200
    alignItems: "center",
    justifyContent: "center",
  },
});
