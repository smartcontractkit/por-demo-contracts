import { expect } from "chai";
import hre from "hardhat";
import ethers from "ethers";

const SAMPLE_ADDRESSES = [
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
  "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
  "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
  "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
  "0x976ea74026e726554db657fa54763abd0c3a0aa9",
  "0x14dc79964da2c08b23698b3d3cc7ca32193d9955",
  "0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f",
  "0xa0ee7a142d267c1f36714e4a8f75612f20a79720",
];

describe("ExampleEvmPoRAddressList", function () {
  let exampleEvmPoRAddressList: ethers.Contract;

  this.beforeAll(async () => {
    const exampleEvmPoRAddressListFact = await hre.ethers.getContractFactory(
      "ExampleEvmPoRAddressList"
    );
    exampleEvmPoRAddressList = await exampleEvmPoRAddressListFact.deploy(
      SAMPLE_ADDRESSES
    );
  });

  describe("#getPoRAddressListLength", async () => {
    it("correctly returns the number of addresses", async () => {
      const numAddresses =
        await exampleEvmPoRAddressList.getPoRAddressListLength();
      expect(numAddresses).to.equal(
        hre.ethers.BigNumber.from(SAMPLE_ADDRESSES.length)
      );
    });
  });

  describe("#getPoRAddressList", async () => {
    it("returns an empty array if startIdx is greater than endIdx", async () => {
      const startIdx = 3;
      const endIdx = 1;
      const fetchedAddresses = await exampleEvmPoRAddressList.getPoRAddressList(
        startIdx,
        endIdx
      );
      expect(fetchedAddresses.length).to.equal(0);
    });

    it("returns a single address if startIdx equals endIdx", async () => {
      const startIdx = 3;
      const endIdx = 3;
      const fetchedAddresses = await exampleEvmPoRAddressList.getPoRAddressList(
        startIdx,
        endIdx
      );
      expect(fetchedAddresses.length).to.equal(1);
      expect(fetchedAddresses[0]).to.equal(SAMPLE_ADDRESSES[startIdx]);
    });

    it("correctly fetches the whole address list", async () => {
      const startIdx = 0;
      const endIdx = SAMPLE_ADDRESSES.length - 1;
      const fetchedAddresses = await exampleEvmPoRAddressList.getPoRAddressList(
        startIdx,
        endIdx
      );
      expect(fetchedAddresses.length).to.equal(endIdx - startIdx + 1);
      const expectedAddresses = SAMPLE_ADDRESSES.slice(startIdx, endIdx + 1);
      for (let i = 0; i < fetchedAddresses.length; i++) {
        expect(fetchedAddresses[i]).to.equal(expectedAddresses[i]);
      }
    });

    it("correctly fetches part of the address list", async () => {
      const startIdx = 3;
      const endIdx = 6;
      const fetchedAddresses = await exampleEvmPoRAddressList.getPoRAddressList(
        startIdx,
        endIdx
      );
      expect(fetchedAddresses.length).to.equal(endIdx - startIdx + 1);
      const expectedAddresses = SAMPLE_ADDRESSES.slice(startIdx, endIdx + 1);
      for (let i = 0; i < fetchedAddresses.length; i++) {
        expect(fetchedAddresses[i]).to.equal(expectedAddresses[i]);
      }
    });

    it("correctly fetches part of the address list if the endIdx is greater than the length of the total number of addresses", async () => {
      const startIdx = 3;
      const endIdx = 15;
      const fetchedAddresses = await exampleEvmPoRAddressList.getPoRAddressList(
        startIdx,
        endIdx
      );
      expect(fetchedAddresses.length).to.equal(
        SAMPLE_ADDRESSES.length - startIdx
      );
      const expectedAddresses = SAMPLE_ADDRESSES.slice(startIdx);
      for (let i = 0; i < fetchedAddresses.length; i++) {
        expect(fetchedAddresses[i]).to.equal(expectedAddresses[i]);
      }
    });
  });
});
