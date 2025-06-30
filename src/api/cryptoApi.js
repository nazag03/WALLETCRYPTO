import axios from 'axios';

export const fetchCryptoPrices = async () => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'bitcoin,ethereum,litecoin,ripple',
          vs_currencies: 'usd',
        },
      }
    );
    const data = response.data;
    console.log('Datos de la API:', data);

    return {
      btc: data.bitcoin.usd,
      eth: data.ethereum.usd,
      ltc: data.litecoin.usd,
    };
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return {};
  }
};
