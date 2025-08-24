import { Contract, formatUnits } from "ethers";
import { fetch } from "expo/fetch";
import { Component, Fragment } from "react";
import {
  ImageBackground,
  Keyboard,
  NativeEventEmitter,
  RefreshControl,
  ScrollView,
  Text,
  View
} from "react-native";
import backImage from "../../../assets/backgrounds/backgroundMain.png";
import ReceiveQR from "../../../components/recieveQR";
import { abiBatchTokenBalances } from "../../../contracts/batchTokenBalances";
import { blockchain, refreshTime } from "../../../core/constants";
import GlobalStyles, { mainColor } from "../../../core/styles";
import {
  arraySum,
  epsilonRound,
  getAsyncStorageValue,
  setAsyncStorageValue,
  setupProvider
} from "../../../core/utils";
import { useHOCS } from "../../../hocs/useHOCS";
import ContextModule from "../../../providers/contextModule";

const baseMainState = {
  // Transaction settings
  amount: "",
  loading: false,
  take: false,
  keyboardHeight: 0,
  selector: 0,
  qrData: "",
};

class Tab1 extends Component {
  constructor(props) {
    super(props);
    this.state = baseMainState;
    this.provider = setupProvider(blockchain.rpc);
    this.providerRead = setupProvider(blockchain.rpcR);
    this.EventEmitter = new NativeEventEmitter();
    this.controller = new AbortController();
  }

  static contextType = ContextModule;

  async getlastRefresh() {
    try {
      const lastRefresh = await getAsyncStorageValue("lastRefresh");
      if (lastRefresh === null) throw "Set First Date";
      return lastRefresh;
    } catch (err) {
      await setAsyncStorageValue({ lastRefresh: 0 });
      return 0;
    }
  }

  async componentDidMount() {
    const interval = setInterval(async () => {
      const publicKey = this.context.value.address;
      if (publicKey !== "") {
        clearInterval(interval);
        // Event Emitter
        this.EventEmitter.addListener("refresh", async () => {
          Keyboard.dismiss();
          await this.setStateAsync(baseMainState);
          await setAsyncStorageValue({ lastRefresh: Date.now() });
          this.refresh();
        });
        // Get Last Refresh
        const lastRefresh = await this.getlastRefresh();
        if (Date.now() - lastRefresh >= refreshTime) {
          console.log("Refreshing...");
          await setAsyncStorageValue({ lastRefresh: Date.now() });
          this.refresh();
        } else {
          console.log(
            `Next refresh Available: ${Math.round(
              (refreshTime - (Date.now() - lastRefresh)) / 1000
            )} Seconds`
          );
        }
      }
    }, 1000);
    setTimeout(() => this.setState({ cameraDelayLoading: true }), 1);
  }

  componentWillUnmount() {
    this.EventEmitter.removeAllListeners("refresh");
  }

  async refresh() {
    await this.setStateAsync({ refreshing: true });
    try {
      await Promise.all([this.getUSD(), this.getBalances()]);
    } catch (e) {
      console.log(e);
    }
    await this.setStateAsync({ refreshing: false });
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
      (await this.provider.getBalance(this.context.value.address)) ?? 0n,
    ];
    const tokenBalances =
      (await batchBalancesContract.batchBalanceOf(
        this.context.value.address,
        tokensArrays
      )) ?? 0n;
    let balancesMerge = [...nativeBalance, ...tokenBalances];
    const balances = blockchain.tokens.map((x, i) =>
      formatUnits(balancesMerge[i], x.decimals)
    );
    console.log(balances);
    this.context.setValue({ balances });
    await setAsyncStorageValue({ balances });
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

  render() {
    return (
      <ImageBackground
        style={[GlobalStyles.container]}
        source={backImage}
        resizeMode="cover"
        imageStyle={{
          opacity: 0.15,
          height: "auto",
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            this.context.value.address !== "" && (
              <RefreshControl
                progressBackgroundColor={mainColor}
                refreshing={this.state.refreshing}
                onRefresh={async () => {
                  await setAsyncStorageValue({
                    lastRefresh: Date.now().toString(),
                  });
                  await this.refresh();
                }}
              />
            )
          }
          style={[
            GlobalStyles.scrollContainer,
            { marginTop: 50, marginBottom: 15 },
          ]}
          contentContainerStyle={[
            GlobalStyles.scrollContainerContent,
            { width: "96%", alignSelf: "center", height: "auto" },
          ]}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              marginVertical: 20,
            }}
          >
            <Text style={[GlobalStyles.title]}>Balance</Text>
            <Text style={[GlobalStyles.balance]}>
              {`$ ${epsilonRound(
                arraySum(
                  this.context.value.balances.map(
                    (balance, i) =>
                      balance * this.context.value.usdConversion[i]
                  )
                ),
                2
              )} USD`}
            </Text>
          </View>
          <ReceiveQR />
          <View style={{ width: "100%" }} />
          {this.state.selector === 0 && (
            <Fragment>
              {blockchain.tokens.map((token, i) => (
                <View key={`${i}`} style={GlobalStyles.network}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-around",
                    }}
                  >
                    <View style={GlobalStyles.networkMarginIcon}>
                      {token.icon}
                    </View>
                    <View style={{ justifyContent: "center" }}>
                      <Text style={GlobalStyles.networkTokenName}>
                        {token.name}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Text style={GlobalStyles.networkTokenData}>
                          {this.context.value.balances[i] === 0
                            ? "0"
                            : this.context.value.balances[i] < 0.001
                            ? "<0.001"
                            : epsilonRound(
                                this.context.value.balances[i],
                                3
                              )}{" "}
                          {token.symbol}
                        </Text>
                        <Text style={GlobalStyles.networkTokenData}>
                          {`  -  ($${epsilonRound(
                            this.context.value.usdConversion[i],
                            4
                          )} USD)`}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ marginHorizontal: 20 }}>
                    <Text style={{ color: "white" }}>
                      $
                      {epsilonRound(
                        this.context.value.balances[i] *
                          this.context.value.usdConversion[i],
                        2
                      )}{" "}
                      USD
                    </Text>
                  </View>
                </View>
              ))}
            </Fragment>
          )}
        </ScrollView>
      </ImageBackground>
    );
  }
}

export default useHOCS(Tab1);
