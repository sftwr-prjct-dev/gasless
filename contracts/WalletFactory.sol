pragma solidity 0.6.10;

// SPDX-License-Identifier: MIT OR Apache-2.0

import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";
import "./IPaymentManager.sol";
import "./WalletSpender.sol";
import "./IWalletFactory.sol";


contract WalletFactory is IWalletFactory, BaseRelayRecipient {
    string public override versionRecipient = "2.0.0";
    address public manager;
    address public owner;

    event Spend(address indexed _from, address indexed _delegate, address indexed feeReceiver, uint256 fee, uint256 salt);
    event Addr(address indexed _addr, address indexed _sender);

    constructor(address _forwarder, address _manager) public {
		trustedForwarder = _forwarder;
        manager = _manager;
        owner = msg.sender;
	}

    function setManager(address _manager) external override onlyOwner {
        manager = _manager;
    }
    
    function gaslessTransferToken(address _token, uint256 _salt, address _feeReceiver, uint256 _fee, address _delegate, bytes calldata _callData) external override {
        bytes32 newsalt = keccak256(abi.encode(_msgSender(), _salt));

        WalletSpender spender = new WalletSpender{salt: newsalt}();

        require(IPaymentManager(manager).verify(_token, _delegate, _feeReceiver, _fee), "Manager rejected call");
        spender.spendTokenWithFee(_token, _feeReceiver, _fee, _delegate, _callData);
        spender.destroy(_msgSender());
        emit Spend(address(spender), _delegate, _feeReceiver, _fee,  _salt);
    }
    
    function transferToken(uint256 _salt, address _delegate, bytes calldata _callData) external override directCall {
        bytes32 newsalt = keccak256(abi.encode(_msgSender(), _salt));
        
        WalletSpender spender = new WalletSpender{salt: newsalt}();
        
        spender.spendToken(_delegate, _callData);
        spender.destroy(_msgSender());
        emit Spend(address(spender), _delegate, address(0), 0,  _salt);
    }
    
    function getAddress(uint256 _salt) external override directCall {
        bytes32 newsalt = keccak256(abi.encode(_msgSender(), _salt));
        
        WalletSpender addr = new WalletSpender{salt: newsalt}();

        emit Addr(address(addr), _msgSender());
    }
    
    function calcSpenderAddress(uint256 salt) view external returns(address, address, address)  {
        address predictedAddress = this.getGaslessAddress(_msgSender(), salt);
        return (predictedAddress, address(this), _msgSender());
    }
    
    function getGaslessAddress(address _sender, uint256 salt) view external override returns(address)  {
        bytes32 newsalt = keccak256(abi.encode(_sender, salt));
        address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            newsalt,
            keccak256(type(WalletSpender).creationCode)
        )))));
        return predictedAddress;
    }

    function getCreationCode() pure external returns(bytes memory)  {
        return type(WalletSpender).creationCode;
    }
    
    function spendIt(address _spender, address _delegate, bytes calldata _callData) external override directCall {
        WalletSpender spender = WalletSpender(_spender);
        spender.spendToken(_delegate, _callData);
        spender.destroy(_msgSender());
        emit Spend(address(spender), _delegate, address(0), 0, 0);
    }

    modifier onlyOwner() {
        require(owner == _msgSender(), ": caller is not the owner");
        _;
    }
    
    modifier directCall() {
        require(msg.sender == _msgSender(), ": caller is not the owner");
        _;
    }
}