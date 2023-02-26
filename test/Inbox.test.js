const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require("../compile");

let fetchedAccounts;
let inboxContract;
const initialString = "Hello from contract!";

beforeEach(async () => {
  // Get account list
  fetchedAccounts = await web3.eth.getAccounts();

  // Deploy contract with account
  inboxContract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
      arguments: [initialString],
    })
    .send({
      from: fetchedAccounts[0],
      gas: "1000000",
    });
});

describe("Inbox", () => {
  it("deploys a contract", () => {
    assert.ok(inboxContract.options.address);
  });

  it("has a default message", async () => {
    const message = await inboxContract.methods.message().call();
    assert.equal(message, initialString);
  });

  it("can change message", async () => {
    await inboxContract.methods.setMessage("Goodbye from contract!").send({
      from: fetchedAccounts[0],
    });
    const message = await inboxContract.methods.message().call();
    assert.equal(message, "Goodbye from contract!");
  });
});
