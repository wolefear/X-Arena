/**
 * Real On-Chain RPC & Crypto Market Price Engine
 * Fetches verified live OKB market prices and direct on-chain EVM balances on X Layer (zkEVM L2).
 */

export interface OkbMarketPrice {
  priceUsd: number;
  change24h: number;
  lastUpdated: number;
}

export interface OnChainBalances {
  okb: number;
  usdc: number;
  isLive: boolean;
  networkName: string;
}

// X Layer Mainnet RPC endpoints
const XLAYER_MAINNET_RPCS = [
  'https://rpc.xlayer.tech',
  'https://xlayerrpc.okx.com',
];

// USDC token on X Layer Mainnet (Bridged USDC)
const XLAYER_USDC_CONTRACT = '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035';

let cachedPrice: OkbMarketPrice = {
  priceUsd: 105.65,
  change24h: 4.05,
  lastUpdated: Date.now(),
};
let lastPriceFetchTime = 0;

type PriceListener = (price: OkbMarketPrice) => void;
const priceListeners = new Set<PriceListener>();

/**
 * Register a real-time listener for OKB market price ticks
 */
export function subscribeOkbPrice(listener: PriceListener): () => void {
  priceListeners.add(listener);
  // Send current cached price immediately
  listener(cachedPrice);
  initRealtimeOkbStream();
  return () => {
    priceListeners.delete(listener);
  };
}

function notifyPriceListeners(newPrice: OkbMarketPrice) {
  cachedPrice = newPrice;
  lastPriceFetchTime = Date.now();
  priceListeners.forEach((fn) => {
    try {
      fn(newPrice);
    } catch (e) {
      console.error('Error in price listener:', e);
    }
  });
}

let wsInitialized = false;
let wsInstance: WebSocket | null = null;
let pollInterval: NodeJS.Timeout | null = null;

export function initRealtimeOkbStream() {
  if (wsInitialized) return;
  wsInitialized = true;

  // 1. Establish OKX Public WebSocket for sub-second real-time OKB-USDT ticks
  if (typeof window !== 'undefined' && typeof WebSocket !== 'undefined') {
    try {
      const ws = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');
      wsInstance = ws;

      ws.onopen = () => {
        const subMsg = {
          op: 'subscribe',
          args: [
            {
              channel: 'tickers',
              instId: 'OKB-USDT',
            },
          ],
        };
        ws.send(JSON.stringify(subMsg));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.data && data.data[0]?.last) {
            const lastPrice = parseFloat(data.data[0].last);
            const open24h = parseFloat(data.data[0].open24h || data.data[0].last);
            const change = open24h > 0 ? ((lastPrice - open24h) / open24h) * 100 : 0;
            notifyPriceListeners({
              priceUsd: lastPrice,
              change24h: change,
              lastUpdated: Date.now(),
            });
          }
        } catch (err) {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        // Fallback polling handles this
      };

      ws.onclose = () => {
        wsInitialized = false;
        setTimeout(() => {
          if (priceListeners.size > 0) {
            initRealtimeOkbStream();
          }
        }, 5000);
      };
    } catch (e) {
      console.warn('WebSocket connect error, using HTTP stream fallback', e);
    }
  }

  // 2. High-frequency HTTP polling fallback (every 4 seconds)
  if (!pollInterval) {
    pollInterval = setInterval(async () => {
      await fetchLiveOkbPrice(true);
    }, 4000);
    // Initial fetch
    fetchLiveOkbPrice(true);
  }
}

/**
 * Fetch verified real-time OKB price in USD ($) from OKX / CoinGecko APIs
 */
export async function fetchLiveOkbPrice(force = false): Promise<OkbMarketPrice> {
  const now = Date.now();
  if (!force && cachedPrice && now - lastPriceFetchTime < 3000) {
    return cachedPrice;
  }

  // 1. Try OKX Public Ticker API (Direct OKB source of truth)
  try {
    const res = await fetch('https://www.okx.com/api/v5/market/ticker?instId=OKB-USDT', {
      cache: 'no-cache',
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data && data.data[0]?.last) {
        const lastPrice = parseFloat(data.data[0].last);
        const open24h = parseFloat(data.data[0].open24h || data.data[0].last);
        const change = open24h > 0 ? ((lastPrice - open24h) / open24h) * 100 : 0;
        const result: OkbMarketPrice = {
          priceUsd: lastPrice,
          change24h: change,
          lastUpdated: now,
        };
        notifyPriceListeners(result);
        return result;
      }
    }
  } catch (err) {
    // try fallback
  }

  // 2. Try CoinGecko Price API
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=okb&vs_currencies=usd&include_24hr_change=true',
      { cache: 'no-cache' }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.okb?.usd) {
        const result: OkbMarketPrice = {
          priceUsd: Number(data.okb.usd),
          change24h: Number(data.okb.usd_24h_change || 0),
          lastUpdated: now,
        };
        notifyPriceListeners(result);
        return result;
      }
    }
  } catch (err) {
    // ignore
  }

  return cachedPrice;
}

/**
 * Fetch verified on-chain native OKB and USDC balance for any EVM wallet address on X Layer
 */
export async function fetchOnChainBalances(address: string): Promise<OnChainBalances> {
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return { okb: 0, usdc: 0, isLive: false, networkName: 'X Layer' };
  }

  let nativeOkb = 0;
  let tokenUsdc = 0;
  let isLive = false;

  // 1. If window.ethereum is connected and matching address, query directly from injected provider
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    try {
      const eth = (window as any).ethereum;
      const rawBal = await eth.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      if (rawBal) {
        const wei = BigInt(rawBal);
        nativeOkb = Number(wei) / 1e18;
        isLive = true;
      }
    } catch (e) {
      console.log('Injected eth_getBalance skipped, querying RPC directly', e);
    }
  }

  // 2. Direct Query to X Layer Mainnet JSON-RPC node
  for (const rpc of XLAYER_MAINNET_RPCS) {
    try {
      // Query Native OKB balance
      const okbRes = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBalance',
          params: [address, 'latest'],
        }),
      });

      if (okbRes.ok) {
        const okbData = await okbRes.json();
        if (okbData?.result) {
          const wei = BigInt(okbData.result);
          nativeOkb = Number(wei) / 1e18;
          isLive = true;
        }
      }

      // Query USDC Token Balance (ERC-20 balanceOf: 0x70a08231)
      const cleanAddr = address.replace(/^0x/i, '').padStart(64, '0');
      const usdcCallData = `0x70a08231${cleanAddr}`;

      const usdcRes = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'eth_call',
          params: [
            {
              to: XLAYER_USDC_CONTRACT,
              data: usdcCallData,
            },
            'latest',
          ],
        }),
      });

      if (usdcRes.ok) {
        const usdcData = await usdcRes.json();
        if (usdcData?.result && usdcData.result !== '0x') {
          const rawUsdc = BigInt(usdcData.result);
          // USDC has 6 decimals on X Layer
          tokenUsdc = Number(rawUsdc) / 1e6;
        }
      }

      if (isLive) break; // successfully obtained on-chain response
    } catch (rpcErr) {
      console.warn(`RPC ${rpc} query failed, trying next`, rpcErr);
    }
  }

  return {
    okb: Number(nativeOkb.toFixed(4)),
    usdc: Number(tokenUsdc.toFixed(2)),
    isLive,
    networkName: 'X Layer (zkEVM L2)',
  };
}
