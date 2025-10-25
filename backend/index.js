const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/getTokens", async (req, res) => {
  const { userAddress, chain } = req.query;

  // 1. THÊM KIỂM TRA ĐẦU VÀO
  // Nếu frontend gọi mà không có 2 tham số này, trả về lỗi 400 (Bad Request)
  if (!userAddress || !chain) {
    return res.status(400).json({ error: "Thiếu userAddress hoặc chain" });
  }

  // 2. THÊM TRY...CATCH ĐỂ NGĂN SERVER SẬP
  try {
    const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
      chain: chain,
      address: userAddress,
    });

    const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
      chain: chain,
      address: userAddress,
      mediaItems: true,
    });

    // 3. Lọc ra các kết quả 'undefined' (cải thiện)
    const myNfts = nfts.raw.result
      .map((e, i) => {
        if (
          e?.media?.media_collection?.high?.url &&
          !e.possible_spam &&
          e?.media?.category !== "video"
        ) {
          return e["media"]["media_collection"]["high"]["url"];
        }
        return null; // Trả về null nếu không hợp lệ
      })
      .filter(Boolean); // Lọc bỏ tất cả các giá trị null

    const balance = await Moralis.EvmApi.balance.getNativeBalance({
      chain: chain,
      address: userAddress,
    });

    const jsonResponse = {
      tokens: tokens.raw,
      nfts: myNfts,
      balance: balance.raw.balance / 10 ** 18,
    };

    return res.status(200).json(jsonResponse);
  } catch (error) {
    // 4. NẾU MORALIS LỖI, TRẢ VỀ LỖI 500 MỘT CÁCH AN TOÀN
    console.error("LỖI KHI GỌI MORALIS:", error.message);
    return res
      .status(500)
      .json({ error: "Lỗi phía server, không thể lấy dữ liệu." });
  }
});

Moralis.start({
  apiKey: process.env.MORALIS_API_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
