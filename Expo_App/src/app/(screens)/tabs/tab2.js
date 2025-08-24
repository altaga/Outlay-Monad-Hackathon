import { MaterialIcons } from "@expo/vector-icons";
import { abi as abiERC20 } from "@openzeppelin/contracts/build/contracts/ERC20.json";
import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { fetch } from "expo/fetch";
import { Component, Fragment } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import VirtualKeyboard from "react-native-virtual-keyboard";
import backImage from "../../../assets/backgrounds/backgroundModules.png";
import checkMark from "../../../assets/checkMark.png";
import { abiBatchTokenBalances } from "../../../contracts/batchTokenBalances";
import { blockchain, iconsBlockchain } from "../../../core/constants";
import GlobalStyles, {
  mainColor,
  secondaryColor,
  tertiaryColor,
} from "../../../core/styles";
import {
  deleteLeadingZeros,
  formatInputText,
  normalizeFontSize,
  rgbaToHex,
  setAsyncStorageValue,
  setupProvider,
} from "../../../core/utils";
import { useHOCS } from "../../../hocs/useHOCS";
import ContextModule from "../../../providers/contextModule";

const BaseStatePaymentWallet = {
  // Base
  balances: blockchain.tokens.map(() => 0),
  activeTokens: blockchain.tokens.map(() => false),
  stage: 0, // 0
  amount: "0.00", // "0.00"
  kindPayment: 0, // 0
  // wallets
  user: "",
  address: "",
  // Extra
  explorerURL: "",
  hash: "",
  transactionDisplay: {
    amount: "0.00",
    name: blockchain.tokens[0].symbol,
    tokenAddress: blockchain.tokens[0].address,
    icon: blockchain.tokens[0].icon,
  },
  // QR print
  saveData: "",
  // Utils
  take: false,
  loading: false,
};

class Tab2 extends Component {
  constructor(props) {
    super(props);
    this.state = BaseStatePaymentWallet;
    this.provider = setupProvider(blockchain.rpc);
    this.controller = new AbortController();
  }

  static contextType = ContextModule;

  printURL() {
    window.open(
      `/receipt?kindPayment=${this.state.kindPayment}&amount=${this.state.transactionDisplay.amount}&name=${this.state.transactionDisplay.name}&hash=${this.state.hash}`,
      "_blank"
    );
  }

  componentDidMount() {
    this.setState(BaseStatePaymentWallet);
  }

  async nativePayment(signer, index) {
    try {
      const amount = (
        this.state.amount / this.context.value.usdConversion[index]
      ).toFixed(blockchain.tokens[index].decimals);
      const amountBN = parseUnits(amount, blockchain.tokens[index].decimals);
      const tx = await signer.sendTransaction({
        chainId: blockchain.chainId,
        to: this.context.value.address,
        value: amountBN,
      });
      await tx.wait();
      this.setState({
        explorerURL: `${blockchain.blockExplorer}tx/${tx.hash}`,
        hash: tx.hash,
        transactionDisplay: {
          amount: amount,
          name: blockchain.tokens[index].symbol,
          tokenAddress: blockchain.tokens[index].address,
          icon: blockchain.tokens[index].icon,
        },
        stage: 3,
      });
      console.log(tx.hash);
    } catch (e) {
      ToastAndroid.showWithGravity(
        "Something went wrong, please try again",
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
      this.props.isConnected && this.props.disconnect();
      await this.setStateAsync({
        ...BaseStatePaymentWallet,
        amount: this.state.amount,
      });
      this.props.open({ view: "ConnectingWalletConnect" });
    }
  }

  async monadToSpei(amount) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      amount,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "https://monad-to-mxnb-spei-mod-167323375841.europe-west1.run.app",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  }

  async mxnbPayment(signer, index) {
    try {
      const amount = (
        this.state.amount / this.context.value.usdConversion[index]
      ).toFixed(blockchain.tokens[index].decimals);
      const usdMXNB = await this.getOneUSD("mxnb");
      const amountMXNB = (this.state.amount / usdMXNB).toFixed(6);
      const amountBN = parseUnits(amount, blockchain.tokens[index].decimals);
      const tx = await signer.sendTransaction({
        chainId: blockchain.chainId,
        to: "0xE5fC7cd34313488697CACf04E8AD01e9615668Ce",
        value: amountBN,
      });
      this.monadToSpei(amount);
      await tx.wait();
      this.setState({
        explorerURL: `${blockchain.blockExplorer}tx/${tx.hash}`,
        hash: tx.hash,
        transactionDisplay: {
          amount: amountMXNB,
          name: "MXNB",
          tokenAddress: blockchain.tokens[index].address,
          icon: iconsBlockchain.mxnb,
        },
        stage: 3,
      });
      console.log(tx.hash);
    } catch (e) {
      ToastAndroid.showWithGravity(
        "Something went wrong, please try again",
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
      this.props.isConnected && this.props.disconnect();
      await this.setStateAsync({
        ...BaseStatePaymentWallet,
        amount: this.state.amount,
      });
      this.props.open({ view: "ConnectingWalletConnect" });
    }
  }

  async tokenPayment(signer, index) {
    try {
      const token = new Contract(
        blockchain.tokens[index].address,
        abiERC20,
        signer
      );
      const amount = (
        this.state.amount / this.context.value.usdConversion[index]
      ).toFixed(blockchain.tokens[index].decimals);
      const amountBN = parseUnits(amount, blockchain.tokens[index].decimals);
      const tx = await token.transfer(this.context.value.address, amountBN, {
        chainId: blockchain.chainId,
      });
      await tx.wait();
      this.setState({
        explorerURL: `${blockchain.blockExplorer}tx/${tx.hash}`,
        hash: tx.hash,
        transactionDisplay: {
          amount: amount,
          name: blockchain.tokens[index].symbol,
          tokenAddress: blockchain.tokens[index].address,
          icon: blockchain.tokens[index].icon,
        },
        stage: 3,
      });
      console.log(tx.hash);
    } catch (e) {
      ToastAndroid.showWithGravity(
        "Something went wrong, please try again",
        ToastAndroid.LONG,
        ToastAndroid.CENTER
      );
      this.props.isConnected && this.props.disconnect();
      await this.setStateAsync({
        ...BaseStatePaymentWallet,
        amount: this.state.amount,
      });
      this.props.open({ view: "ConnectingWalletConnect" });
    }
  }

  async getOneUSD(token) {
    const array = [token];
    var myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    var requestOptions = {
      signal: this.controller.signal,
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${array.toString()}&vs_currencies=usd`,
      requestOptions
    );
    const result = await response.json();
    const usdConversion = array.map((x) => result[x].usd ?? 1);
    return usdConversion[0];
  }

  async getUSD() {
    const array = blockchain.tokens.map((token) => token.coingecko);
    var myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    var requestOptions = {
      signal: this.controller.signal,
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${array.toString()}&vs_currencies=usd`,
      requestOptions
    );
    const result = await response.json();
    const usdConversion = array.map((x) => result[x].usd ?? 1);
    setAsyncStorageValue({ usdConversion });
    this.context.setValue({ usdConversion });
  }

  async getBalances() {
    const tokensArrays = blockchain.tokens
      .filter(
        (token) =>
          token.address !== "0x0000000000000000000000000000000000000000"
      )
      .map((y) => y.address);
    const batchBalancesContract = new Contract(
      blockchain.batchBalancesAddress,
      abiBatchTokenBalances,
      this.provider
    );
    const nativeBalance = [
      (await this.provider.getBalance(this.state.address)) ?? 0n,
    ];
    const tokenBalances =
      (await batchBalancesContract.batchBalanceOf(
        this.state.address,
        tokensArrays
      )) ?? 0n;
    let balancesMerge = [...nativeBalance, ...tokenBalances];
    const balances = blockchain.tokens.map((x, i) =>
      formatUnits(balancesMerge[i], x.decimals)
    );
    const activeTokens = balances.map(
      (balance, i) =>
        balance >
        parseFloat(deleteLeadingZeros(formatInputText(this.state.amount))) /
          this.context.value.usdConversion[i]
    );
    await this.setStateAsync({
      balances,
      activeTokens,
    });
  }

  // Utils
  async setStateAsync(value) {
    return new Promise((resolve) => {
      this.setState(
        {
          ...value,
        },
        () => resolve()
      );
    });
  }

  // "Hooks"

  async componentDidUpdate(prevProps) {
    if (prevProps.address !== this.props.address && this.props.address) {
      await this.setStateAsync({ address: this.props.address });
      await this.getBalances();
      await this.getUSD();
      await this.setStateAsync({ stage: 1, loading: false });
    }
  }

  componentDidMount() {
    this.props.isConnected && this.props.disconnect();
  }

  componentWillUnmount() {
    this.props.isConnected && this.props.disconnect();
  }

  render() {
    return (
      <Fragment>
        <ImageBackground
          style={[GlobalStyles.container, { width: "100%" }]}
          source={backImage}
          resizeMode="cover"
          imageStyle={{
            opacity: 0.25,
            height: "auto",
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={[GlobalStyles.scrollContainer]}
            contentContainerStyle={[
              GlobalStyles.scrollContainerContent,
              { width: "90%", alignSelf: "center" },
            ]}
          >
            {this.state.stage === 0 && (
              <Fragment>
                <Text style={GlobalStyles.title}>Enter Amount (USD)</Text>
                <Text style={{ fontSize: 36, color: "white" }}>
                  {deleteLeadingZeros(formatInputText(this.state.amount))}
                </Text>
                <VirtualKeyboard
                  style={{
                    fontSize: 40,
                    textAlign: "center",
                    marginTop: -10,
                  }}
                  cellStyle={{
                    width: normalizeFontSize(100),
                    height: normalizeFontSize(50),
                    borderWidth: 1,
                    borderColor: rgbaToHex(255, 255, 255, 20),
                    borderRadius: 5,
                    margin: 3,
                  }}
                  rowStyle={{
                    width: "100%",
                  }}
                  color="white"
                  pressMode="string"
                  onPress={(amount) => this.setState({ amount })}
                  decimal
                />
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    width: "100%",
                  }}
                >
                  <Pressable
                    disabled={this.state.loading}
                    style={[
                      GlobalStyles.buttonStyle,
                      {
                        backgroundColor: "#000000aa",
                        borderColor: this.state.loading
                          ? secondaryColor
                          : secondaryColor + "aa",
                      },
                    ]}
                    onPress={() => {
                      this.setState({ loading: true });
                      this.props.open({ view: "ConnectingWalletConnect" });
                    }}
                  >
                    <Text style={GlobalStyles.buttonText}>Pay with Wallet</Text>
                  </Pressable>
                </View>
              </Fragment>
            )}
            {this.state.stage === 1 && (
              <Fragment>
                <Text style={[GlobalStyles.titlePaymentToken]}>
                  Select Payment Token
                </Text>
                <View style={{ width: "90%", flex: 1 }}>
                  {blockchain.tokens.map((token, i) =>
                    this.state.activeTokens[i] ? (
                      <View
                        key={`${token.name}-${i}`}
                        style={{
                          paddingBottom: 20,
                          marginBottom: 20,
                        }}
                      >
                        <Pressable
                          disabled={this.state.loading}
                          style={[
                            GlobalStyles.buttonStyle,
                            this.state.loading ? { opacity: 0.5 } : {},
                            {
                              backgroundColor: token.color,
                              borderColor: token.color,
                            },
                          ]}
                          onPress={async () => {
                            try {
                              await this.setStateAsync({
                                stage: 2,
                              });
                              const ethersProvider = new BrowserProvider(
                                this.props.walletProvider
                              );
                              const signer = await ethersProvider.getSigner();
                              if (i === 0) {
                                this.nativePayment(signer, i);
                              } else {
                                this.tokenPayment(signer, i);
                              }
                            } catch (error) {
                              console.log(error);
                              await this.setStateAsync({ loading: false });
                            }
                          }}
                        >
                          <Text style={GlobalStyles.buttonText}>
                            {token.name}
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Fragment key={`${token.name}-${i}`} />
                    )
                  )}
                  {this.state.activeTokens[0] && (
                    <View
                      key={`${"MXNB"}-`}
                      style={{
                        paddingBottom: 20,
                        marginBottom: 20,
                      }}
                    >
                      <Pressable
                        disabled={this.state.loading}
                        style={[
                          GlobalStyles.buttonStyle,
                          this.state.loading ? { opacity: 0.5 } : {},
                          {
                            backgroundColor: "#00ff44",
                            borderColor: "#00ff44",
                          },
                        ]}
                        onPress={async () => {
                          try {
                            await this.setStateAsync({
                              stage: 2,
                            });
                            const ethersProvider = new BrowserProvider(
                              this.props.walletProvider
                            );
                            const signer = await ethersProvider.getSigner();
                            this.mxnbPayment(signer, 0);
                          } catch (error) {
                            console.log(error);
                            await this.setStateAsync({ loading: false });
                          }
                        }}
                      >
                        <Text style={GlobalStyles.buttonText}>{"MXNB"}</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </Fragment>
            )}
            {this.state.stage === 2 && (
              <Fragment>
                <Text style={GlobalStyles.title}>Wallet Connected</Text>
                <View
                  style={{
                    width: normalizeFontSize(260),
                    height: normalizeFontSize(260),
                    borderRadius: normalizeFontSize(260),
                    borderWidth: 6,

                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: mainColor,
                  }}
                >
                  <MaterialIcons
                    name="account-balance-wallet"
                    size={normalizeFontSize(180)}
                    color={"white"}
                  />
                </View>
                <Text
                  style={{
                    fontSize: normalizeFontSize(22),
                    fontWeight: "bold",
                    color: "white",
                    textAlign: "center",
                    width: "85%",
                  }}
                >
                  {this.state.address !== "" &&
                    this.state.address.substring(
                      0,
                      Math.floor(this.state.address.length * (1 / 2))
                    ) +
                      "\n" +
                      this.state.address.substring(
                        Math.floor(this.state.address.length * (1 / 2)),
                        this.state.address.length
                      )}
                </Text>
                <Text style={GlobalStyles.title}>Sending Transactions...</Text>
              </Fragment>
            )}
            {this.state.stage === 3 && (
              <Fragment>
                <Image
                  source={checkMark}
                  alt="check"
                  style={{ width: "60%", height: "auto", aspectRatio: 1 }}
                />
                <Text
                  style={{
                    textShadowRadius: 1,
                    fontSize: 28,
                    fontWeight: "bold",
                    color: mainColor,
                  }}
                >
                  {"Completed"}
                </Text>
                <View
                  style={[
                    GlobalStyles.network,
                    {
                      width: "100%",
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 10,
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 20, color: "white" }}>
                        Transaction
                      </Text>
                      <Text style={{ fontSize: 14, color: "white" }}>
                        {"WC Payment"}
                      </Text>
                    </View>
                  </View>
                  {this.state.transactionDisplay.icon}
                  <Text style={{ color: "white" }}>
                    {`${deleteLeadingZeros(
                      formatInputText(this.state.transactionDisplay.amount)
                    )}`}{" "}
                    {this.state.transactionDisplay.name}
                  </Text>
                  <View style={{ width: 0, height: 1 }} />
                </View>
                <View style={GlobalStyles.buttonContainer}>
                  <Pressable
                    style={[
                      GlobalStyles.buttonStyle,
                      {
                        backgroundColor: "#000000aa",
                        borderColor: mainColor,
                      },
                    ]}
                    onPress={async () => {
                      console.log("View on Explorer");
                      console.log(this.state.explorerURL);
                      try {
                        WebBrowser.openBrowserAsync(this.state.explorerURL);
                      } catch (e) {
                        console.log(e);
                      }
                    }}
                  >
                    <Text style={GlobalStyles.buttonText}>
                      View on Explorer
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      GlobalStyles.buttonStyle,
                      {
                        backgroundColor: "#000000aa",
                        borderColor: tertiaryColor,
                      },
                    ]}
                    onPress={async () => {
                      this.setState(BaseStatePaymentWallet);
                    }}
                  >
                    <Text style={GlobalStyles.buttonText}>Done</Text>
                  </Pressable>
                </View>
              </Fragment>
            )}
          </ScrollView>
        </ImageBackground>
      </Fragment>
    );
  }
}

export default useHOCS(Tab2);
