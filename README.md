**Warning: The contracts in this repository have not been audited and are only meant to be for demonstration purposes**

# PoR Contracts

This repository contains the interface required to implement a `PoRAddressList` contract to store a list of custodial addresses that holds the funds in order to support a PoR feed.

## Contract Addresses

### Rinkeby

```
ExampleEvmPoRAddressList: 0x4c5De5d901F978B89AB1399D64AA54B1D3a4BCFF
ExampleStringPoRAddressList: 0xA72206A7877B27831b520FE0405746f9Ef9a0B98
```

## IPoRAddressList Interface

The `IPoRAddressList` contract interface provides a simple way for developers to implement a smart contract to manage a list of custodial addresses used
to support a Proof of Reserves feed. It requires developers to only implement two functions `getPoRAddressListLength`, which returns the number of custodial addresses and `getPoRAddressList`, which returns part of the list of custodial addresses. These two functions are the only ones required to make the contract compatible with our general Proof of Reserves framework. The interface leaves out functions to manage adding and removing addresses and any access controler as it is up to the developer to implement this in any way they wish.

```
interface IPoRAddressList {
    /// @notice Get total number of addresses in the list.
    function getPoRAddressListLength() external view returns (uint256);

    /**
     * @notice Get a batch of human-readable addresses from the address list.
     * @dev Due to limitations of gas usage in off-chain calls, we need to support fetching the addresses in batches.
     * EVM addresses need to be converted to human-readable strings. The address strings need to be in the same format
     * that would be used when querying the balance of that address.
     * @param startIndex The index of the first address in the batch.
     * @param endIndex The index of the last address in the batch. If `endIndex > getPoRAddressListLength()-1`,
     * endIndex need to default to `getPoRAddressListLength()-1`. If `endIndex < startIndex`, the result would be an
     * empty array.
     * @return Array of addresses as strings.
     */
    function getPoRAddressList(uint256 startIndex, uint256 endIndex)
        external
        view
        returns (string[] memory);
}

```

### Token Minting

Proof of Reserve feeds report the latest number of reserve tokens available along with important timestamp information. These feeds expose data like regular Chainlink price feeds meaning that they also expose similar functions. One way consumers can consume data from the feed is by calling the feed's `latestRoundData()` function which returns the following variables:

`answer`
The reserve amount

`answeredInRound`
is the round ID of the round in which the answer was computed. This value is unlikely to be used.

`roundId`
is the round ID from the aggregator for which the data was retrieved combined with a phase to ensure that round IDs get larger as time moves forward. This value is unlikely to be used.

`startedAt`
is the timestamp when the round was started. This value is unlikely to be used.

`updatedAt`
is the timestamp when the round last was updated (i.e. answer was last computed)

#### Example

The `ExampleTokenWithPoR` contract is meant to serve as an example token contract that uses a Proof of Reserves feed to ensure that it's token supply never exceeds the number of reserves backing it. The contract has a `mint` function that first reads the `answer` and `updatedAt` fields from the feed and reverts if any state is violated. An annotated version of it's `mint` function is shown below.

```
function mint(address _to, uint256 _amount) external onlyOwner {

        /**
        * Read latest data from feed
        **/
        (, int256 answer, , uint256 updatedAt, ) = s_feed.latestRoundData();

        /**
        * Revert if the feed returns invalid values or if the feed has gone stale.  The heartbeat is a variable
        * stored and configured by the mock token contract
        **/
        require(answer > 0, "invalid answer from PoR feed");
        require(updatedAt >= block.timestamp - s_heartbeat, "answer outdated");

        /**
        * Normalize currencies to in case the number of decimals reported by the feed is
        * different than the token's decimals
        **/
        uint256 reserves = uint256(answer);
        uint256 currentSupply = totalSupply();

        uint8 trueDecimals = decimals();
        uint8 reserveDecimals = s_feed.decimals();
        if (trueDecimals < reserveDecimals) {
            currentSupply =
                currentSupply *
                10**uint256(reserveDecimals - trueDecimals);
        } else if (trueDecimals > reserveDecimals) {
            reserves = reserves * 10**uint256(trueDecimals - reserveDecimals);
        }

        /**
        * Revert if the supply after minting exceeds the reported number of reserves
        **/
        require(
            currentSupply + _amount <= reserves,
            "total supply would exceed reserves after mint"
        );
        _mint(_to, _amount);
}
```
