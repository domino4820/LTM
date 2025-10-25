import React, { useEffect, useState, useCallback } from "react";
import {
  Divider,
  Tooltip,
  List,
  Avatar,
  Spin,
  Tabs,
  Input,
  Button,
} from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logo from "../noImg.png";
import axios from "axios";
import { CHAINS_CONFIG } from "../chains";
import { ethers } from "ethers";

function WalletView({
  wallet,
  setWallet,
  seedPhrase,
  setSeedPhrase,
  selectedChain,
}) {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState(null);
  const [nfts, setNfts] = useState(null);
  const [balance, setBalance] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [amountToSend, setAmountToSend] = useState(null);
  const [sendToAddress, setSendToAddress] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [hash, setHash] = useState(null);

  // 1. TẠO HÀM getAccountTokens VỚI useCallback
  // Nó chỉ được tạo lại khi wallet hoặc selectedChain thay đổi
  const getAccountTokens = useCallback(async () => {
    setFetching(true);

    try {
      // Thêm try...catch cho axios
      const res = await axios.get(`http://localhost:3001/getTokens`, {
        params: {
          userAddress: wallet,
          chain: selectedChain,
        },
      });

      const response = res.data;

      if (response.tokens.length > 0) {
        setTokens(response.tokens);
      } else {
        setTokens(null); // Xóa token cũ nếu không có
      }

      if (response.nfts.length > 0) {
        setNfts(response.nfts);
      } else {
        setNfts(null); // Xóa NFT cũ nếu không có
      }

      setBalance(response.balance);
    } catch (error) {
      console.error("Lỗi khi lấy token:", error);
      // Bạn có thể thêm thông báo lỗi ở đây
    } finally {
      setFetching(false);
    }
  }, [wallet, selectedChain]); // <-- Dependencies cho useCallback

  // 2. HÀM GỬI GIAO DỊCH (ĐÃ THÊM VALIDATION)
  async function sendTransaction(to, amount) {
    // --- BẮT ĐẦU SỬA LỖI ---
    // 1. Kiểm tra đầu vào (Input Validation)
    if (!to || !amount) {
      console.error("Địa chỉ hoặc số lượng không hợp lệ");
      alert("Vui lòng nhập địa chỉ VÀ số lượng hợp lệ.");
      return;
    }

    if (!ethers.utils.isAddress(to)) {
      console.error("Địa chỉ không hợp lệ");
      alert("Địa chỉ 'Đến' không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    let amountToSend;
    try {
      // 2. Kiểm tra số lượng
      amountToSend = ethers.utils.parseEther(amount.toString());
    } catch (error) {
      console.error("Số lượng không hợp lệ:", amount);
      alert("Số lượng không hợp lệ. Vui lòng chỉ nhập số (ví dụ: 0.01).");
      return;
    }
    // --- KẾT THÚC SỬA LỖI ---

    const chain = CHAINS_CONFIG[selectedChain];

    // Kiểm tra cấu hình chain
    if (!chain || !chain.rpcUrl) {
      alert("Lỗi cấu hình RPC. Vui lòng kiểm tra file chains.js.");
      return;
    }

    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);

    const privateKey = ethers.Wallet.fromMnemonic(seedPhrase).privateKey;

    const walletSigner = new ethers.Wallet(privateKey, provider);

    const tx = {
      to: to,
      value: amountToSend, // <-- Dùng biến đã được parse an toàn
    };

    setProcessing(true);
    try {
      const transaction = await walletSigner.sendTransaction(tx);

      setHash(transaction.hash);
      const receipt = await transaction.wait();

      setHash(null);
      setProcessing(false);
      setAmountToSend(null);
      setSendToAddress(null);

      if (receipt.status === 1) {
        getAccountTokens(); // Gọi lại để làm mới số dư
      } else {
        console.log("Giao dịch thất bại");
        alert("Giao dịch thất bại!");
      }
    } catch (err) {
      // 3. (Cải thiện) Hiển thị lỗi rõ ràng hơn
      console.error("Lỗi khi gửi giao dịch:", err);
      alert(`Gửi giao dịch thất bại: ${err.reason || err.message}`);

      setHash(null);
      setProcessing(false);
    }
  }

  function logout() {
    setSeedPhrase(null);
    setWallet(null);
    setNfts(null);
    setTokens(null);
    setBalance(0);
    navigate("/");
  }

  // 3. SỬA LẠI useEffect (DÙNG 1 HOOK DUY NHẤT)
  useEffect(() => {
    // Hook này sẽ chạy khi component tải,
    // hoặc khi wallet thay đổi, hoặc khi selectedChain thay đổi.

    if (!wallet || !selectedChain) {
      setFetching(false); // Không làm gì nếu không có ví
      return;
    }

    // Đặt lại state trước khi gọi
    setNfts(null);
    setTokens(null);
    setBalance(0);

    getAccountTokens(); // Gọi hàm
  }, [wallet, selectedChain, getAccountTokens]); // <-- Dependencies cho useEffect

  const items = [
    // ... (Code cho 'items' không thay đổi - giữ nguyên)
    {
      key: "3",
      label: `Token`,
      children: (
        <>
          {tokens ? (
            <>
              <List
                bordered
                itemLayout="horizontal"
                dataSource={tokens}
                renderItem={(item, index) => (
                  <List.Item style={{ textAlign: "left" }}>
                    <List.Item.Meta
                      avatar={<Avatar src={item.logo || logo} />}
                      title={item.symbol}
                      description={item.name}
                    />
                    <div>
                      {(
                        Number(item.balance) /
                        10 ** Number(item.decimals)
                      ).toFixed(2)}{" "}
                      Token
                    </div>
                  </List.Item>
                )}
              />
            </>
          ) : (
            <>
              <span>Bạn chưa có token nào</span>
              <p className="frontPageBottom">
                Khám phá coin tiềm năng:{" "}
                <a
                  href="https://moralismoney.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  money.moralis.io
                </a>
              </p>
            </>
          )}
        </>
      ),
    },
    {
      key: "2",
      label: `NFT`,
      children: (
        <>
          {nfts ? (
            <>
              {nfts.map((e, i) => {
                return (
                  <>
                    {e && (
                      <img key={i} className="nftImage" alt="NFT" src={e} />
                    )}
                  </>
                );
              })}
            </>
          ) : (
            <>
              <span>Bạn chưa sở hữu NFT nào</span>
              <p className="frontPageBottom">
                Khám phá coin tiềm năng:{" "}
                <a
                  href="https://moralismoney.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  money.moralis.io
                </a>
              </p>
            </>
          )}
        </>
      ),
    },
    {
      key: "1",
      label: `Chuyển khoản`,
      children: (
        <>
          <h3>Số dư gốc </h3>
          <h1>
            {balance.toFixed(2)}{" "}
            {CHAINS_CONFIG[selectedChain]
              ? CHAINS_CONFIG[selectedChain].ticker
              : "ETH"}
          </h1>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}> Đến:</p>
            <Input
              value={sendToAddress}
              onChange={(e) => setSendToAddress(e.target.value)}
              placeholder="Địa chỉ nhận (0x...)"
            />
          </div>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}> Số lượng:</p>
            <Input
              value={amountToSend}
              onChange={(e) => setAmountToSend(e.target.value)}
              placeholder="Nhập số lượng token muốn gửi..."
            />
          </div>
          <Button
            style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
            type="primary"
            onClick={() => sendTransaction(sendToAddress, amountToSend)}
          >
            Gửi token
          </Button>
          {processing && (
            <>
              <Spin />
              {hash && (
                <Tooltip title={hash}>
                  <p>Di chuột để xem mã giao dịch</p>
                </Tooltip>
              )}
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <div className="content">
        <div className="logoutButton" onClick={logout}>
          <LogoutOutlined />
        </div>
        <div className="walletName">Ví điện tử</div>
        <Tooltip title={wallet}>
          <div>
            {wallet.slice(0, 4)}...{wallet.slice(38)}
          </div>
        </Tooltip>
        <Divider />
        {fetching ? (
          <Spin />
        ) : (
          <Tabs defaultActiveKey="1" items={items} className="walletView" />
        )}
      </div>
    </>
  );
}

export default WalletView;
