// chains.js (Phiên bản an toàn)

const Ethereum = {
  hex: "0x1",
  name: "Ethereum",
  rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_ETH_KEY}`,
  ticker: "ETH",
};
const MumbaiTestnet = {
  hex: "0x13881",
  name: "Mumbai Testnet",
  rpcUrl: "https://rpc-mumbai.maticvigil.com", // Dùng RPC công khai (có thể chậm)
  ticker: "MATIC",
};
const Polygon = {
  hex: "0x89",
  name: "Polygon",
  rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_POLYGON_KEY}`,
  ticker: "MATIC",
};
const Avalanche = {
  hex: "0xa86a",
  name: "Avalanche",
  rpcUrl: `https://avax-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_AVAX_KEY}`,
  ticker: "AVAX",
};
const SepoliaTestnet = {
  hex: "0xaa36a7",
  name: "Sepolia Testnet",
  rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_SEPOLIA_KEY}`,
  ticker: "SepoliaETH",
};

export const CHAINS_CONFIG = {
  "0x1": Ethereum,
  "0x13881": MumbaiTestnet,
  "0x89": Polygon,
  "0xa86a": Avalanche,
  "0xaa36a7": SepoliaTestnet, // <-- Đảm bảo có Sepolia để demo
};
