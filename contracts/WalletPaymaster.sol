pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

// SPDX-License-Identifier: MIT OR Apache-2.0

import "@opengsn/gsn/contracts/forwarder/IForwarder.sol";
import "@opengsn/gsn/contracts/BasePaymaster.sol";



contract WalletPaymaster is BasePaymaster {
    
	mapping(address => bool) public ourTargets;

	event TargetSet(address target);
	event TargetRemoved(address target);
	
	function setTarget(address target) external onlyOwner {
		require(!ourTargets[target], "Target already exist");
		ourTargets[target] = true;
		emit TargetSet(target);
	}

	function removeTarget(address target) external onlyOwner {
		require(ourTargets[target], "Target already exist");
		ourTargets[target] = false;
		emit TargetRemoved(target);
	}

	event PreRelayed(uint);
	event PostRelayed(uint);

	function preRelayedCall(
		GsnTypes.RelayRequest calldata relayRequest,
		bytes calldata signature,
		bytes calldata approvalData,
		uint256 maxPossibleGas
	) external override virtual
	returns (bytes memory context, bool) {
		_verifyForwarder(relayRequest);
		(signature, approvalData, maxPossibleGas);
		require(ourTargets[relayRequest.request.to], "Target not supported");
        return (abi.encode(now), true);
	}

	function postRelayedCall(
		bytes calldata context,
		bool success,
		uint256 gasUseWithoutPost,
		GsnTypes.RelayData calldata relayData
	) external override virtual {
                (context, success, gasUseWithoutPost, relayData);
		emit PostRelayed(abi.decode(context, (uint)));
	}

  function versionPaymaster() external virtual view override returns (string memory) {
    return "2.0.3";
  }

}