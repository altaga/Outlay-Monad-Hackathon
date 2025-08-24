import { Dimensions, Image, PixelRatio, Platform } from "react-native";
// Blockchain
import MON from "../assets/logos/mon.png";
import USDC from "../assets/logos/usdc.png";
import USDT from "../assets/logos/usdt.png";
import WBTC from "../assets/logos/wbtc.png";
import WETH from "../assets/logos/weth.png";
import WMON from "../assets/logos/wmon.png";
import YAKI from "../assets/logos/yaki.png";
import MXNB from "../assets/logos/mxnb.png";


const normalizeFontSize = (size) => {
  let { width, height } = Dimensions.get("window");
  if (Platform.OS === "web" && height / width < 1) {
    width /= 2.3179;
    height *= 0.7668;
  }
  const scale = Math.min(width / 375, height / 667); // Based on a standard screen size
  return PixelRatio.roundToNearestPixel(size * scale);
};

const w = normalizeFontSize(50);
const h = normalizeFontSize(50);

export const refreshTime = 1000 * 60 * 1;

export const iconsBlockchain = {
  mon: <Image source={MON} style={{ width: w, height: h, borderRadius: 10 }} />,
  yaki: (
    <Image source={YAKI} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  wmon: (
    <Image source={WMON} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  usdc: (
    <Image source={USDC} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  usdt: (
    <Image source={USDT} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  wbtc: (
    <Image source={WBTC} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  weth: (
    <Image source={WETH} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
  mxnb: (
    <Image source={MXNB} style={{ width: w, height: h, borderRadius: 10 }} />
  ),
};

export const blockchain = {
  network: "Monad Testnet",
  token: "MON",
  chainId: 10143,
  blockExplorer: "https://monad-testnet.socialscan.io/",
  rpc: [
    "https://monad-testnet.g.alchemy.com/v2/xxxxxxxxxxxxxxxx",
    "https://monad-testnet.drpc.org/",
    "https://monad-testnet.rpc.hypersync.xyz/",
    "https://10143.rpc.thirdweb.com/",
  ],
  rpcR: ["https://100.rpc.hypersync.xyz/xxxxxxxxxxxxxxxxx"],
  iconSymbol: "mon",
  decimals: 18,
  batchBalancesAddress: "0x6f4CFFef10929E4c4f4d5718aa506509850EEe98",
  color: "#836ef9",
  tokens: [
    {
      name: "Monad",
      color: "#836ef9",
      symbol: "MON",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      icon: iconsBlockchain.mon,
      coingecko: "sui", // Mock values
    },
    {
      name: "USD Coin",
      color: "#2775ca",
      symbol: "USDC",
      address: "0xf817257fed379853cde0fa4f97ab987181b1e5ea",
      decimals: 6,
      icon: iconsBlockchain.usdc,
      coingecko: "usd-coin",
    },

    {
      name: "Moyaki",
      color: "#836ef9",
      symbol: "YAKI",
      address: "0xfe140e1dce99be9f4f15d657cd9b7bf622270c50",
      decimals: 18,
      icon: iconsBlockchain.yaki,
      coingecko: "pudgy-penguins", // Mock values
    },
    {
      name: "Fantasy MON",
      color: "#836ef9",
      symbol: "fMON",
      address: "0x89e4a70de5f2ae468b18b6b6300b249387f9adf0",
      decimals: 18,
      icon: iconsBlockchain.mon,
      coingecko: "bio-protocol", // Mock values
    },
    {
      name: "Wrapped Monad",
      color: "#836ef9",
      symbol: "WMON",
      address: "0x760afe86e5de5fa0ee542fc7b7b713e1c5425701",
      decimals: 18,
      icon: iconsBlockchain.wmon,
      coingecko: "monad",
    },
    {
      name: "Tether",
      color: "#008e8e",
      symbol: "USDT",
      address: "0x88b8e2161dedc77ef4ab7585569d2415a1c1055d",
      decimals: 6,
      icon: iconsBlockchain.usdt,
      coingecko: "tether",
    },
    {
      name: "Wrapped Bitcoin",
      color: "#f39321",
      symbol: "WBTC",
      address: "0x6bb379a2056d1304e73012b99338f8f581ee2e18",
      decimals: 8,
      icon: iconsBlockchain.wbtc,
      coingecko: "wrapped-bitcoin",
    },
    {
      name: "Wrapped Ethereum",
      color: "#808080",
      symbol: "WETH",
      address: "0xb5a30b0fdc5ea94a52fdc42e3e9760cb8449fb37",
      decimals: 18,
      icon: iconsBlockchain.weth,
      coingecko: "weth",
    },
  ],
};
