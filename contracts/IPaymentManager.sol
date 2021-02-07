pragma solidity 0.6.10;

// SPDX-License-Identifier: MIT

interface IPaymentManager {
    event TokenUpdate(address indexed _token, address indexed _function, uint256 _fee);

    event TokenRemoved(address indexed _token);

    function verify(address _token, address _function, address _feeReceiver, uint256 _fee) view external returns (bool);

    function addNewAdminToken(address _token, address _function, uint256 _fee) external returns (bool);

    function subAdminToken(address _token) external returns (bool);

    function getAdminTokenFee(address _token, address _function) external view returns (uint256 _fee);

    function setAdminTokenFee(address _token, address _function, uint256 _fee) external returns (bool);

    function withdrawToken(address _token, address _to, uint256 _value) external returns (bool);

    function withdraw(address payable _to, uint256 _value) external returns (bool);
}