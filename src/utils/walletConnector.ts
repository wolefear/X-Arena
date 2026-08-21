/**
 * Real Web3 Wallet Connect & EIP-1193 Provider Handler
 */

export interface WalletConnectResult {
  address: string;
  chainId: string;
  providerName: string;
  balanceOkb: number;
  balanceUsdc: number;
}

export const XLAYER_MAINNET_PARAMS = {
  chainId: '0xc4', // 196 in hex
  chainName: 'X Layer Mainnet',
  nativeCurrency: {
    name: 'OKB',
    symbol: 'OKB',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.xlayer.tech', 'https://xlayerrpc.okx.com'],
  blockExplorerUrls: ['https://www.oklink.com/xlayer'],
};

/**
 * Request real wallet connection via injected Web3 Provider (OKX / MetaMask / Rabby / Phantom)
 */
export async function connectInjectedWeb3Wallet(preferredProvider: 'okx' | 'metamask' | 'any' = 'any'): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const anyWindow = window as any;
  let provider = anyWindow.ethereum;

  if (preferredProvider === 'okx') {
    provider = anyWindow.okxwallet?.ethereum || anyWindow.okxwallet || anyWindow.ethereum;
  } else if (preferredProvider === 'metamask') {
    if (anyWindow.ethereum?.providers) {
      provider = anyWindow.ethereum.providers.find((p: any) => p.isMetaMask) || anyWindow.ethereum;
    } else {
      provider = anyWindow.ethereum;
    }
  }

  if (!provider) {
    // Open install page or return null so UI shows informative message
    if (preferredProvider === 'okx') {
      window.open('https://www.okx.com/web3', '_blank');
    } else if (preferredProvider === 'metamask') {
      window.open('https://metamask.io/download/', '_blank');
    }
    throw new Error(`No ${preferredProvider === 'okx' ? 'OKX Wallet' : preferredProvider === 'metamask' ? 'MetaMask' : 'Web3 Wallet'} extension detected. Please install the wallet extension.`);
  }

  // Request accounts
  const accounts: string[] = await provider.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('User cancelled or no accounts authorized.');
  }

  const selectedAddress = accounts[0];

  // Try switching / adding X Layer Mainnet chain
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: XLAYER_MAINNET_PARAMS.chainId }],
    });
  } catch (switchError: any) {
    // 4902: Chain has not been added to wallet
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [XLAYER_MAINNET_PARAMS],
        });
      } catch (addError) {
        console.warn('User denied adding X Layer network:', addError);
      }
    }
  }

  return selectedAddress;
}
