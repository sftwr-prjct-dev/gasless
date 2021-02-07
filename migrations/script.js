const Gsn = require("@opengsn/gsn");
const ethers = require("ethers");
const {contractAddresses, mnemonics, providerURL, testAddress, useProviderSigner, stage} = require("../env.json")

const factory = require("../build/contracts/WalletFactory.json");
const token = require("../build/contracts/TOEKN.json");
const spender = require("../build/contracts/WalletSpender.json");
const walletPaymaster = require("../build/contracts/WalletPaymaster.json");
const mintManager = require("../build/contracts/MintManager.json");
const tokenRouter = require("../build/contracts/TokenRouter.json");

const paymasterAddress = contractAddresses.paymaster
const factoryAddress = contractAddresses.factory
const tokenAddress = contractAddresses.TKNToken
const paymentManagerAddress = contractAddresses.paymentManager // also fee receiver
const swipTokenAddress = contractAddresses.swipToken
const mintManagerAddress = contractAddresses.mintManager
const tokenRouterAddress = contractAddresses.tokenRouter

const mn = mnemonics

const etherlessAccount = ethers.Wallet.fromMnemonic(mn)
const mainProvider = new ethers.providers.JsonRpcProvider(providerURL);
const mainSigner = useProviderSigner ?  mainProvider.getSigner() : ethers.Wallet.fromMnemonic(mn).connect(mainProvider)



const tokenContract = new ethers.Contract(tokenAddress, token.abi)
const swipTokenContract = new ethers.Contract(swipTokenAddress, token.abi)
const mintManagerContract = new ethers.Contract(mintManagerAddress, mintManager.abi)
const factoryContract = new ethers.Contract(factoryAddress, factory.abi)
const paymasterContract = new ethers.Contract(paymasterAddress, walletPaymaster.abi)
const tokenRouterContract = new ethers.Contract(tokenRouterAddress, tokenRouter.abi)

const getSpenderContract = (spenderAddr) =>  new ethers.Contract(spenderAddr, spender.abi)

async function getGSNProvider(){
    const Web3 = require("web3-providers-http");
    const web3Provider = new Web3(providerURL);
    const _gsnProvider = await Gsn.RelayProvider.newProvider({
        provider: web3Provider,
        config: {
            paymasterAddress
        },
    }).init(); 

    const gsnProvider = new ethers.providers.Web3Provider(_gsnProvider);
    return gsnProvider
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

function calcSalt(sender, index){
    return ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address', 'uint256'], [sender, index]))
}

async function calculateGaslessAddress(address, index){
    const salt = calcSalt(address, index)
    const addr = buildCreate2Address(factoryAddress, salt, spender.bytecode)
    return addr
}

async function runStory(){
    // initial state:
    // baseAddress has 1M tokens and 200k swip tokens
    // mint manager has 800k swip tokens

    // every minter needs to have tkn token before they can mint swip token or refer

    // paymaster should be funded with 2 eth so that it can pay for gasless tx

    // baseAddress should fund its gaslessAddress0 with 500k tokens
    // baseAddress should transfer 200k tkn from its gasless address to etherlessAccount gaslessAddress0, non-gasless
    // etherlessAccountAddress0 should transfer 50k tkn from its gaslessAddress0 to testAddress_gaslessAddress0, gasless

    // etherlessAccountAddress0 should be able to mint 555.555 swipTokens to its address0, gasless
    // baseAddressGaslessAddress0 should be able to mint swip for itself (address0) and etherlessAccountAddress0 (referee)

    // etherlessAccountAddress0 should be able to use a smart contract (token router) to transfer tkn to baseAddress1, gasless-delegate-call


    // const address0 = "0x0000000000000000000000000000000000000000"
    // const zeroBytesData = ethers.utils.toUtf8Bytes("")
    const baseAddress = await mainSigner.getAddress()
    const baseAddressGaslessAddress0 = await calculateGaslessAddress(baseAddress, 0)
    const testAddressGaslessAddress0 = await calculateGaslessAddress(testAddress, 0)
    const etherlessAccountGaslessAddress0 = await calculateGaslessAddress(etherlessAccount.address, 0)


    const etherlessAcctAddr0GSNSigner = await getGSNSigner(etherlessAccount.address, etherlessAccount.privateKey)


    const _stage = stage - 1
    /**Confirm the initial state */
    const firstStageConfirmed = _stage >= 1
    const secondStageConfirmed = _stage >= 2
    const thirdStageConfirmed = _stage >= 3
    console.log("Expected baseAddress to have 1,000,000,000 tkn ", String(await tokenContract.connect(mainSigner).balanceOf(baseAddress)))
    console.log(await mainProvider.getBalance(baseAddress))

    if(!firstStageConfirmed){
        await fundPaymaster()
    }
    console.log("Expected baseAddress to have 200,000,000 swip ", String(await swipTokenContract.connect(mainSigner).balanceOf(baseAddress)))
    console.log("Expected mintManagerAddress to have 800,000,000 swip ", String(await swipTokenContract.connect(mainSigner).balanceOf(mintManagerAddress)))

    if(!firstStageConfirmed){return}

    if(!secondStageConfirmed){
        await tokenContract.connect(mainSigner).transfer(baseAddressGaslessAddress0, 500_000_000)
        await factoryContract.connect(mainSigner).transferToken(0, tokenRouterAddress, calcERC20TransferData(tokenAddress, etherlessAccountGaslessAddress0, 200_000_000))
        await factoryContract.connect(etherlessAcctAddr0GSNSigner).gaslessTransferToken(tokenAddress, 0, paymentManagerAddress, 2_505, tokenRouterAddress, calcERC20TransferData(tokenAddress, testAddressGaslessAddress0, 50_000_000))
    }
    console.log("Expected baseAddressGaslessAddress0 to have tkn at first ", String(await tokenContract.connect(mainSigner).balanceOf(baseAddressGaslessAddress0)))
    console.log("Expected etherlessAccountGaslessAddress0 to have tkns ", String(await tokenContract.connect(mainSigner).balanceOf(etherlessAccountGaslessAddress0)))
    console.log("Expected testAddressGaslessAddress0 to have 50_000_000 tkns ", testAddressGaslessAddress0, String(await tokenContract.connect(mainSigner).balanceOf(testAddressGaslessAddress0)))

    if(!secondStageConfirmed){return}

    if(!thirdStageConfirmed){
        await mintManagerContract.connect(etherlessAcctAddr0GSNSigner).mint(swipTokenAddress, tokenAddress)
        await mintManagerContract.connect(mainSigner).referralMint(etherlessAccount.address, swipTokenAddress, tokenAddress)
    }
    console.log("Expected etherlessAccountGaslessAddress0 to have minted swip", String(await swipTokenContract.connect(mainSigner).balanceOf(etherlessAccountGaslessAddress0)))
    console.log("Expected baseAddressGaslessAddress0 to have minted swip", String(await swipTokenContract.connect(mainSigner).balanceOf(baseAddressGaslessAddress0)))

}

runStory()


const fundPaymaster = async () => {
    await mainSigner.sendTransaction({
        value: ethers.utils.parseEther("2"),
		to: paymasterAddress
    })
}

const getGSNSigner = async (address, privateKey) => {
    const gsnProvider = await getGSNProvider()
    gsnProvider.provider.addAccount(privateKey)
    const gsnSigner = gsnProvider.getSigner(address, privateKey)
    return gsnSigner
}

const calcERC20TransferData = (tokenAddress, to, value) => {
    return (new ethers.utils.Interface(tokenRouter.abi)).encodeFunctionData("routeToken", [ tokenAddress, to, value ]);
}

