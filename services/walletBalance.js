export const getBalance = (address, unspentTxOuts) => {
  return _(unspentTxOuts)
    .filter((uTxO) => uTxO.address === address)
    .map((uTxO) => uTxO.amount)
    .sum();
};
