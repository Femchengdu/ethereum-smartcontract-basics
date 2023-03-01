const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");
require("dotenv").config();
const mnemonic = process.env.MNEMONIC;
const infuraKey = process.env.INFURA_KEY;

const provider = new HDWalletProvider(mnemonic, infuraKey);
const web3 = new Web3(provider);

const deploy = async () => {
  const fetchedAccounts = await web3.eth.getAccounts();
  console.log("Attempt to deploy from  ", fetchedAccounts[0]);
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
    })
    .send({
      from: fetchedAccounts[0],
      gas: "1000000",
    });
  console.log("The contract is deployed to.  ", result.options.address);
  console.log("The contract interface.  ", interface);
  provider.engine.stop();
};

deploy();
