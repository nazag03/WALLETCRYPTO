export const fetchCryptoPrices = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,ripple&vs_currencies=usd');
      const data = await response.json();
      console.log('Datos de la API: ',data)
      return {
        btc: data.bitcoin.usd,
        eth: data.ethereum.usd,
        ltc: data.litecoin.usd,
        xrp: data.ripple.usd,
      };
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      return {};
    }
  };
  