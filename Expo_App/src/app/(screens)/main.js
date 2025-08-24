import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Image, Pressable, SafeAreaView, Text, View } from "react-native";
import AgentW from "../../assets/agent.png";
import GlobalStyles, {
  iconSize,
  mainColor,
  NavigatorBarHeight,
  StatusBarHeight,
} from "../../core/styles";
import ContextModule from "../../providers/contextModule";
import Tab1 from "./tabs/tab1";
import Tab2 from "./tabs/tab2";
import Tab3 from "./tabs/tab3";

// Base state
const BaseStateMain = {
  tab: 0, // 0
};

export default function MainComponent() {
  const [tab, setTab] = useState(BaseStateMain.tab);
  const context = useContext(ContextModule);
  const navigation = useNavigation();

  useEffect(() => {
    const update = async () => {
      if (!context.value.starter) {
        navigation.navigate("index");
      } else if (context.value.address === "") {
        navigation.navigate("(screens)/create");
      }
    };
    context.value.starter && update();
  }, [context.value.address, context.value.starter, navigation.navigate]);

  const handleTabPress = (tabIndex) => {
    setTab(tabIndex);
  };

  return (
    <SafeAreaView style={[GlobalStyles.container]}>
      <View style={[GlobalStyles.main]}>
        {tab === 0 && <Tab1 navigation={navigation} />}
        {
          tab === 1 && <Tab2 navigation={navigation} />
        }
        {tab === 2 && <Tab3 navigation={navigation} />}
      </View>
      <View
        style={[
          GlobalStyles.footer,
          { marginBottom: NavigatorBarHeight - StatusBarHeight / 2 },
        ]}
      >
        <Pressable
          style={GlobalStyles.selector}
          onPress={() => handleTabPress(0)}
        >
          {tab === 0 ? (
            <View
              style={{
                width: iconSize * 2.5,
                height: iconSize * 2.5,
                borderRadius: iconSize * 2.5,
                borderWidth: 6,

                alignItems: "center",
                justifyContent: "center",
                backgroundColor: mainColor,
              }}
            >
              <MaterialIcons
                name="account-balance-wallet"
                size={iconSize}
                color={"white"}
              />
            </View>
          ) : (
            <MaterialIcons
              name="account-balance-wallet"
              size={iconSize}
              color={"white"}
            />
          )}
          {tab === 0 && (
            <Text style={GlobalStyles.selectorSelectedText}>Wallet</Text>
          )}
        </Pressable>
        <Pressable
          style={GlobalStyles.selector}
          onPress={() => handleTabPress(1)}
        >
          {tab === 1 ? (
            <View
              style={{
                width: iconSize * 2.5,
                height: iconSize * 2.5,
                borderRadius: iconSize * 2.5,
                borderWidth: 6,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: mainColor,
              }}
            >
              <FontAwesome5
                name="money-bill-wave"
                size={iconSize}
                color={"white"}
              />
            </View>
          ) : (
            <FontAwesome5
              name="money-bill-wave"
              size={iconSize}
              color={"white"}
            />
          )}
          {tab === 1 && (
            <Text style={GlobalStyles.selectorSelectedText}>Charge</Text>
          )}
        </Pressable>
        <Pressable
          style={GlobalStyles.selector}
          onPress={() => handleTabPress(2)}
        >
          {tab === 2 ? (
            <View
              style={{
                width: iconSize * 2.5,
                height: iconSize * 2.5,
                borderRadius: iconSize * 2.5,
                borderWidth: 6,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: mainColor,
              }}
            >
              <Image
                source={AgentW}
                style={{ width: iconSize, height: iconSize, borderRadius: 10 }}
              />
            </View>
          ) : (
            <Image
              source={AgentW}
              style={{ width: iconSize, height: iconSize, borderRadius: 10 }}
            />
          )}
          {tab === 2 && (
            <Text style={GlobalStyles.selectorSelectedText}>Agent</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
