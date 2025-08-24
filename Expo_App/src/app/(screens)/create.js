import backImage from "@/src/assets/backgrounds/backgroundSetup.png";
import backSetup from "@/src/assets/backgrounds/backgroundSetupWallet.png";
import backFinish from "@/src/assets/backgrounds/backgroundSetupFinish.png";
import logo from "@/src/assets/logo.png";
import { Wallet } from "ethers";
import { Image } from "expo-image";
import { Fragment, useCallback, useContext, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import GlobalStyles, { main, mainColor } from "../../core/styles";
import {setAsyncStorageValue, setEncryptedStorageValue} from "../../core/utils";
import ContextModule from "../../providers/contextModule";

export default function Create() {
  const [step, setStep] = useState(0);
  const [mnemonic, setMnemonic] = useState("• • • • • • • • • • • •");
  const [loading, setLoading] = useState(false);
  const context = useContext(ContextModule);

  const createWallet = useCallback(() => {
    setLoading(true);
    setTimeout(async () => {
      const wallet = Wallet.createRandom();
      await setAsyncStorageValue({ address: wallet.address });
      console.log(wallet.address)
      await setEncryptedStorageValue({ privateKey: wallet.privateKey });
      await context.setValueAsync({ address: wallet.address });
      setMnemonic(wallet.mnemonic.phrase);
      setLoading(false);
    }, 1);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      {step === 0 && (
        <ImageBackground
          style={[GlobalStyles.container]}
          source={backImage}
          resizeMode="cover"
          imageStyle={{
            opacity: 0.5,
          }}
        >
          <View
            style={{
              justifyContent: "space-evenly",
              alignItems: "center",
              height: "60%",
            }}
          >
            <Image
              source={logo}
              alt="Cat"
              style={{
                flex: 2,
                width: Dimensions.get("window").width * 0.5,
              }}
              contentFit="contain"
            />
            <Text
              style={{
                fontSize: 22,
                textAlign: "center",
                marginHorizontal: 40,
                color: "white",
                fontFamily: "DMSans-Medium",
              }}
            >
              Outlay is an Agentic wallet with POS capabilities.
            </Text>
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              alignItems: "center",
              height: "auto",
              paddingBottom: "14%",
              width: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {[...Array(3).keys()].map((_, index) => (
                <Text
                  key={"dot:" + index}
                  style={{
                    color: step >= index ? "white" : "#a3a3a3",
                    marginHorizontal: 20,
                    fontSize: 38,
                  }}
                >
                  {step >= index ? "•" : "·"}
                </Text>
              ))}
            </View>
            <Pressable
              style={[
                GlobalStyles.buttonStyle,
                {
                  backgroundColor: "#000000aa",
                  borderColor: mainColor,
                },
              ]}
              onPress={async () => setStep(1)}
            >
              <Text style={[GlobalStyles.buttonText]}>Create Wallet</Text>
            </Pressable>
          </View>
        </ImageBackground>
      )}
      {step === 1 && (
        <ImageBackground
          style={[GlobalStyles.container]}
          source={backSetup}
          resizeMode="cover"
          imageStyle={{
            opacity: 0.5,
          }}
        >
          <View
            style={{
              flex: 10,
              justifyContent: "space-evenly",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text style={GlobalStyles.title}>Secret Recovery Phrase</Text>
            <View style={{ width: "80%" }}>
              <Text style={GlobalStyles.description}>
                This is the only way you will be able to recover your wallet.
                Please store it somewhere safe!
              </Text>
            </View>
            <View
              style={{
                flexWrap: "wrap",
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "stretch",
                width: "100%",
              }}
            >
              {mnemonic !== "• • • • • • • • • • • •" &&
                mnemonic.split(" ").map((item, index) => (
                  <Fragment key={"seed:" + index}>
                    <View style={GlobalStyles.mnemonicBoxStyle}>
                      <Text
                        style={{ margin: 10, fontSize: 14, color: "white" }}
                      >
                        {`${index + 1} | `}
                        {item}
                      </Text>
                    </View>
                  </Fragment>
                ))}
            </View>
          </View>
          <View
            style={{
              flex: 4,
              justifyContent: "flex-end",
              alignItems: "center",
              paddingBottom: "14%",
              width: "80%",
              gap:10
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {[...Array(3).keys()].map((item, index) => (
                <Text
                  key={"dot:" + index}
                  style={{
                    color: step >= index ? "white" : "#a3a3a3",
                    marginHorizontal: 20,
                    fontSize: 38,
                  }}
                >
                  {step >= index ? "•" : "·"}
                </Text>
              ))}
            </View>
            <Pressable
              disabled={loading}
              style={[
                GlobalStyles.buttonStyle,
                {
                  borderColor: loading ? mainColor+"33" : mainColor,
                },
              ]}
              onPress={async () => {
                if (mnemonic === "• • • • • • • • • • • •") {
                  createWallet();
                } else {
                  setStep(2);
                }
              }}
            >
              <Text style={[GlobalStyles.buttonText]}>
                {mnemonic !== "• • • • • • • • • • • •"
                  ? "Continue"
                  : loading
                  ? "Creating Wallet..."
                  : "Create Wallet"}
              </Text>
            </Pressable>
            <Pressable
              disabled={loading}
              style={[GlobalStyles.buttonStyle, { borderColor: "#777777" }]}
              onPress={async () => {
                setStep(0);
                setMnemonic("• • • • • • • • • • • •");
              }}
            >
              <Text style={[GlobalStyles.buttonText, { color: "#777777" }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </ImageBackground>
      )}
      {step === 2 && (
        <ImageBackground
          style={[GlobalStyles.container]}
          source={backFinish}
          resizeMode="cover"
          imageStyle={{
            opacity: 0.5,
          }}
        >
          <View
            style={{
              flex: 10,
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <Text style={[GlobalStyles.title, { marginVertical: 20 }]}>
              All Done!
            </Text>
            <Text
              style={{
                fontSize: 22,
                textAlign: "center",
                marginHorizontal: 40,
                color: "white",
                fontFamily: "DMSans-Medium",
              }}
            >
              {`Start your decentralized\neconomy with this wallet!`}
            </Text>
          </View>
          <View
            style={{
              flex: 4,
              justifyContent: "flex-end",
              alignItems: "center",
              paddingBottom: "14%",
              width: "80%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {[...Array(3).keys()].map((item, index) => (
                <Text
                  key={"dot:" + index}
                  style={{
                    color: step >= index ? "white" : "#a3a3a3",
                    marginHorizontal: 20,
                    fontSize: 38,
                  }}
                >
                  {step >= index ? "•" : "·"}
                </Text>
              ))}
            </View>
            <Pressable
              style={[GlobalStyles.buttonStyle, { borderColor: mainColor }]}
              onPress={async () => {
                setStep(0);
                setMnemonic("• • • • • • • • • • • •");
              }}
            >
              <Text style={[GlobalStyles.buttonText]}>Done</Text>
            </Pressable>
          </View>
        </ImageBackground>
      )}
    </SafeAreaView>
  );
}
