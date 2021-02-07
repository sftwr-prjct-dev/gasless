pragma solidity 0.6.10;

// SPDX-License-Identifier: MIT

interface IWalletFactory {
    event Spend(address indexed _from, address indexed _delegate, address indexed feeReceiver, uint256 fee, uint256 salt);

    event Addr(address indexed _addr, address indexed _sender);

    function setManager(address _manager) external;

    function gaslessTransferToken(address _token, uint256 _salt, address _feeReceiver, uint256 _fee, address _delegate, bytes calldata _callData) external;

    function transferToken(uint256 _salt, address _delegate, bytes calldata _callData) external;

    function getGaslessAddress(address _sender, uint256 salt) view external returns(address);

    function getAddress(uint256 _salt) external;

    function spendIt(address _spender, address _delegate, bytes calldata _callData) external;

}