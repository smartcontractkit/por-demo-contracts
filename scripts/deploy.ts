import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
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
  const ExampleEvmPoRAddressList = await hre.ethers.getContractFactory(
    "ExampleEvmPoRAddressList"
  );
  const exampleEvmPoRAddressList = await ExampleEvmPoRAddressList.deploy(
    SAMPLE_ADDRESSES
  );

  await exampleEvmPoRAddressList.deployed();
  console.log(
    "ExampleEvmPoRAddressList deployed to:",
    exampleEvmPoRAddressList.address
  );

  await printAddresses(exampleEvmPoRAddressList);

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
  const ExampleStringPoRAddressList = await hre.ethers.getContractFactory(
    "ExampleStringPoRAddressList"
  );
  const exampleStringPoRAddressList = await ExampleStringPoRAddressList.deploy(
    EXAMPLE_STRING_ADDRESSES
  );
  await exampleStringPoRAddressList.deployed();
  console.log(
    "ExampleStringPoRAddressList deployed to:",
    exampleStringPoRAddressList.address
  );
  await printAddresses(exampleStringPoRAddressList);

  if (hre.network.name !== "hardhat") {
    console.log("Verifying example contracts");

    await hre.run("verify:verify", {
      address: exampleEvmPoRAddressList.address,
      constructorArguments: [SAMPLE_ADDRESSES],
    });

    await hre.run("verify:verify", {
      address: exampleStringPoRAddressList.address,
      constructorArguments: [EXAMPLE_STRING_ADDRESSES],
    });
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const printAddresses = async (addressManager: ethers.Contract) => {
  const numAddresses = await addressManager.getPoRAddressListLength();
  const addresses = await addressManager.getPoRAddressList(0, numAddresses - 1);
  console.log(`Address list at ${addressManager.address}`, addresses);
};
