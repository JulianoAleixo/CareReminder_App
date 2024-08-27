import "@/utils/dayjsLocaleConfig"

import { useEffect } from "react"

import { View, StatusBar, StyleSheet } from "react-native"
import { Slot } from "expo-router"

import {
  useFonts,
  Inter_500Medium,
  Inter_400Regular,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter"

import * as ExpoNotifications from "expo-notifications"

import { Loading } from "@/components/loading"

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true, 
  }),
});

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_400Regular,
    Inter_600SemiBold,
  })
  async function requestNotificationPermission() {
    let permissionsToSendPushNotifications =
      await ExpoNotifications.getPermissionsAsync();
    if (!permissionsToSendPushNotifications.granted) {
        permissionsToSendPushNotifications =
          await ExpoNotifications.requestPermissionsAsync();
    }

    ExpoNotifications.scheduleNotificationAsync({
      content: {
        body: "Uma notificação",
        title: "Tuuufooooo",
      },
      trigger: {
        seconds: 10
      }
    })
  }

  if (!fontsLoaded) {
    return <Loading />
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Slot />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // bg-neutral-100
  },
})
