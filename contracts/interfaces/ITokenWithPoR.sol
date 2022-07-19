// WARNING:  Contract has not been audited and is meant to be for demonstration purposes
// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

interface ITokenWithPoR {
    event ReserveFeedSet(address newFeed);

    event ReserveHeartbeatSet(uint256 newHeartbeat);

    function setFeed(address newFeed) external;

    function setHeartbeat(uint256 newHeartbeat) external;
}
