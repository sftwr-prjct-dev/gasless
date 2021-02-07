  
pragma solidity 0.6.10;

// SPDX-License-Identifier: MIT OR Apache-2.0
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract TokenRouter {

    function routeToken(address _token, address _to, uint256 _value) external returns (bool success){
       IERC20 token = IERC20(_token);
       token.transfer(_to, _value);
       return true;
    }
    
    function calcCallData(address _token, address _to, uint256 _value) pure external returns (bytes memory data){
        return abi.encodeWithSignature("routeToken(address,address,uint256)", _token, _to, _value);
    }
}