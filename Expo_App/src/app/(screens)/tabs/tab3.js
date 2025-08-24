import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
  Text,
  Linking,
  Image,
  Dimensions,
  ImageBackground,
} from "react-native";
import GlobalStyles, {
  footer,
  mainColor,
  StatusBarHeight,
} from "../../../core/styles";
import { useStateAsync } from "../../../core/useAsyncState";
import ContextModule from "../../../providers/contextModule";
import { formatTimestamp, getEncryptedStorageValue } from "../../../core/utils";
import { fetch } from "expo/fetch";
import { useKeyboard } from "@react-native-community/hooks";
import Greavous from "../../../assets/greavous.jpg";
import backImage from "../../../assets/backgrounds/backgroundAi.png";

export default function Tab3() {
  const context = React.useContext(ContextModule);
  const scrollView = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputHeight, setInputHeight] = useStateAsync("auto");
  const [keyboardHeight, setKeyboardHeight] = useState(20);
  const keyboardController = useKeyboard();

  useEffect(() => {
    if (keyboardController.keyboardShown) {
      setKeyboardHeight(keyboardController.keyboardHeight - footer);
    } else {
      setKeyboardHeight(20);
    }
  }, [keyboardController.keyboardShown, keyboardController.keyboardHeight]);

  async function chatWithAgent(message) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("X-API-Key", process.env.EXPO_PUBLIC_AI_URL_API_KEY);
    const raw = JSON.stringify({
      message,
      context: {
        address: context.value.address,
      },
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    return new Promise((resolve) => {
      fetch(process.env.EXPO_PUBLIC_AGENT_URL_API, requestOptions)
        .then((response) => response.json())
        .then((result) => resolve(result))
        .catch(() => resolve(null));
    });
  }

  function responseModifier(response, userMessage) {
    let temp = response;
    if (userMessage.indexOf("Hello there") > -1) {
      temp.message = "System Greavous Message";
    }
    return temp;
  }

  const sendMessage = useCallback(async () => {
    setLoading(true);
    const userMessage = message;
    setMessage("");
    let temp = [...context.value.chatGeneral];
    temp.push({
      message: userMessage,
      type: "user",
      time: Date.now(),
      tool: "",
    });
    context.setValue({
      chatGeneral: temp,
    });
    scrollView.current.scrollToEnd({ animated: true });
    const response = await chatWithAgent(message);
    const finalResponse = responseModifier(response, userMessage);
    temp.push({
      message: finalResponse.message,
      type: "system",
      time: Date.now(),
      tool: response["last_tool"],
    });
    console.log(temp);
    context.setValue({
      chatGeneral: temp,
    });
    setLoading(false);
    setTimeout(() => scrollView.current.scrollToEnd({ animated: true }), 100);
  }, [scrollView, context, message, setMessage, setLoading]);

  return (
    <Fragment>
      <ImageBackground
        style={[GlobalStyles.container, {width: "100%"}]}
        source={backImage}
        resizeMode="cover"
        imageStyle={{
          opacity: 0.25,
          height: "auto",
        }}
      >
        <ScrollView
          ref={(view) => {
            scrollView.current = view;
          }}
          showsVerticalScrollIndicator={false}
          style={[
            GlobalStyles.scrollContainer,
            { marginTop: StatusBarHeight + 0, height: "100%" },
          ]}
          contentContainerStyle={[
            GlobalStyles.scrollContainerContent,
            {
              width: "90%",
              height: "auto",
              alignSelf: "center",
              gap: 0,
            },
          ]}
        >
          {context.value.chatGeneral.map((item, index, array) => (
            <LinearGradient
              angle={90}
              useAngle={true}
              key={`Message:${index}`}
              style={[
                {
                  borderRadius: 10,
                  borderBottomRightRadius: item.type === "user" ? 0 : 10,
                  borderBottomLeftRadius: item.type === "user" ? 10 : 0,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  maxWidth: "80%",
                  alignSelf: item.type === "user" ? "flex-end" : "flex-start",
                },
                index !== 0 && array[index - 1].type !== item.type
                  ? { marginTop: 16 }
                  : { marginTop: 5 },
              ]}
              colors={[
                item.type === "user" ? mainColor + "cc" : mainColor + "40",
                item.type === "user" ? mainColor + "cc" : mainColor + "40",
              ]}
            >
              {item.message === "System Greavous Message" ? (
                <Fragment>
                  <Text
                    style={{
                      color: "white",
                      textAlign: "justify",
                      fontSize: 16,
                      marginBottom: -40,
                    }}
                  >
                    {"General Kenobiiiiiiii!"}
                  </Text>
                  <Image
                    source={Greavous}
                    style={{
                      width: Dimensions.get("window").width * 0.6,
                      borderRadius: 10,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: "white",
                      textAlign: "justify",
                      marginBottom: 10,
                      marginTop: -30,
                      fontSize: 16,
                    }}
                  >
                    {
                      "... I mean, I'm MONAI, your Agent for all things MONAD and Stablecoins. What can I do for you?"
                    }
                  </Text>
                </Fragment>
              ) : (
                <Text
                  style={{
                    color: "white",
                    textAlign: "justify",
                    marginBottom: 10,
                    fontSize: 16,
                  }}
                >
                  {item.message}
                </Text>
              )}
              <Text
                style={{
                  color: "#cccccc",
                  alignSelf: "flex-end",
                  fontSize: 12,
                  marginRight: -5,
                  marginBottom: -5,
                }}
              >
                {formatTimestamp(item.time)}
              </Text>
            </LinearGradient>
          ))}
        </ScrollView>
        <View
          style={[
            {
              height: "auto",
              width: "94%",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginTop: 10,
              marginBottom: keyboardHeight,
            },
          ]}
        >
          <TextInput
            onPressOut={() =>
              scrollView.current.scrollToEnd({ animated: true })
            }
            onChange={() => scrollView.current.scrollToEnd({ animated: true })}
            onFocus={() => scrollView.current.scrollToEnd({ animated: true })}
            multiline
            onContentSizeChange={async (event) => {
              if (event.nativeEvent.contentSize.height < 120) {
                await setInputHeight(event.nativeEvent.contentSize.height);
                scrollView.current.scrollToEnd({ animated: true });
              }
            }}
            style={[
              GlobalStyles.inputChat,
              {
                height: inputHeight,
              },
            ]}
            keyboardType="default"
            value={message}
            onChangeText={setMessage}
          />
          <Pressable
            onPress={sendMessage}
            disabled={message.length <= 0 || loading}
            style={[
              {
                width: "13%",
                height: "auto",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: mainColor,
                borderRadius: 50,
                aspectRatio: 1,
                padding: 0,
              },
              message.length <= 0 || loading ? { opacity: 0.5 } : {},
            ]}
          >
            {loading ? (
              <ActivityIndicator size={22} color="white" />
            ) : (
              <Ionicons name="send" size={22} color="white" />
            )}
          </Pressable>
        </View>
      </ImageBackground>
    </Fragment>
  );
}
