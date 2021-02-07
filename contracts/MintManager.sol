pragma solidity ^0.6.10;

import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IWalletFactory.sol";
import "./IPaymentManager.sol";


// SPDX-License-Identifier: MIT OR Apache-2.0

contract MintManager is BaseRelayRecipient {
    string public override versionRecipient = "2.0.0";

    mapping(address => uint256) public mintableTokens;
    mapping(address => bool) public hasMinted;


    event TokenMinted(address indexed _token, address _referee,  address indexed _minter, uint256 _valueMinted);


    address public owner;
    address public walletFactoryAddress;
    address public paymentManagerAddress;
    address public tokenFunction;

    constructor(address _forwarder, address _tokenFunction) public {
        owner = msg.sender;
        trustedForwarder = _forwarder;
        tokenFunction = _tokenFunction;
    }

    function setWalletFactoryAddress(address _walletFactoryAddress) external onlyOwner {
        walletFactoryAddress = _walletFactoryAddress;
    }

    function setTokenFunction(address _tokenFunction) external onlyOwner {
        tokenFunction = _tokenFunction;
    }
    
    function setPaymentManagerAddress(address _paymentManagerAddress) external onlyOwner {
        paymentManagerAddress = _paymentManagerAddress;
    }
    
    function setMintValue(address _mintableToken, uint256 _mintValue) external onlyOwner {
        mintableTokens[_mintableToken] = _mintValue;
    }
 
    function referralMint(address _referee, address _mintableToken, address _supportedToken) external {
        uint256 mintableValue = mintableTokens[_mintableToken];
        require(mintableValue > 0, "Token is not mintable");
        require(_referee != address(0), "Invalid referee");
        require(_supportedToken != address(0), "Invalid supportedToken");

        address _minter =  _msgSender();
        require(hasMinted[_referee], "Referee has not minted");
        require(!hasMinted[_minter], "Minter has already minted");
        hasMinted[_minter] = true;
        hasMinted[_referee] = true;
        address refereeGaslessAddress = IWalletFactory(walletFactoryAddress).getGaslessAddress(_referee, 0);
        address minterGaslessAddress = IWalletFactory(walletFactoryAddress).getGaslessAddress(_minter, 0);
        uint256 minimumBalance = (IPaymentManager(paymentManagerAddress).getAdminTokenFee(_supportedToken, tokenFunction) * 3);
        require(minimumBalance > 0, "Invalid supported token");
        IERC20 supportedTokenContract = IERC20(_supportedToken);
        require(supportedTokenContract.balanceOf(minterGaslessAddress) > minimumBalance, "Insufficient supported token balance for minter");
        require(supportedTokenContract.balanceOf(refereeGaslessAddress) > minimumBalance, "Insufficient supported token balance for referee");
        IERC20 mintableTokenContract = IERC20(_mintableToken);
        mintableTokenContract.transfer(refereeGaslessAddress, mintableValue);
        mintableTokenContract.transfer(minterGaslessAddress, mintableValue);
        emit TokenMinted(_mintableToken, _referee,  _minter, mintableValue);
        // referee should have minted and should have supported token balance
        // this address has not minted and should have supported token balance
    }
    
    function mint(address _mintableToken, address _supportedToken) external {
        uint256 mintableValue = mintableTokens[_mintableToken];
        require(mintableValue > 0, "Token is not mintable");
        require(_supportedToken != address(0), "Invalid supportedToken");

        address _minter =  _msgSender();

        require(!hasMinted[_minter], "Minter has already minted");
        hasMinted[_minter] = true;

        address minterGaslessAddress = IWalletFactory(walletFactoryAddress).getGaslessAddress(_minter, 0);
        uint256 minimumBalance = (IPaymentManager(paymentManagerAddress).getAdminTokenFee(_supportedToken, tokenFunction) * 3);
        require(minimumBalance > 0, "Invalid supported token");
        IERC20 supportedTokenContract = IERC20(_supportedToken);
        require(supportedTokenContract.balanceOf(minterGaslessAddress) > minimumBalance, "Insufficient supported token balance for minter");
        IERC20 mintableTokenContract = IERC20(_mintableToken);
        mintableTokenContract.transfer(minterGaslessAddress, mintableValue);
        emit TokenMinted(_mintableToken, address(0),  _minter, mintableValue);

        // this address has not minted and should have supported token balance
    }


    modifier onlyOwner() {
        require(owner == msg.sender, ": caller is not the owner");
        _;
    }
}