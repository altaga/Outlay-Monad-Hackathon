import "@/src/core/shims";
import { ContextProvider } from "@/src/providers/contextModule";
import {
  Exo2_400Regular,
  Exo2_700Bold,
  useFonts,
} from "@expo-google-fonts/exo-2";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import ContextLoader from "../providers/contextLoader";
import WCprovider from "../providers/wcProvider";

import React from "react";
import { LogBox } from "react-native";
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  useFonts({
    Exo2_400Regular,
    Exo2_700Bold,
  });
  return (
    <React.Fragment>
      <ContextProvider>
        <ContextLoader />
        <WCprovider>
          <Stack
            initialRouteName="index"
            screenOptions={{
              animation: "slide_from_right",
              headerShown: false,
            }}
          >
            {
              // Splash Loading Screen
            }
            <Stack.Screen name="index" />
            {
              // Setup Screen
            }
            <Stack.Screen name="(screens)/create" />
            {
              // Main Screen
            }
            <Stack.Screen name="(screens)/main" />
            {
              // Receipt Screen
              //<Stack.Screen name="receipt" />
            }
          </Stack>
          <StatusBar style="auto" />
        </WCprovider>
      </ContextProvider>
    </React.Fragment>
  );
}
