pragma solidity 0.6.10;

// SPDX-License-Identifier: MIT

interface IWalletSpender {
    function spendToken(address _delegate, bytes calldata _callData) external returns (bool success);
    
    function spendTokenWithFee(address _token, address _feeReceiver, uint256 _fee, address _delegate, bytes calldata _callData) external returns (bool success);

    function destroy(address payable _to) external;
}