import bodyParser from "body-parser";
import "dotenv/config";
import express from "express";
import CryptoBlockchain from "./class/cryptoBlockchain.js";

let MyCoin = new CryptoBlockchain();
console.log("MyCoin mining in progress...");

MyCoin.addNewBlock(
  MyCoin.createNewBlock({
    sender: "Iris Ljesnjanin",
    recipient: "Cosima Mielke",
    quantity: 50,
  })
);

MyCoin.addNewBlock(
  MyCoin.createNewBlock({
    sender: "Vitaly Friedman",
    recipient: "Ricardo Gimenes",
    quantity: 100,
  })
);
// console.log(JSON.stringify(MyCoin, null, 4));

const initHttpServer = (port) => {
  const app = express();
  app.use(bodyParser.json());

  app.get("/blocks", (req, res) => {
    res.send(JSON.stringify(MyCoin, null, 4));
  });
  app.post("/mineBlock", (req, res) => {
    const newBlock = MyCoin.createNewBlock(req.body.data);
    res.send(newBlock);
  });
  app.get("/peers", (req, res) => {
    res.send(
      getSockets().map(
        (s) => s._socket.remoteAddress + ":" + s._socket.remotePort
      )
    );
  });
  app.post("/addPeer", (req, res) => {
    connectToPeers(req.body.peer);
    res.send();
  });

  app.listen(port, () => {
    console.log(`MyCoin is listening http on port: ${port}`);
  });
};

const port = process.env.PORT || 3000;

initHttpServer(port);
