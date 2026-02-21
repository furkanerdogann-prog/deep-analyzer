// pages/api/coins.js
const CACHE_TTL = 6 * 60 * 60 * 1000;
let cachedCoins = null;
let lastFetch = 0;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (cachedCoins && Date.now() - lastFetch < CACHE_TTL) {
    return res.status(200).json({ ...cachedCoins, _cached: true });
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false',
      { headers: { Accept: 'application/json' } }
    );
    if (!response.ok) throw new Error('API hatası');
    const coins = await response.json();
    const coinList = coins.map(c => ({
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      id: c.id,
      rank: c.market_cap_rank,
      price: c.current_price,
      change24h: c.price_change_percentage_24h,
      marketCap: c.market_cap,
      image: c.image,
    }));
    const result = { total: coinList.length, coins: coinList, updated_at: new Date().toISOString() };
    cachedCoins = result;
    lastFetch = Date.now();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(200).json({ total: 0, coins: [], error: 'CoinGecko hatası', updated_at: new Date().toISOString() });
  }
}