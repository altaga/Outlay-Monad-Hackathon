import "@walletconnect/react-native-compat";
import {
  createAppKit,
  defaultConfig,
  AppKit,
} from "@reown/appkit-ethers-react-native";
import { useEffect } from "react";

// 1. Get projectId from https://dashboard.reown.com
const projectId = "";

// 2. Create config
const metadata = {
  name: "AppKit RN",
  description: "AppKit RN Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "YOUR_APP_SCHEME://",
  },
};

const config = defaultConfig({ metadata });

// 3. Define your chains
const monad = {
  chainId: 10143,
  name: "Monad Testnet",
  currency: "MON",
  explorerUrl: "https://monad-testnet.socialscan.io/",
  rpcUrl: "https://monad-testnet.g.alchemy.com/v2/",
};

const chains = [monad];

// 4. Create modal
createAppKit({
  projectId,
  metadata,
  chains,
  config,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function WCprovider({ children }) {
  useEffect(() => {
    console.log("AppKit initialized");
  }, []);
  return (
    <>
      {children}
      <AppKit />
    </>
  );
}