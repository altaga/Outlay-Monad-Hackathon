import "@walletconnect/react-native-compat";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
  useDisconnect,
} from "@reown/appkit-ethers-react-native";
import {
  useGlobalSearchParams,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";

export const useHOCS = (Component) => {
  const getCurrentRoute = (navigation) => {
    const state = navigation.getState();
    const currentRoute = state.routes[state.index].name;
    return currentRoute;
  };

  return (props) => {
    const navigation = useNavigation();
    const route = getCurrentRoute(navigation);
    const glob = useGlobalSearchParams();
    const local = useLocalSearchParams();
    const { walletProvider } = useAppKitProvider();
    const { open, close } = useAppKit();
    const { disconnect } = useDisconnect();
    const { address, isConnected } = useAppKitAccount();

    return (
      <Component
        glob={glob}
        local={local}
        navigation={navigation}
        route={route}
        open={open}
        address={address}
        close={close}
        disconnect={disconnect}
        walletProvider={walletProvider}
        isConnected={isConnected}
        {...props}
      />
    );
  };
};
