pragma solidity 0.6.10;

// SPDX-License-Identifier: MIT OR Apache-2.0



contract OneInchFunction {

    function routeToken(address _token, address _spender, bytes calldata approvalData, bytes calldata _spendData) external returns (bool success){
       (bool _success1, ) = _token.call(approvalData);
       require(_success1, "Approve call failed");
       (bool _success, ) = _spender.call(_spendData);
       require(_success, "Spend call fails");
       return true;
    }
    
    function calcCallData(address _token, address _spender, bytes calldata approvalData, bytes calldata _spendData) pure external returns (bytes memory data){
        return abi.encodeWithSignature("routeToken(address,address,bytes,bytes)", _token, _spender, approvalData, _spendData);
    }
}
