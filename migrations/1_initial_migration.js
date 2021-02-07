const paymasterContract = artifacts.require("WalletPaymaster");
const factoryContract = artifacts.require("WalletFactory");
const tokenContract = artifacts.require("TOEKN");
const paymentManagerContract = artifacts.require("PaymentManager");
const mintManagerContract = artifacts.require("MintManager");
const tokenRouterContract = artifacts.require("TokenRouter");

const trustedForwarder = "0x24A634c219699F7c5d6E6a4dDb0cB9fAe425BBb0"
const relayHub = "0xC3bD7e253B2309d391f68983e17Bfce69F4383F6"

module.exports = async function (deployer) {

  await deployer.deploy(paymasterContract);
  const paymaster = await paymasterContract.deployed();
  
  await deployer.deploy(tokenContract, "TOKEN", "TKN", 1_000_000_000);
  const token = await tokenContract.deployed();

  await deployer.deploy(tokenRouterContract)
  const tokenRouter = await tokenRouterContract.deployed()

  await deployer.deploy(paymentManagerContract)
  const paymentManager = await paymentManagerContract.deployed()
  paymentManager.addNewAdminToken(token.address, tokenRouter.address, 2_505)

  await deployer.deploy(factoryContract, trustedForwarder, paymentManager.address);
  const factory = await factoryContract.deployed();

  await paymaster.setRelayHub(relayHub)
  await paymaster.setTrustedForwarder(trustedForwarder)
  await paymaster.setTarget(factory.address)

  await deployer.deploy(tokenContract, "SWIP", "SWIP", 1_000_000_000);
  const swip = await tokenContract.deployed();

  await deployer.deploy(mintManagerContract, trustedForwarder, tokenRouter.address)
  const mintManager = await mintManagerContract.deployed();
  await mintManager.setWalletFactoryAddress(factory.address)
  await mintManager.setPaymentManagerAddress(paymentManager.address)
  await mintManager.setMintValue(swip.address, 555_555) // user will be able to mint 555.555 swip tokens

  await swip.transfer(mintManager.address, 800_000_000) // transfer 800k swip to mintManager for gasless minting
  await paymaster.setTarget(mintManager.address) // paymaster should allow gasless tx to mintManager

  
  console.log({ paymaster: paymaster.address, factory: factory.address, TKNToken: token.address, paymentManager: paymentManager.address, swipToken: swip.address, mintManager: mintManager.address, tokenRouter: tokenRouter.address });
};
