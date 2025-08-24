const functions = require('@google-cloud/functions-framework');
const { JsonRpcProvider, parseEther, parseUnits, Interface, Wallet, Contract } = require("ethers");
const { privateKey: privateKeyCloud } = require("./secrets.js")
const { speiToBank, getClabes, depositToPlatform, getUSD } = require("./junoFunctions.js")
const {
    abi: ERC20abi,
} = require("@openzeppelin/contracts/build/contracts/ERC20.json");

const providerArb = new JsonRpcProvider(
    "https://arb-sepolia.g.alchemy.com/v2/xxxx"
);
const providerMon = new JsonRpcProvider(
    "https://monad-testnet.g.alchemy.com/v2/xxxxxxx"
);

// Basic Setup
const walletArb = new Wallet(privateKeyCloud, providerArb);
const walletMon = new Wallet(privateKeyCloud, providerMon);
const junoAddress = "0xc8fb8ef6F78DD86856e586F392F33519DaE462Ad";

functions.http('helloHttp', async (req, res) => {
    try {
        // Function
        const usdValues = await getUSD("sui", "mxnb");
        console.log(usdValues);
        const monMXN = usdValues[0] / usdValues[1];
        const amount = req.body.amount;
        const amountMXNB = epsilonRound(monMXN * amount, 6);
        // Transfer MON on MXNB eq to Pool.
        const transaction = {
            to: walletMon.address,
            value: parseEther(amount)
        }
        console.log(transaction)
        const tx1 = await wallet.sendTransaction(transaction);
        await tx1.wait();
        console.log(`https://monad-testnet.socialscan.io/tx/${tx1.hash}`)
        // Transfer MXNB from Pool to Juno
        const contract = new Contract("0x82B9e52b26A2954E113F94Ff26647754d5a4247D", ERC20abi, walletArb)
        const tx2 = await contract.transfer(junoAddress, parseUnits(amountMXNB.toString(), 6))
        await tx2.wait();
        console.log(`https://sepolia.arbiscan.io/tx/${tx2.hash}`)
        // Transfer MXNB from Juno to SPEI
        const mockId = "face_dd20371a-f9d8-43c8-82c1-09ab609ae2f4";
        await speiToBank({
            amount: parseInt(amountMXNB),
            destination_bank_account_id: mockId,
            asset: "mxn",
        })
        console.log("SPEI transfer complete")
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
