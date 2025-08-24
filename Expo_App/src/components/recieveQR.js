import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Fragment, useContext, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { mainColor } from "../core/styles";
import { normalizeFontSize } from "../core/utils";
import ContextModule from "../providers/contextModule";

export default function ReceiveQR() {
  const [isVisible, setIsVisible] = useState(false);
  const context = useContext(ContextModule);
  return (
    <Fragment>
      <Pressable
        onPress={() => setIsVisible(true)}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
      >
        <FontAwesome6
          name="qrcode"
          size={normalizeFontSize(34)}
          color={mainColor}
        />
      </Pressable>
      <Modal animationType="slide" transparent={true} visible={isVisible}>
        <View
          style={{
            position: "absolute",
            bottom: 0,
            height: "60%",
            width: "99%",
            backgroundColor: "black",
            borderColor: mainColor,
            borderRadius: 20,
            borderWidth: 2,
            margin: 2,
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => {
              setIsVisible(false);
            }}
            style={{
              position: "absolute",
              top: 5,
              right: 5,
            }}
          >
            <Ionicons name="close" size={30} color={"white"} />
          </Pressable>
          <View
            style={{
              width: "auto",
              height: "auto",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              padding: 20,
              borderRadius: 20,
            }}
          >
            <QRCode
              size={Dimensions.get("screen").width * 0.7}
              value={context.value.address}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              gap: 10,
              paddingBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: normalizeFontSize(22),
                fontWeight: "bold",
                color: "white",
                textAlign: "center",
                width: "85%",
              }}
            >
              {context.value.address !== "" &&
                context.value.address.substring(
                  0,
                  Math.floor(context.value.address.length * (1 / 2))
                ) +
                  "\n" +
                  context.value.address.substring(
                    Math.floor(context.value.address.length * (1 / 2)),
                    context.value.address.length
                  )}
            </Text>
            <Pressable
              onPress={() => {
                Clipboard.setStringAsync(context.value.address);
                ToastAndroid.showWithGravity(
                  "Address copied to clipboard",
                  ToastAndroid.LONG,
                  ToastAndroid.BOTTOM
                );
              }}
              style={{
                width: "15%",
                alignItems: "flex-start",
              }}
            >
              <Ionicons name="copy" size={30} color={"white"} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </Fragment>
  );
}
