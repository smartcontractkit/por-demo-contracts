// WARNING:  Contract has not been audited and is meant to be for demonstration purposes
// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {ITokenWithPoR} from "../interfaces/ITokenWithPoR.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract ExampleTokenWithPoR is ITokenWithPoR, Ownable, ERC20 {
    uint256 private constant MAX_HEARTBEAT_DAYS = 7;

    uint256 private s_heartbeat;
    AggregatorV3Interface private s_feed;

    constructor(
        string memory _name,
        string memory _symbol,
        address _feedAddr,
        uint256 _heartbeat
    ) Ownable() ERC20(_name, _symbol) {
        s_feed = AggregatorV3Interface(_feedAddr);
        s_heartbeat = _heartbeat;
    }

    function mint(address _to, uint256 _amount) external onlyOwner {
        (, int256 answer, , uint256 updatedAt, ) = s_feed.latestRoundData();
        require(answer > 0, "invalid answer from PoR feed");
        require(updatedAt >= block.timestamp - s_heartbeat, "answer outdated");

        uint256 reserves = uint256(answer);
        uint256 currentSupply = totalSupply();

        uint8 trueDecimals = decimals();
        uint8 reserveDecimals = s_feed.decimals();
        // Normalise currencies
        if (trueDecimals < reserveDecimals) {
            currentSupply =
                currentSupply *
                10**uint256(reserveDecimals - trueDecimals);
        } else if (trueDecimals > reserveDecimals) {
            reserves = reserves * 10**uint256(trueDecimals - reserveDecimals);
        }
        require(
            currentSupply + _amount <= reserves,
            "total supply would exceed reserves after mint"
        );
        _mint(_to, _amount);
    }

    function setFeed(address _newFeed) external onlyOwner {
        s_feed = AggregatorV3Interface(_newFeed);
        emit ReserveFeedSet(_newFeed);
    }

    function setHeartbeat(uint256 _newHeartbeat) external onlyOwner {
        s_heartbeat = _newHeartbeat;
        emit ReserveHeartbeatSet(_newHeartbeat);
    }

    function getFeed() external view returns (address) {
        return address(s_feed);
    }

    function getHeartbeat() external view returns (uint256) {
        return s_heartbeat;
    }

    function getMaxHeartbeatDays() external pure returns (uint256) {
        return MAX_HEARTBEAT_DAYS;
    }
}
