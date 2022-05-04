import "dotenv/config";
import express from "express";
import CryptoBlock from "./class/cryptoblock.js";
import CryptoBlockchain from "./class/cryptoBlockchain.js";

const app = express();

let smashingCoin = new CryptoBlockchain();
console.log("smashingCoin mining in progress...");

smashingCoin.addNewBlock(
  new CryptoBlock(1, "01/06/2020", {
    sender: "Iris Ljesnjanin",
    recipient: "Cosima Mielke",
    quantity: 50,
  })
);
smashingCoin.addNewBlock(
  new CryptoBlock(2, "01/07/2020", {
    sender: "Vitaly Friedman",
    recipient: "Ricardo Gimenes",
    quantity: 100,
  })
);
console.log(JSON.stringify(smashingCoin, null, 4));

app.get("/", (req, res) => {
  res.send(process.env.KEY);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Blockchain app is listening on port ${port}`);
});
