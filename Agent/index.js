import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { tool } from "@langchain/core/tools";
import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import bodyParser from "body-parser";
import "dotenv/config";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod"; // Assuming zod is used for schema validation based on the `z.object` usage
import fs from "fs";
import { tokens } from "./constants.js";
import {
  formatUnits,
  Contract,
  FallbackProvider,
  JsonRpcProvider,
} from "ethers";

const abiPath =
  "app/node_modules/@openzeppelin/contracts/build/contracts/ERC20.json";
const { abi: abiERC20 } = JSON.parse(fs.readFileSync(abiPath, "utf-8"));

// RPC provider

const rpcs = [
  "https://monad-testnet.g.alchemy.com/v2/xxxxxxxxx",
  "https://monad-testnet.drpc.org/",
  "https://monad-testnet.rpc.hypersync.xyz/",
  "https://10143.rpc.thirdweb.com/",
];

function setupProvider(rpcs) {
  const providers = rpcs.map((rpc) => new JsonRpcProvider(rpc));
  return new FallbackProvider(
    providers.map((provider, i) => {
      return {
        provider,
        priority: i,
        weight: 1,
        stallTimeout: 2000,
      };
    })
  );
}

const provider = setupProvider(rpcs);

///////////////////////////////////////// Program Tools ////////////////////////////////////////

function epsilonRound(num, zeros = 9) {
  let temp = num;
  if (typeof num === "string") {
    temp = parseFloat(num);
  }
  return (
    Math.round((temp + Number.EPSILON) * Math.pow(10, zeros)) /
    Math.pow(10, zeros)
  );
}

async function fetchURL(url, body) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(body),
    redirect: "follow",
  };
  return new Promise((resolve, reject) => {
    fetch(url, requestOptions)
      .then((response) => response.json())
      .then(async (result) => {
        console.log(result);
        if (result.error === null) {
          resolve(result.result);
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        console.log(error);
        resolve(null);
      });
  });
}

////////////////////////////////////////// Agent Setup ////////////////////////////////////////

// This config will now be passed from the API request context
const config = (data = {}) => {
  return { configurable: { thread_id: uuidv4(), ...data } };
};

// Classes
const webSearchTool = new DuckDuckGoSearch({
  safeSearch: "strict",
  maxResults: 1,
});

// Model
const llm = new ChatOllama({
  model: "llama3.1:8b",
  temperature: 0.1,
  maxRetries: 2,
  keepAlive: "24h",
  numCtx: 1024 * 25,
});

// Get Tokens Balance
const getBalanceTokens = tool(
  async ({ token }, { configurable: { address } }) => {
    console.log("Get Balance Tool invoked with token:", token);
    const tokenSelected = tokens.findIndex(
      (tokenTemp) => tokenTemp.symbol === token
    );
    if (tokenSelected === -1) {
      return JSON.stringify({
        status: "error",
        message: "Token not found.",
      });
    }
    if (tokenSelected === 0) {
      const balance = await provider.getBalance(address);
      const finalBalance = epsilonRound(formatUnits(balance, 18));
      return JSON.stringify({
        status: "success",
        balance: `${finalBalance} Monad`,
      });
    } else {
      const contract = new Contract(
        tokens[tokenSelected].address,
        abiERC20,
        provider
      );
      const balance = await contract.balanceOf(address);
      const finalBalance = epsilonRound(
        formatUnits(balance, tokens[tokenSelected].decimals)
      );
      return JSON.stringify({
        status: "success",
        balance: `${finalBalance} ${tokenSelected.symbol}`,
      });
    }
  },
  {
    name: "get_balance_monad",
    description: `This tool retrieves the user's current X token balance, where X is any token on Monad Testnet. Use this when the user specifically asks for their token balance, 'token', "balance", or general wallet funds on Monad Testnet.
      
      This is the list of available tokens: ${tokens.map(
        (token) => `${token.symbol}, `
      )}
      `,
    schema: z.object({
      token: z.string(),
    }),
  }
);

// Transfer Tokens
const transferTokens = tool(
  async ({ amount, to, token }, { configurable: { user } }) => {
    const response = await fetchURL(process.env.EXECUTE_PAYMENT_API, {
      user,
      amount,
      token: tokens.findIndex((tokenTemp) => tokenTemp.symbol === token),
      destination: to,
    });
    if (response === null) {
      return JSON.stringify({
        status: "error",
        message: "Transaction failed.",
      });
    }
    const { hash } = response;
    return JSON.stringify({
      message: "Transaction created and available on Monad Testnet.",
      status: "success",
      transaction: hash,
    });
  },
  {
    name: "transfer_tokens",
    description: `This tool facilitates Tokens transfers on the Monad Testnet. It generates the transaction data for the user to sign. It activates whenever the user explicitly requests to send Tokens, initiates a transaction, or mentions terms like 'transfer,' 'Tokens,' or 'Monad Testnet' in relation to their wallet activity.

    This is the list of available tokens: ${tokens.map(
      (token) => `${token.symbol}, `
    )}
      `,
    schema: z.object({
      amount: z.string(),
      to: z.string(),
      token: z.string(),
    }),
  }
);

const swapTokens = tool(
  async ({ amount, fromToken, toToken }, { configurable: { user } }) => {
    const response = await fetchURL(process.env.SWAP_PAYMENT_API, {
      user,
      amount,
      fromToken,
      toToken,
    });
    console.log(response);
    if (response === null) {
      return JSON.stringify({
        status: "error",
        message: "Transaction failed.",
      });
    }
    const { hash } = response;
    return JSON.stringify({
      status: "success",
      message: "Your transaction is available on Monad Testnet.",
      transaction: hash,
    });
  },
  {
    name: "swap_tokens",
    description: `This tool facilitates token swaps on the Monad Testnet. It generates transaction data for the user to sign. It activates whenever the user explicitly requests to swap tokens, initiates a transaction, or mentions terms like 'swap,' 'token,' or 'Monad Testnet' in relation to their wallet activity.\n\nThe tool receives a token symbol like USDT, Monad, etc...
      
      This is the list of available tokens: ${tokens.map(
        (token) => `${token.symbol}, `
      )}
    `,
    schema: z.object({
      amount: z.string(),
      fromToken: z.string(),
      toToken: z.string(),
    }),
  }
);

// Monad to Spei

const transferToSpei = tool(
  async ({ amount }, { configurable: {  } }) => {
    const response = await fetchURL(process.env.MONAD_TO_SPEI, {
      amount,
    });
    console.log(response);
    if (response === null) {
      return JSON.stringify({
        status: "error",
        message: "Transaction failed.",
      });
    }
    const { hash } = response;
    return JSON.stringify({
      status: "success",
      message: "Your transaction is available on your CLABE.",
      transaction: hash,
    });
  },
  {
    name: "transfer_to_spei",
    description:
      "This tool facilitates MXNB Coin (MXNB) transfers from MONAD to Arbitrum Sepolia to a Spei CLABE account. It activates when the user explicitly requests to send MONAD to a CLABE or mentions relevant terms such as 'transfer,' 'MXNB,' 'Arbitrum Sepolia,' or 'Spei CLABE' in the context of wallet activity.",
    schema: z.object({
      amount: z.string(),
    }),
  }
);

// Spei to Monad

const transferToMonad = tool(
  async ({ amount }, { configurable: { address } }) => {
    const response = await fetchURL(process.env.SPEI_TO_MONAD, {
      amount,
      to: address,
    });
    console.log(response);
    if (response === null) {
      return JSON.stringify({
        status: "error",
        message: "Transaction failed.",
      });
    }
    const { hash } = response;
    return JSON.stringify({
      status: "success",
      message: "Your transaction is available on your MONAD wallet.",
      transaction: hash,
    });
  },
  {
    name: "transfer_to_monad",
    description:
      "This tool facilitates MXN SPEI transfers to Arbitrum Sepolia to MONAD Testnet. It activates when the user explicitly requests to send MXN SPEI to MONAD or mentions relevant terms such as 'transfer,'MONAD' 'MXNB,' 'Arbitrum Sepolia,' or 'Spei CLABE' in the context of wallet activity.",
    schema: z.object({
      amount: z.string(),
    }),
  }
);

// List of Tools - Modified for API response
const listOfTools = tool(
  () => {
    console.log("List of Tools Tool invoked.");
    return JSON.stringify({
      status: "info",
      message:
        "MONAI can help you fund your Kast card, transfer tokens on Monad Testnet, Swap tokens on Monad Testnet, and retrieve your current balance for any token on Monad Testnet.",
    });
  },
  {
    name: "list_of_tools",
    description:
      "This tool provides a list of available tools for the user to interact with. It activates whenever the user explicitly requests information about available tools, mentions terms like 'tools,' 'features,' or 'commands'. Or more generally, whenever the user wants to know what MONAI can do.",
    schema: z.object({}),
  }
);

// Fallback Tool - Modified for API response
const fallbackTool = tool(
  () => {
    console.log("Fallback Tool invoked.");
    return JSON.stringify({
      status: "info",
      message:
        "As stated above, say something friendly and invite the user to interact with you.",
    });
  },
  {
    name: "fallback",
    description:
      "This tool activates when the user greets the assistant with a simple 'hi' or 'hello' and asks for help. It provides a friendly and welcoming message to initiate the conversation.",
    schema: z.object({}),
  }
);

// Utils for Agent
function setInput(input) {
  return {
    messages: [
      {
        role: "system",
        content:
          "You are MONAI, a knowledgeable and friendly assistant. Focus on providing insights and guidance across various topics without returning code snippets. Maintain a professional and warm tone, adapting responses to suit user needs.",
      },
      {
        role: "user",
        content: input,
      },
    ],
  };
}

// Workflow Tools
const all_api_tools = [
  listOfTools,
  getBalanceTokens,
  fallbackTool,
  transferToMonad,
  transferToSpei,
  //transferTokens,
  //fundKastCard,
  //swapTokens,
];

const tools_node = new ToolNode(all_api_tools);
const llm_with_tools = llm.bindTools(all_api_tools);

// Workflow Utils
const call_model = async (state) => {
  console.log("Model Node");
  const response = await llm_with_tools.invoke(state.messages);
  return { messages: response };
};

function shouldContinue(state) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  console.log("Last message tool calls:", lastMessage["tool_calls"]);
  if (lastMessage["tool_calls"] && lastMessage["tool_calls"].length > 0) {
    return "tool";
  } else {
    return END;
  }
}

// Workflow
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("model", call_model)
  .addNode("tool", tools_node)
  .addConditionalEdges("model", shouldContinue, ["tool", END])
  .addEdge(START, "model")
  .addEdge("tool", "model");

const memory = new MemorySaver(); // For state management across turns if needed

// Graph Compilation
const graph = workflow.compile({ checkpointer: memory });

async function invokeAgent(message, contextData) {
  const input = setInput(message);
  const context = config(contextData); // Pass dynamic context (fromAddress, members)
  const output = await graph.invoke(input, context);
  const tool = output.messages[2]["tool_calls"]?.[0]?.name ?? null;
  let finalContent = output.messages[output.messages.length - 1].content;
  // Additional logic to handle specific tools or "modifiers"
  if (tool === "tool_name") {
    //finalContent = "Your balance is now available in your CLABE account.";
  }
  return { status: "success", message: finalContent, last_tool: tool };
}

///////////////////////////////////////// Express.js API Setup ////////////////////////////////////////

const app = express();
const port = process.env.PORT || 8000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Middleware for API Key authentication
app.use((req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.AI_URL_API_KEY) {
    console.warn("Unauthorized access attempt: Invalid or missing X-API-Key");
    return res.status(401).json({
      status: "error",
      message: "Unauthorized: Invalid or missing API Key.",
    });
  }
  next(); // Continue to the next middleware/route handler if API key is valid
});

// Main API endpoint to interact with the agent
app.post("/api/chat", async (req, res) => {
  const { message, context } = req.body;
  console.log("Received message:", message);
  console.log("Received context:", context);
  const contextData = context || {};
  const agentResponse = await invokeAgent(message, contextData);
  res.status(200).json(agentResponse);
});

// Basic health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "MONAI API is running." });
});

// Start the server
app.listen(port, () => {
  console.log(`MONAI API listening at http://localhost:${port}`);
});
