import fetch from "node-fetch";
export const getETHPrice = async () => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=vnd&ids=polkadot"
    );
    const data = await response.json();
    const dotPrice = data[0].current_price;
    return parseFloat(parseFloat(dotPrice).toFixed(2));
  } catch (error) {
    console.log(error);
  }
};


export const getDOTPriceInVND = (vnd, dot) => {
  return parseFloat(dot * vnd).toFixed(0);
};

