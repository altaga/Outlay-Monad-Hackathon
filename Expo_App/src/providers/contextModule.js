// Basic Imports
import React from "react";
import {blockchain} from "../core/constants"

const ContextModule = React.createContext();

// Context Provider Component

class ContextProvider extends React.Component {
  // define all the values you want to use in the context
  constructor(props) {
    super(props);
    this.state = {
      value: {
        address: "",
        balances: blockchain.tokens.map(() => 0),
        usdConversion: blockchain.tokens.map(() => 1),
        chatGeneral: [
          /**
            {
              message: `Hello i'm MONAI, your personal AI Agent, at your service!`,
              type: "system",
              time: Date.now(),
              tool: "",
            },
          */
        ],
        starter: false,
      },
    };
  }

  setValue = (value, then = () => {}) => {
    this.setState(
      {
        value: {
          ...this.state.value,
          ...value,
        },
      },
      () => then()
    );
  };

  setValueAsync = async (value, then = () => {}) => {
    await new Promise((resolve) =>
      this.setState(
        {
          value: {
            ...this.state.value,
            ...value,
          },
        },
        () => resolve()
      )
    );
    then();
  };

  render() {
    const { children } = this.props;
    const { value } = this.state;
    // Fill this object with the methods you want to pass down to the context
    const { setValue, setValueAsync } = this;

    return (
      <ContextModule.Provider
        // Provide all the methods and values defined above
        value={{
          value,
          setValue,
          setValueAsync,
        }}
      >
        {children}
      </ContextModule.Provider>
    );
  }
}

// Dont Change anything below this line

export { ContextProvider };
export const ContextConsumer = ContextModule.Consumer;
export default ContextModule;
