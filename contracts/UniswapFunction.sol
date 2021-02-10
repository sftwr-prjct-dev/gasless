  
pragma solidity 0.6.10;

// SPDX-License-Identifier: MIT OR Apache-2.0
import './IUniswapV2Router02.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract UniswapFunction {

    function routeToken(address _uniswap, uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (bool success){
       IERC20 token0 = IERC20(path[0]);
       IERC20 token1 = IERC20(path[1]);
       token0.approve(_uniswap, amountIn);
       token1.approve(_uniswap, amountIn);
       IUniswapV2Router02 uniswapRouter = IUniswapV2Router02(_uniswap);
       uniswapRouter.swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline);
       return true;
    }
    
    function calcCallData(address _uniswap, uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) pure external returns (bytes memory data){
        return abi.encodeWithSignature("routeToken(address,uint,uint,address[],address,uint)", _uniswap, amountIn, amountOutMin, path, to, deadline);
    }
}
