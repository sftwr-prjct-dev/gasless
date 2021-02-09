import Onboard from "bnc-onboard";
import { ethers } from "ethers";
import contractWallet from "../build/contracts/WalletSpender.json";
import contractToken from "../build/contracts/TOEKN.json";
import contractPaymentManager from "../build/contracts/PaymentManager.json";
import contractWalletFactory from "../build/contracts/WalletFactory.json";
import tokenRouter from "../build/contracts/TokenRouter.json";
import config from "../env.json"
const Gsn = require("@opengsn/gsn");

const dappId = "f55de6cc-5d4a-4115-b773-f6dde3bbf817";
const networkId = 1337;

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

  async getTransactionCount() {
    const addr = await this.getAddress()
    const network = this.provider._network
    const availableTxs = []    
    if (network.chainId === 1337) {
      const currentBlock = await this.provider.getBlockNumber()
      for (let i = currentBlock; i >= 0; --i) {
        const txCountInBlock = await this.provider.getTransactionCount(addr, i)
        if(txCountInBlock > 0) {
          const blockTxs = await this.provider.getBlockWithTransactions(i)
          if(blockTxs && blockTxs.transactions) {
            if(blockTxs.transactions.length > 0) {
              blockTxs.transactions.map(tx => {
                if(addr.toLowerCase() === tx.from.toLowerCase()) {
                  availableTxs.push(tx.hash)                
                }
              })
            }
          }
        }
      }
      return { chain: 'local', txs: availableTxs.reverse() }

    } else {
      const availableTxs= []
      const isMain = network.chainId === 1 ? 'api' : `api-${network.name}`
      let response = await fetch(`https://${isMain}.etherscan.io/api?module=account&action=txlist&address=${addr}&sort=asc&apikey=DQF8KC7VD26XFFF7J89CPBJRP78EU754VV`)
      const { result } = await response.json()
      result.map(tx => {
          availableTxs.push(tx.hash)
      })
        
      return { chain: network.name, txs: availableTxs.reverse() }
    }

  }

  async generateWallet({ setWalletState, method, cb }) {
    const wallet = ethers.Wallet.createRandom()
    cb({ phrase: wallet.mnemonic.phrase, address: wallet.address })
    if(method === 'generating') {
      setWalletState(prevState => {
        return { ...prevState, generating: true, useLocal: true }
      })
    }
  }

  async createWallet({ phrase, passphrase }) {
    const wallet = ethers.Wallet.fromMnemonic(phrase)
    const encrypted = await wallet.encrypt(passphrase)
    return encrypted
  }

  async openLocalWallet({ encryptedWallet, passphrase }) {
    return ethers.Wallet.fromEncryptedJson(encryptedWallet, passphrase)
    
  }
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
