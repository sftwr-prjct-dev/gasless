pragma solidity 0.6.10;

// SPDX-License-Identifier: MIT OR Apache-2.0

import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./WalletSpender.sol";
import "./IPaymentManager.sol";


contract PaymentManager is  IPaymentManager {

    address public owner;

    mapping(address => mapping(address => uint256)) public adminTokensFee; // maps token to functions to fee
    mapping(address => bool) public adminTokens;

    event TokenUpdate(address indexed _token, address indexed _function, uint256 _fee, string _funtionName);
    event TokenRemoved(address indexed _token);

    constructor() public {
        owner = msg.sender;
    }

    function verify(address _token, address _function, address _feeReceiver, uint256 _fee) view external override returns (bool success) {
        require(_feeReceiver == address(this), "PaymentManager is not the fee receiver");
        require(_fee >= adminTokensFee[_token][_function], "Fee is not sufficient");
        require(adminTokens[_token], "Unsupported token");
        return true;
    }


    function addNewAdminToken(address _token, address _function, uint256 _fee, string memory _funtionName) external override onlyOwner returns (bool success) {
        require(!adminTokens[_token], "Token already exist");
        adminTokens[_token] = true;
        adminTokensFee[_token][_function] = _fee;
        emit TokenUpdate(_token, _function, _fee, _funtionName);
        return true;
    }
    
    function subAdminToken(address _token) external override onlyOwner returns (bool success) {
        require(adminTokens[_token], "Token has not been added yet");
        adminTokens[_token] = false;
        emit TokenRemoved(_token);
        return true;
    }

    function getAdminTokenFee(address _token, address _function) external view override returns (uint256 _fee) {
        return adminTokensFee[_token][_function];
    }
    
    function setAdminTokenFee(address _token, address _function, uint256 _fee, string memory _funtionName) external override onlyOwner returns (bool success) {
        require(adminTokens[_token], "Token is not yet supported");
        adminTokensFee[_token][_function] = _fee;
        emit TokenUpdate(_token, _function, _fee, _funtionName);
        return true;
    }

    function withdrawToken(address _token, address _to, uint256 _value) external override onlyOwner returns (bool success){
        IERC20(_token).transfer(_to, _value);
        return true;
    }
    
    function withdraw(address payable _to, uint256 _value) external override onlyOwner returns (bool success){
        _to.transfer(_value);
        return true;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, ": caller is not the owner");
        _;
    }

}