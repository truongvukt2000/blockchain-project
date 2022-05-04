import CryptoBlock from "./cryptoblock.js";

class CryptoBlockchain {
  constructor() {
    this.blockchain = [this.startGenesisBlock()];
    this.difficulty = 4;
  }

  startGenesisBlock() {
    return new CryptoBlock(
      0,
      "2021-02-02T15:20:46.633Z",
      "Initial Block in the Chain",
      "0",
      "000029be94384fdcf7ed2b7878f8e8c76acf431222155d8087873c9a123c2341"
    );
  }

  obtainLatestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  createNewBlock(data) {
    return new CryptoBlock(
      this.obtainLatestBlock().index + 1,
      new Date(),
      data,
      this.blockchain[this.blockchain.length - 1].hash
    );
  }

  addNewBlock(newBlock) {
    newBlock.precedingHash = this.obtainLatestBlock().hash;
    //newBlock.hash = newBlock.computeHash();
    newBlock.proofOfWork(this.difficulty);
    this.blockchain.push(newBlock);
  }

  // replaceChain(newBlocks) {
  // }

  checkChainValidity() {
    for (let i = 1; i < this.blockchain.length; i++) {
      const currentBlock = this.blockchain[i];
      const precedingBlock = this.blockchain[i - 1];

      if (precedingBlock.index + 1 !== currentBlock) {
        console.log("invalid index");
        return false;
      } else if (currentBlock.hash !== currentBlock.computeHash()) {
        console.log("invalid hash");
        return false;
      } else if (currentBlock.precedingHash !== precedingBlock.hash) {
        console.log("invalid previousHash");
        return false;
      }
    }
    return true;
  }
}

export default CryptoBlockchain;
