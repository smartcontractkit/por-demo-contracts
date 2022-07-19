import { expect } from "chai";
import hre from "hardhat";
import ethers from "ethers";

const EXAMPLE_STRING_ADDRESSES = [
  "addr.one",
  "addr.two",
  "addr.three",
  "addr.four",
  "addr.five",
  "addr.six",
  "addr.seven",
  "addr.eight",
  "addr.nine",
  "addr.ten",
];

describe("ExampleStringPoRAddressList", function () {
  let exampleStringPoRAddressList: ethers.Contract;

  this.beforeAll(async () => {
    const exampleStringPoRAddressListFact = await hre.ethers.getContractFactory(
      "ExampleStringPoRAddressList"
    );
    exampleStringPoRAddressList = await exampleStringPoRAddressListFact.deploy(
      EXAMPLE_STRING_ADDRESSES
    );
  });

  describe("#getPoRAddressListLength", async () => {
    it("correctly returns the number of addresses", async () => {
      const numAddresses =
        await exampleStringPoRAddressList.getPoRAddressListLength();
      expect(numAddresses).to.equal(
        hre.ethers.BigNumber.from(EXAMPLE_STRING_ADDRESSES.length)
      );
    });
  });

  describe("#getPoRAddressList", async () => {
    it("returns an empty array if startIdx is greater than endIdx", async () => {
      const startIdx = 3;
      const endIdx = 1;
      const fetchedAddresses =
        await exampleStringPoRAddressList.getPoRAddressList(startIdx, endIdx);
      expect(fetchedAddresses.length).to.equal(0);
    });

    it("returns a single address if startIdx equals endIdx", async () => {
      const startIdx = 3;
      const endIdx = 3;
      const fetchedAddresses =
        await exampleStringPoRAddressList.getPoRAddressList(startIdx, endIdx);
      expect(fetchedAddresses.length).to.equal(1);
      expect(fetchedAddresses[0]).to.equal(EXAMPLE_STRING_ADDRESSES[startIdx]);
    });

    it("correctly fetches the whole address list", async () => {
      const startIdx = 0;
      const endIdx = EXAMPLE_STRING_ADDRESSES.length - 1;
      const fetchedAddresses =
        await exampleStringPoRAddressList.getPoRAddressList(startIdx, endIdx);
      expect(fetchedAddresses.length).to.equal(endIdx - startIdx + 1);
      const expectedAddresses = EXAMPLE_STRING_ADDRESSES.slice(
        startIdx,
        endIdx + 1
      );
      for (let i = 0; i < fetchedAddresses.length; i++) {
        expect(fetchedAddresses[i]).to.equal(expectedAddresses[i]);
      }
    });

    it("correctly fetches part of the address list", async () => {
      const startIdx = 3;
      const endIdx = 6;
      const fetchedAddresses =
        await exampleStringPoRAddressList.getPoRAddressList(startIdx, endIdx);
      expect(fetchedAddresses.length).to.equal(endIdx - startIdx + 1);
      const expectedAddresses = EXAMPLE_STRING_ADDRESSES.slice(
        startIdx,
        endIdx + 1
      );
      for (let i = 0; i < fetchedAddresses.length; i++) {
        expect(fetchedAddresses[i]).to.equal(expectedAddresses[i]);
      }
    });

    it("correctly fetches part of the address list if the endIdx is greater than the length of the total number of addresses", async () => {
      const startIdx = 3;
      const endIdx = 15;
      const fetchedAddresses =
        await exampleStringPoRAddressList.getPoRAddressList(startIdx, endIdx);
      expect(fetchedAddresses.length).to.equal(
        EXAMPLE_STRING_ADDRESSES.length - startIdx
      );
      const expectedAddresses = EXAMPLE_STRING_ADDRESSES.slice(startIdx);
      for (let i = 0; i < fetchedAddresses.length; i++) {
        expect(fetchedAddresses[i]).to.equal(expectedAddresses[i]);
      }
    });
  });
});
