import TxIn from "../class/txIn.js";
import TxOut from "../class/txOut.js";

const findTxOutsForAmount = (amount, myUnspentTxOuts) => {
  let currentAmount = 0;
  const includedUnspentTxOuts = [];
  for (const myUnspentTxOut of myUnspentTxOuts) {
    includedUnspentTxOuts.push(myUnspentTxOut);
    currentAmount = currentAmount + myUnspentTxOut.amount;
    if (currentAmount >= amount) {
      const leftOverAmount = currentAmount - amount;
      return { includedUnspentTxOuts, leftOverAmount };
    }
  }
  throw Error("not enough coins to send transaction");
};

const toUnsignedTxIn = (unspentTxOut) => {
  const txIn = new TxIn();
  txIn.txOutId = unspentTxOut.txOutId;
  txIn.txOutIndex = unspentTxOut.txOutIndex;
  return txIn;
};
const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(
  amount,
  myUnspentTxouts
);
const unsignedTxIns = includedUnspentTxOuts.map(toUnsignedTxIn);

const createTxOuts = (receiverAddress, myAddress, amount, leftOverAmount) => {
  const txOut1 = new TxOut(receiverAddress, amount);
  if (leftOverAmount === 0) {
    return [txOut1];
  } else {
    const leftOverTx = new TxOut(myAddress, leftOverAmount);
    return [txOut1, leftOverTx];
  }
};
