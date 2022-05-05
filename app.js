const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const momentTZ = require("moment-timezone");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

class transaction {
  constructor(sender, receiver, value) {
    this.sender = sender;
    this.receiver = receiver;
    this.value = value;
  }
}

class block {
  constructor(index, transactionList, prevHash) {
    this.index = index;
    this.timestamp = momentTZ.tz("Asia/Bangkok").unix();
    this.transactionList = transactionList;
    this.prevHash = prevHash;
    this.autoIncrease = 0;
    this.hash = this.getHash();
  }

  getHash() {
    const encrypt =
      JSON.stringify(this.transactionList) +
      this.prevHash +
      this.index +
      this.timestamp +
      this.autoIncrease;
    const hash = crypto
      .createHmac("sha256", "Blockchain")
      .update(encrypt)
      .digest("hex");
    return hash;
  }

  mine(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.autoIncrease++;
      this.hash = this.getHash();
    }
    console.log("Mining is done: " + this.hash);
  }
}

class blockchain {
  constructor() {
    this.chain = [];
    this.difficulty = 5;
    this.chain.push(new block(0, [], "0"));
    this.suspendedTransaction = []; // unspent transaction
    this.bonus = 5; // cost for miner
  }

  getZERO() {
    return 0;
  }

  mineEmoney(myWallet) {
    const index = this.chain.length;
    const suspendedTransaction = this.suspendedTransaction;
    const prevHash =
      this.chain.length !== 0 ? this.chain[this.chain.length - 1].hash : 0;
    const difficulty = this.difficulty;

    let blockItem = new block(index, suspendedTransaction, prevHash);
    blockItem.mine(difficulty);
    this.chain.push(blockItem);

    this.suspendedTransaction = [new transaction(null, myWallet, this.bonus)];
  }

  createTransaction(newTransaction) {
    this.suspendedTransaction.push(newTransaction);
  }

  checkMoneyInWallet(myWallet) {
    const indexOfWallet = wallets.findIndex((element) => element == myWallet);
    let moneyInWallet = Number(moneyInWallets[indexOfWallet]);
    this.chain.map((block) => {
      block.transactionList.map((transaction) => {
        if (transaction.sender === myWallet) {
          moneyInWallet -= Number(transaction.value);
        }
        if (transaction.receiver === myWallet) {
          moneyInWallet += Number(transaction.value);
        }
      });
    });
    return moneyInWallet;
  }

  chainIsValid() {
    for (let i = 0; i < this.chain.length; i++) {
      if (this.chain[i].hash !== this.chain[i].getHash()) {
        return false;
      }
      if (i > 0 && this.chain[i].prevHash !== this.chain[i - 1].hash) {
        return false;
      }
    }
    return true;
  }
}

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());

let MyCoin = new blockchain();
let wallets = ["A", "B", "C"];
let moneyInWallets = [10, 15, 20];
let transactionsList = [];

app.post("/login", (req, res) => {
  const wallet = req.body.wallet;
  const password = req.body.password;
  if (wallets.includes(wallet) && password === "12345") {
    res.cookie("wallet", wallet);
    res.redirect("/");
  }
});

app.get("/", (req, res) => {
  if (req.cookies.wallet) {
    const transactions = transactionsList.map(
      (i) =>
        `Bên gửi: ${i.sender}, bên nhận: ${i.receiver}, số coin: ${i.value}`
    );
    // console.log(transactionsList);
    const moneyInWallet = MyCoin.checkMoneyInWallet(req.cookies.wallet);
    const suspendedTransactions = MyCoin.suspendedTransaction.map(
      (i) =>
        `Bên gửi: ${i.sender}, bên nhận: ${i.receiver}, số coin: ${i.value}`
    );

    res.render("index", {
      wallets,
      transactions,
      suspendedTransactions,
      walletName: req.cookies.wallet,
      moneyInWallet,
    });
  } else {
    res.render("login");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app
  .route("/wallets")
  .post((req, res) => {
    const wallet = req.body.wallet;

    if (wallet === "") {
      return res.render("register", {
        msg: "Tên ví không được trống.",
        wallets,
      });
    }

    if (wallets.includes(wallet)) {
      return res.render("register", {
        msg: "Tên ví đã tồn tại.",
        wallets,
      });
    }

    wallets.push(wallet);
    moneyInWallets.push(0);
    res.cookie("wallet", wallet);
    res.redirect("/");
  })
  .get((req, res) => {
    res.send({
      wallets,
    });
  });

app
  .route("/transaction")
  .get((req, res) => {
    const suspendedTransactions = MyCoin.suspendedTransaction.map(
      (i) =>
        `Bên gửi: ${i.sender}, bên nhận: ${i.receiver}, số coin: ${i.value}`
    );
    const moneyInWallet = MyCoin.checkMoneyInWallet(req.cookies.wallet);

    // res.render("index", {
    //   wallets,
    //   suspendedTransactions,
    //   moneyInWallet,
    // });
    res.redirect("/");
    // res.send(MyCoin.suspendedTransaction);
  })
  .post((req, res) => {
    const sender = req.cookies.wallet,
      receiver = req.body.receiver,
      money = req.body.money;

    if (!wallets.includes(sender)) {
      return res.status(400).send("Ví gửi tiền không tồn tại.");
    }
    if (!wallets.includes(receiver)) {
      return res.status(400).send("Ví nhận tiền không tồn tại.");
    }
    const moneyInWallet = MyCoin.checkMoneyInWallet(req.cookies.wallet);
    if (money > moneyInWallet) {
      return res.status(400).send("Ví không đủ tiền để thực hiện.");
    }
    MyCoin.createTransaction(new transaction(sender, receiver, money));
    const suspendedTransactions = MyCoin.suspendedTransaction.map(
      (i) =>
        `Bên gửi: ${i.sender}, bên nhận: ${i.receiver}, số coin: ${i.value}`
    );

    // res.render("index", {
    //   msg: "Tạo giao dịch thành công.",
    //   wallets,
    //   suspendedTransactions,
    //   moneyInWallet,
    // });
    res.redirect("/");
  });

app.post("/mine/:wallet", (req, res) => {
  const wallet = req.params.wallet;
  if (!wallets.includes(wallet)) {
    return res.status(400).send("Ví của bạn không tồn tại.");
  }
  if (MyCoin.suspendedTransaction.length === 0) {
    return res.status(400).send("Không có giao dịch đang chờ.");
  }
  console.log("Bắt đầu đào tiền ảo...");
  transactionsList.push(MyCoin.suspendedTransaction[0]);
  MyCoin.mineEmoney(wallet);
  const chainLength = MyCoin.chain.length;
  const transactions = JSON.stringify(MyCoin.chain, true, 2);
  console.log(transactions);
  MyCoin.suspendedTransaction = [];
  res.redirect("/");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
