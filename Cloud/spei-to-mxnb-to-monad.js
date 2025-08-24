const functions = require('@google-cloud/functions-framework');
const { JsonRpcProvider, parseEther, Wallet } = require("ethers");
const { privateKey: privateKeyCloud } = require("./secrets.js")
const { getUSD, withdrawToAddress } = require("./junoFunctions.js")

const providerArb = new JsonRpcProvider(
  "https://arb-sepolia.g.alchemy.com/v2/xxxxxxxxxxxxxxx"
);
const providerMon = new JsonRpcProvider(
  "https://monad-testnet.g.alchemy.com/v2/cxxxcxcxc"
);

// Basic Setup
const walletArb = new Wallet(privateKeyCloud, providerArb);
const walletMon = new Wallet(privateKeyCloud, providerMon);

functions.http('helloHttp', async (req, res) => {
  try {
    // Function
    const usdValues = await getUSD("sui", "mxnb");
    const mxnMON = usdValues[1] / usdValues[0]
    const amount = req.body.amount;
    const to = req.body.to;
    const amountMON = epsilonRound(mxnMON * amount, 18);
    // Transfer from BANK to POOL
    await withdrawToAddress({
      "compliance": {},
      "amount": parseInt(amount).toString(),
      "address": walletArb.address,
      "blockchain": "ARBITRUM",
      "asset": "MXNB"
    })
    // Transfer MXNB on MON eq to User.
    const transaction = {
      to,
      value: parseEther(amountMON.toString())
    }
    const tx1 = await walletMon.sendTransaction(transaction);
    await tx1.wait();
    console.log(`https://monad-testnet.socialscan.io/tx/${tx1.hash}`)
    res.send({
      error: null,
      result: { hash: tx1.hash },
    });
  }
  catch (e) {
    console.log(e)
    res.send({
      error: "BAD REQUEST",
      result: null,
    });
  }
});

function epsilonRound(num, zeros = 4) {
  let temp = num;
  if (typeof num === "string") {
    temp = parseFloat(num);
  }
  return (
    Math.round((temp + Number.EPSILON) * Math.pow(10, zeros)) /
    Math.pow(10, zeros)
  );
}
