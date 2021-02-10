import Onboard from "bnc-onboard";
import { ethers } from "ethers";
import contractWallet from "../build/contracts/WalletSpender.json";
import contractToken from "../build/contracts/TOEKN.json";
import contractPaymentManager from "../build/contracts/PaymentManager.json";
import contractWalletFactory from "../build/contracts/WalletFactory.json";
import tokenRouter from "../build/contracts/TokenRouter.json";
import uniswapFuntionABI from "../build/contracts/UniswapFunction.json";
import config from "../env.json"
import {WETH, Token, ChainId, Route, Trade, TradeType, TokenAmount, Percent, Fetcher} from "@uniswap/sdk"
const Gsn = require("@opengsn/gsn");

const dappId = "f55de6cc-5d4a-4115-b773-f6dde3bbf817";
const networkId = 1337;
const zeroAddress = "0x0000000000000000000000000000000000000000"

const walletFactoryAddress = config.contractAddresses.factory
const paymentManagerAddress = config.contractAddresses.paymentManager
const paymasterAddress = config.contractAddresses.paymaster

export default class ETHAPI {
  provider;
  ob;
  connected;

  onboard() {
    if (!this.ob) {
      this.ob = Onboard({
        dappId,
        hideBranding: true,
        networkId,
        subscriptions: {
          wallet: (wallet) => {
            this.provider = new ethers.providers.Web3Provider(wallet.provider);
          },
        },
        walletCheck: [
          {
            checkName: "accounts",
          },
          { checkName: "connect" },
          { checkName: "balance" },
        ],
      });
    }
    return this.ob;
  }

  async connect() {
    const result = await this.onboard().walletSelect();
    if (result) {
      this.connected = await this.onboard().walletCheck();
    }
  }

  isConnected() {
    return !!this.provider && !!this.ob;
  }

  getSigner() {
    return this.provider.getSigner();
  }

  async getAddress() {
    if (this.connected) {
      return this.getSigner().getAddress();
    }
  }

  async getAddressBalance(address = "") {
    return this.provider.getBalance(address || (await this.getAddress()));
  }

  async getTokenBalance(tokenAddress, address = "") {
    const _address = address || (await this.getAddress());
    const tokenContract = getTokenContract(tokenAddress);
    const signer = await this.getSigner();
    const tokenBal = await tokenContract.connect(signer).balanceOf(_address);
    return tokenBal;
  }

  async getTokenName(tokenAddress) {
    const tokenContract = getTokenContract(tokenAddress);
    const signer = await this.getSigner();
    const symbol = await tokenContract.connect(signer).symbol();
    return symbol;
  }

  async getTokenDecimals(tokenAddress) {
    const tokenContract = getTokenContract(tokenAddress);
    const signer = await this.getSigner();
    const decimals = await tokenContract.connect(signer).decimals();
    return decimals;
  }

  async getGaslessWalletAddress(index = 0) {
    const address = await this.getAddress();
    const salt = calcSalt(address, index);
    const gaslessAddress = buildCreate2Address(
      walletFactoryAddress,
      salt,
      contractWallet.bytecode
    );
    return gaslessAddress;
  }

  async getSupportedTokensAndFee() {
    const signer = await this.getSigner();
    const contract = getPaymentManagerContract(
      paymentManagerAddress
    );
    const addedTokensFilter = contract.filters.TokenUpdate();
    const removedTokensFilter = contract.filters.TokenRemoved();
    const removedTokens = await (
      await contract.connect(signer).queryFilter(removedTokensFilter)
    ).map((res) => res.args && res.args[0]);
    const addedTokens = await (
      await contract.connect(signer).queryFilter(addedTokensFilter)
    ).map((res) => {
      console.log({res}, "===========")
      return ({ address: res.args[0], func: res.args[1], fee: res.args[2].toString(), funcName: res.args[3].toString() })
    });
    const supportedTokens = addedTokens.filter(
      (token) => !removedTokens.includes(token.address)
    );
    console.log({ addedTokens, removedTokens, supportedTokens });
    return supportedTokens;
  }

  async sendGaslessTokenTx(tokenAddress, func, receipientAddress, amount, fee, addressIndex, address, privateKey="") {
    const gsnProvider = await this.getGSNProvider()
    // privateKey && await gsnProvider.provider.addAccount(privateKey)
    // const gsnSigner = await gsnProvider.getSigner(address, privateKey)
    const gsnSigner = await gsnProvider.getSigner(address)
    const walletFactory = getWalletFactoryContract(walletFactoryAddress)
    const tx = walletFactory.connect(gsnSigner)
    .gaslessTransferToken(tokenAddress, addressIndex, paymentManagerAddress, fee, func,  calcERC20TransferData(tokenAddress, receipientAddress, amount))
    console.log({tx})
  }
  
  async sendGaslessSwapTx(tokenAddress, func, fee, addressIndex, address, calldata, privateKey="") {
    const gsnProvider = await this.getGSNProvider()
    const gsnSigner = await gsnProvider.getSigner(address)
    const walletFactory = getWalletFactoryContract(walletFactoryAddress)
    const tx = walletFactory.connect(gsnSigner)
    .gaslessTransferToken(tokenAddress, addressIndex, paymentManagerAddress, fee, func,  calldata)
    console.log({tx})
  }

  async getGSNProvider() {
    let web3;
    const _win: any = window
    if (_win.ethereum) {
      web3 = _win.ethereum

    } else {
      console.log("using alternative")
      const Web3 = require("web3-providers-http");
      web3 = new Web3(config.providerURL);
    }

    const _gsnProvider = await Gsn.RelayProvider.newProvider({
      provider: web3,
      config: {
        paymasterAddress,
        verbose: false,
        preferredRelays: config.preferredRelays,
      },
    }).init();

    const gsnProvider = new ethers.providers.Web3Provider(_gsnProvider);
    return gsnProvider;
  }

  async getNetwork() {
    const net = (await (await this.provider).getNetwork()).name;
    return net;
  }

  toBigNumber(number) {
    return ethers.utils.parseEther(number);
  }

  async setSwapRouteTrade(_token0: any, _token1 =""){
    const net = await this.getNetwork()
    const signer = await this.getSigner()
    const chain = strToChainId(net)
    const token1 = WETH[chain]
    const token0 = new Token(chain, _token0.address, _token0.tokenDecimal)
    console.log({_token0, net, chain, cc: ChainId.GÖRLI}, "===========")
    const pair = await Fetcher.fetchPairData(token0, token1, signer)
    const route = new Route([pair], token0, token1)
    return {route, token0}
  }

  async getSwapDetails(route, token0, amount, to, percent='5', min=20){
    console.log(route, token0, amount, to)
    const trade = new Trade(route, new TokenAmount(token0, amount), TradeType.EXACT_INPUT)
    const slippageTolerance = new Percent(percent, '1000') //0.05%
    const deadline = Math.floor(Date.now() / 1000) + 60 * min
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw
    const amountIn = trade.inputAmount.raw
    const path = [route.path[0].address, route.path[1].address]
    const callData = new ethers.utils.Interface(uniswapFuntionABI.abi).encodeFunctionData("routeToken", [config.uniswapRouter, amountIn.toString(), amountOutMin.toString(), path, to, deadline])
    return {amountOutMin, amountIn, callData}
  }

}

const _getTrade = (route, token0) => async (amount: string) => {
  if(amount){
    return new Trade(route, new TokenAmount(token0, amount), TradeType.EXACT_INPUT)
  }
}

const netChain = {
  goerli: ChainId.GÖRLI,
  kovan: ChainId.KOVAN
}

const strToChainId = (net: string) => {
  return netChain[net]
}

function buildCreate2Address(creatorAddress, saltHex, byteCode) {
  return `0x${ethers.utils
    .keccak256(
      `0x${["ff", creatorAddress, saltHex, ethers.utils.keccak256(byteCode)]
        .map((x) => {
          return x.replace(/0x/, "");
        })
        .join("")}`
    )
    .slice(-40)}`.toLowerCase();
}
function calcSalt(sender, index) {
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [sender, index])
  );
}

function getTokenContract(tokenAddress) {
  const tokenContract = new ethers.Contract(tokenAddress, contractToken.abi);
  return tokenContract;
}

function getPaymentManagerContract(address) {
  const contract = new ethers.Contract(address, contractPaymentManager.abi);
  return contract;
}

function getWalletFactoryContract(address) {
    const contract = new ethers.Contract(address, contractWalletFactory.abi)
    return contract;
}

const calcERC20TransferData = (tokenAddress, to, value) => {
    return (new ethers.utils.Interface(tokenRouter.abi)).encodeFunctionData("routeToken", [ tokenAddress, to, value ]);
}

export const ethAPI = new ETHAPI();
