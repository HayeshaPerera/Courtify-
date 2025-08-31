import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, UX_MODE, WEB3AUTH_NETWORK } from "@web3auth/base";
import { AuthAdapter } from "@web3auth/auth-adapter";
import { XrplPrivateKeyProvider } from "@web3auth/xrpl-provider";
import { setWeb3auth, setProvider, setWeb3Authorized, setLoading, setUserInfo } from "../store/slices/authSlice";
import XrplService from "../services/common-services/XrplService.ts";
import { setXrpBalance, setXrplAccount } from "../store/slices/walletSlice";
import "./Web3AuthPage.css";

const clientId = process.env.WEB3AUTH_CLIENT_ID || "";

const Web3AuthPage = () => {
  const dispatch = useDispatch();
  const { web3auth, loading } = useSelector((state: any) => state.auth);

  useEffect(() => {
    //Configures Web3Auth to use the XRP Ledger testnet.
    const chainConfig = {
      chainNamespace: CHAIN_NAMESPACES.XRPL,
      chainId: "0x2",
      rpcTarget: "https://testnet-ripple-node.tor.us",
      wsTarget: "wss://s.altnet.rippletest.net",
      ticker: "XRP",
      tickerName: "XRPL",
      displayName: "xrpl testnet",
      blockExplorerUrl: "https://testnet.xrpl.org",
    };

    //Initializating web3auth and XRP integration
    const init = async () => {
      try {
        dispatch(setLoading(true));
        //Sets up a provider to sign XRP transactions with a private key.
        const xrplProvider = new XrplPrivateKeyProvider({
          config: {
            chainConfig: chainConfig,
          },
        });

        const web3auth = new Web3Auth({
          clientId,
          uiConfig: {
            appName: "W3A",
            theme: {
              primary: "red",
            },
            mode: "dark",
            logoLight: "https://web3auth.io/images/web3authlog.png",
            logoDark: "https://web3auth.io/images/web3authlogodark.png",
            defaultLanguage: "en",
            loginGridCol: 3,
            primaryButton: "externalLogin",
            uxMode: UX_MODE.REDIRECT,
          },
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider: xrplProvider,
        });

        const authAdapter = new AuthAdapter({
          loginSettings: {
            mfaLevel: "none",
          },
          adapterSettings: {
            mfaSettings: {
              deviceShareFactor: {
                enable: true,
                priority: 1,
                mandatory: true,
              },
              backUpShareFactor: {
                enable: true,
                priority: 2,
                mandatory: false,
              },
              socialBackupFactor: {
                enable: true,
                priority: 3,
                mandatory: false,
              },
              passwordFactor: {
                enable: true,
                priority: 4,
                mandatory: true,
              },
            },
          },
        });
        web3auth.configureAdapter(authAdapter);

        dispatch(setWeb3auth(web3auth));
        //Displays login modal
        await web3auth.initModal();

        if (web3auth.connected) {
          const userInfo = await web3auth.getUserInfo();
          dispatch(setUserInfo(userInfo));

          if (web3auth.provider) {
            dispatch(setProvider(web3auth.provider));
            const xrplService = new XrplService(web3auth.provider);
            const userAccount = await xrplService.getAccounts();
            dispatch(setXrplAccount(userAccount["account_data"]));
            const accBalance = await xrplService.getBalance();
            dispatch(setXrpBalance(accBalance));
            console.log("setting web3auth authorized", true);
            dispatch(setWeb3Authorized(true));
          } else {
            console.error("web3auth provider is null");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    init();
  }, [dispatch]);

  const web3authorize = async () => {
    try {
      if (!web3auth) {
        console.error("web3authorize error. web3auth not initialized yet.");
        return;
      }
      const web3authProvider = await web3auth.connect();
      dispatch(setProvider(web3authProvider));
      dispatch(setWeb3Authorized(true));
    } catch (error) {
      console.error("web3authorize error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
      <div
        className="login-bg"
        style={{
          minHeight: "100vh",
          width: "100vw",
          background: `linear-gradient(120deg, #e0ffe7 0%, #b4ebc0 100%), url("/greencourt.jpg") center center / cover no-repeat`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
      <div
        className="login-card"
        style={{
          background: "rgba(255,255,255,0.85)",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(34,139,34,0.18)",
          padding: "40px 36px 32px 36px",
          maxWidth: "370px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <img
          src={`${process.env.PUBLIC_URL}/logo.png`}
          alt="Courtify Logo"
          style={{
            width: "80px",
            marginBottom: "18px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(34,139,34,0.10)",
          }}
        />
        <h2 style={{ color: "#0e6304", marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>Courtify </h2>
        <p style={{ color: "#2e7d32", fontSize: "1rem", marginBottom: 28, textAlign: "center" }}>
          Book your favorite sports court anytime, anywhere.<br />
          
        </p>
        {loading ? (
          <div className="loading-spinner" style={{ margin: "24px 0" }}></div>
        ) : (
          <button
            className="login-button"
            onClick={web3authorize}
            style={{
              width: "100%",
              padding: "12px 0",
              background: "linear-gradient(90deg, #0e6304 60%, #4AB420 100%)",
              border: "none",
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(34,139,34,0.10)",
              transition: "background 0.2s",
              marginBottom: "8px"
            }}
          >
            sign up with Web3
          </button>
        )}
      </div>
    </div>
  );
};

export default Web3AuthPage;