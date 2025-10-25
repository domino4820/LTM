import React from "react";
import mwallet from "../mwallet.png";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className="content">
        <img src={mwallet} alt="logo" className="frontPageLogo" />
        <h2> Xin chào 👋 </h2>
        <h4 className="h4"> Chào mừng đến ví điện tử Web3</h4>
        <Button
          onClick={() => navigate("/yourwallet")}
          className="frontPageButton"
          type="primary"
        >
          Tạo ví điện tử
        </Button>
        <Button
          onClick={() => navigate("/recover")}
          className="frontPageButton"
          type="default"
        >
          Đăng nhập bằng mã khôi phục ví
        </Button>
        <p className="frontPageBottom">
          Khám phá coin tiềm năng:{" "}
          <a href="https://moralismoney.com/" target="_blank" rel="noreferrer">
            money.moralis.io
          </a>
        </p>
      </div>
    </>
  );
}

export default Home;
