const paymasterContract = artifacts.require("WalletPaymaster");
const factoryContract = artifacts.require("WalletFactory");
const tokenContract = artifacts.require("TOEKN");
const paymentManagerContract = artifacts.require("PaymentManager");
const mintManagerContract = artifacts.require("MintManager");
const tokenRouterContract = artifacts.require("TokenRouter");
const uniswapFunctionContract = artifacts.require("UniswapFunction");
const config = require("../env.json")

const testnetTokens = {
  "kovan-fork": [
    {
      name: "TTKN", address: "0xe17639e0907d1764f565e73a6f14b836432fb55d"
    },
    {
      name: "CHAINLINK", address: "0xa36085f69e2889c224210f603d836748e7dc0088"
    }
  ],
  "kovan": [
    {
      name: "TTKN", address: "0xe17639e0907d1764f565e73a6f14b836432fb55d"
    },
    {
      name: "CHAINLINK", address: "0xa36085f69e2889c224210f603d836748e7dc0088"
    }
  ],
  "binance": [
    {
      name: "BUSD", address: "0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee", fee: "10000000000000000"
    },
    {
      name: "LINK", address: "0x84b9b910527ad5c03a9ca831909e21e236ea7b06", fee: "500000000000000"
    },
    {
      name: "DAI", address: "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867", fee: "10000000000000000"
    },
    {
      name: "XRP", address: "0xa83575490D7df4E2F47b7D38ef351a2722cA45b9", fee: "200000000000000"
    },
    {
      name: "ETH", address: "0xd66c6B4F0be8CE5b39D52E0Fd1344c389929B378", fee: "300000000000000"
    },
    {
      name: "BTCB", address: "0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8", fee: "1000000000000"
    },
  ]
}


module.exports = async function (deployer, network) {
  let isLocal = network === 'development' ? 'unknown' : network
  const trustedForwarder = config[isLocal].relay.Forwarder
  const relayHub = config[isLocal].relay.RelayHub
  
  console.log(`Using ${network}`)
  // if(1===1)return
  await deployer.deploy(paymasterContract);
  const paymaster = await paymasterContract.deployed();

  console.log('deployed paymaster at', paymaster.address)
  
  // await deployer.deploy(tokenContract, "TOKEN", "TKN", 1_000_000_000);
  // const token = await tokenContract.deployed();
  
  await deployer.deploy(tokenRouterContract)
  const tokenRouter = await tokenRouterContract.deployed()
  console.log('deployed tokenRouter at', tokenRouter.address)
  
  await deployer.deploy(uniswapFunctionContract)
  const uniswapFunction = await uniswapFunctionContract.deployed()
  console.log('deployed uniswapFunction at', uniswapFunction.address)
  
  await deployer.deploy(paymentManagerContract)
  const paymentManager = await paymentManagerContract.deployed()
  console.log('deployed paymentManager at', paymentManager.address)
  
  for (let token of testnetTokens[network]) {
    let admin = await paymentManager.addNewAdminToken(token.address, tokenRouter.address, token.fee, `Transfer ${token.name}`)
    console.log(`added new admin token for ${token.name} - ${admin.address}`)
    
    admin = await paymentManager.setAdminTokenFee(token.address, uniswapFunction.address, token.fee, `Swap ${token.name}`)
    console.log(`uniswap admin token fee set for ${token.name} - ${admin.address}`)
  }

  await deployer.deploy(factoryContract, trustedForwarder, paymentManager.address);
  const factory = await factoryContract.deployed();
  console.log('deployed factory at', factory.address)
  
  await paymaster.setRelayHub(relayHub)
  console.log(`relay hub: ${relayHub} now set on ${network}`)
  await paymaster.setTrustedForwarder(trustedForwarder)
  console.log(`trusted forwarder: ${trustedForwarder} now set`)
  await paymaster.setTarget(factory.address)
  console.log(`paymaster ${paymaster.address} set target for factory: ${factory.address}`)
  
  // await deployer.deploy(tokenContract, "SWIP", "SWIP", 1_000_000_000);
  // const swip = await tokenContract.deployed();
  
  // await deployer.deploy(mintManagerContract, trustedForwarder, tokenRouter.address)
  // const mintManager = await mintManagerContract.deployed();
  // console.log('deployed mint manager at', mintManager.address)
  
  // await mintManager.setWalletFactoryAddress(factory.address)
  // console.log(`wallet factory ${factory.address} set for mint manager ${mintManager.address}`)
  
  // await mintManager.setPaymentManagerAddress(paymentManager.address)
  // console.log(`payment manager ${paymentManager.address} set for mint manager ${mintManager.address}`)

  // for (let token of testnetTokens[network]) {
  //   await mintManager.setMintValue(token.address, 20)
  //   console.log(`mint value of is specified for mint manager for ${}`)
  // }

  
  // await swip.transfer(mintManager.address, 800_000_000) // transfer 800k swip to mintManager for gasless minting
  // await paymaster.setTarget(mintManager.address) // paymaster should allow gasless tx to mintManager
  // console.log(`paymaster added mintManager: ${mintManager} as target on ${network}`)
  // console.log(JSON.stringify({ paymaster: paymaster.address, factory: factory.address, TKNToken: token.address, paymentManager: paymentManager.address, swipToken: swip.address, mintManager: mintManager.address, tokenRouter: tokenRouter.address, uniswapFunction: uniswapFunction.address }));
  console.log(JSON.stringify({ network, paymaster: paymaster.address, factory: factory.address, tokens: testnetTokens, paymentManager: paymentManager.address, tokenRouter: tokenRouter.address, uniswapFunction: uniswapFunction.address }));
};
