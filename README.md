# Gasless Wallet
Repository for the gasless wallet - Binance Hackathon

# Project Summary
Non-custodial EVM-compatible web wallet that supports gasless interactions.

## Category
DeFi and Asset Management

## License: MIT

## Smart Contract Addresses
- Wallet factory: 0xdB008C033085fA9Fb6EeaeB280A6C822850cce41

- wallet spender: many e.g: 0x1a2986a47eee67fed5f7ff8a391b78b217450e93

- payment manager: 0xc3CcB0D3d20797A0861E792A122968ae2d665012

- GSN paymaster: 0x3e6496A64EE1a9BCe4F6D554267137B8E44fc254

- tokenTransferFunction: 0x0c0cD311Cc3c48Fe4ed298bcd8a18D7Fb8747835

- swapFunction: 0x8207accC5c25753d1654eC4C30A6516c65d742bE

## Deployed uniswap on bsc
- UniswapV2Factory: 0x79323B74082e2E85493de93a16343b22e0EF20C6

- UniswapV2Router02: 0xB3d040cDbDdb99cAEB8B25DB6dA9BD57E8310fb9

## About the Wallet
- BNB not required for transaction fees
- Wallet fee not required
- Wallet and dApp compatible
- Lower adoption/entry barrier
- Powered by OpenGSN

## How it works
![image](https://user-images.githubusercontent.com/50963972/108628588-d7ec4980-7429-11eb-8c63-8d8b67b8852a.png)

## Video Demo
https://youtu.be/MimO5RpZH6M

## Local development
- start the local ganache client by running `npm run start:ganache`
- start the local gsn relay server by runnugn `npm run start:local-gsn`
- Copy the gsn details from the console into your env.json file
- run `truffle migrate`
- copy the contract details from the console into your env.json file
- Set the story stage inside the env file and run `npm run story` in your console
- Start the frontend by running `npm run dev`

