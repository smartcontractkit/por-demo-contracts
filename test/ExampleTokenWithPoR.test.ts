import hre from "hardhat";
import ethers from "ethers";
import { deployMockContract, MockContract } from "ethereum-waffle";
import { expect } from "chai";

const NAME = "WrappedToken";
const SYMBOL = "WTO";
const HEARTBEAT = 3600 * 24; // 1 day
const FEED_DECIMALS = 8;

describe("ExampleTokenWithPoR", function () {
  let exampleTokenWithPoR: ethers.Contract;
  let chainlinkPoRFeed: MockContract;
  let accountOne: ethers.Signer;
  let accountTwo: ethers.Signer;
  let accTwoAddr: string;

  this.beforeAll(async () => {
    const [accOne, accTwo] = await hre.ethers.getSigners();
    accountOne = accOne;
    accountTwo = accTwo;
    accTwoAddr = await accountTwo.getAddress();

    const aggregatorV3Artifact = await hre.artifacts.readArtifact(
      "AggregatorV3Interface"
    );
    chainlinkPoRFeed = await deployMockContract(
      accOne,
      aggregatorV3Artifact.abi
    );

    await chainlinkPoRFeed.mock.decimals.returns(FEED_DECIMALS);
  });

  this.beforeEach(async () => {
    const porTokenContractFactory = await hre.ethers.getContractFactory(
      "ExampleTokenWithPoR"
    );
    exampleTokenWithPoR = await porTokenContractFactory.deploy(
      NAME,
      SYMBOL,
      chainlinkPoRFeed.address,
      HEARTBEAT
    );
  });

  describe("#constructor", () => {
    it("is deployed with the correct params", async () => {
      const name = await exampleTokenWithPoR.name();
      const symbol = await exampleTokenWithPoR.symbol();
      const heartbeat = await exampleTokenWithPoR.getHeartbeat();
      const feed = await exampleTokenWithPoR.getFeed();

      expect(name).to.equal(NAME);
      expect(symbol).to.equal(SYMBOL);
      expect(heartbeat).to.equal(HEARTBEAT);
      expect(feed).to.equal(chainlinkPoRFeed.address);
    });
  });

  describe("#mint", () => {
    describe("errors", () => {
      it("reverts when called by a non owner", async () => {
        expect(
          exampleTokenWithPoR
            .connect(accountTwo)
            .mint(accTwoAddr, hre.ethers.utils.parseEther("1"))
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("reverts when the answer is less than 0", async () => {
        const currBlockNum = await hre.ethers.provider.getBlockNumber();
        const currBlock = await hre.ethers.provider.getBlock(currBlockNum);
        await chainlinkPoRFeed.mock.latestRoundData.returns(
          10000,
          -1,
          10000,
          currBlock.timestamp,
          100000
        );
        expect(
          exampleTokenWithPoR.mint(accTwoAddr, hre.ethers.utils.parseEther("1"))
        ).to.be.revertedWith("invalid answer from PoR feed");
      });

      it("reverts when the answer is 0", async () => {
        const currBlockNum = await hre.ethers.provider.getBlockNumber();
        const currBlock = await hre.ethers.provider.getBlock(currBlockNum);
        await chainlinkPoRFeed.mock.latestRoundData.returns(
          10,
          0,
          10,
          currBlock.timestamp,
          100000
        );
        expect(
          exampleTokenWithPoR.mint(accTwoAddr, hre.ethers.utils.parseEther("1"))
        ).to.be.revertedWith("invalid answer from PoR feed");
      });

      it("reverts when the answer is outdated", async () => {
        const currBlockNum = await hre.ethers.provider.getBlockNumber();
        const currBlock = await hre.ethers.provider.getBlock(currBlockNum);
        const heartbeat = await exampleTokenWithPoR.getHeartbeat();
        await chainlinkPoRFeed.mock.latestRoundData.returns(
          10000,
          hre.ethers.utils.parseEther("1"),
          10000,
          hre.ethers.BigNumber.from(currBlock.timestamp)
            .sub(heartbeat)
            .sub(24 * 3600),
          100000
        );
        expect(
          exampleTokenWithPoR.mint(accTwoAddr, hre.ethers.utils.parseEther("1"))
        ).to.be.revertedWith("answer outdated");
      });

      it("reverts when we try to mint more than the total reserves", async () => {
        // Try mint 100,000 more tokens.  Total supply here should be 0
        const toMint = hre.ethers.utils.parseEther("100000");
        const currBlockNum = await hre.ethers.provider.getBlockNumber();
        const currBlock = await hre.ethers.provider.getBlock(currBlockNum);

        // Feed answers that there are only 1000 tokens in the reserve
        await chainlinkPoRFeed.mock.latestRoundData.returns(
          10000,
          hre.ethers.BigNumber.from(1000).pow(FEED_DECIMALS),
          10000,
          currBlock.timestamp,
          100000
        );
        await exampleTokenWithPoR.mint(accTwoAddr, toMint);
      });
    });

    describe("success", () => {
      it("correctly mints tokens to address", async () => {
        const accTwoBalanceBefore = await exampleTokenWithPoR.balanceOf(
          accTwoAddr
        );
        const toMint = hre.ethers.utils.parseEther("10000");
        const currBlockNum = await hre.ethers.provider.getBlockNumber();
        const currBlock = await hre.ethers.provider.getBlock(currBlockNum);

        await chainlinkPoRFeed.mock.latestRoundData.returns(
          10000,
          hre.ethers.BigNumber.from(100000).pow(FEED_DECIMALS),
          10000,
          currBlock.timestamp,
          100000
        );
        await exampleTokenWithPoR.mint(accTwoAddr, toMint);
        const accTwoBalanceAfter = await exampleTokenWithPoR.balanceOf(
          accTwoAddr
        );
        expect(accTwoBalanceAfter).to.equal(accTwoBalanceBefore.add(toMint));
      });
    });
  });
});
