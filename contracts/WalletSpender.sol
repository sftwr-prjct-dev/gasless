pragma solidity 0.6.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IWalletSpender.sol";

// SPDX-License-Identifier: MIT

contract WalletSpender is IWalletSpender {

    function spendToken(address _delegate, bytes calldata _callData) external override returns (bool success) {
        require(_delegate != address(0), "Delegate is required");
        (bool _success, ) = _delegate.delegatecall(_callData);
        require(_success, "Delegate call failed");
        return true;
    }
    
    function spendTokenWithFee(address _token, address _feeReceiver, uint256 _fee, address _delegate, bytes calldata _callData) external override returns (bool success) {
        IERC20 token = IERC20(_token);
        token.transfer(_feeReceiver, _fee);
        return this.spendToken(_delegate, _callData);
    }

    function destroy(address payable _to) external override {
        selfdestruct(_to);
    }

}