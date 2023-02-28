const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require("../compile");

let fetchedAccounts;
let lotteryContract;

beforeEach(async () => {
  // Get account list
  fetchedAccounts = await web3.eth.getAccounts();

  // Deploy contract with account
  lotteryContract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
    })
    .send({
      from: fetchedAccounts[0],
      gas: "1000000",
    });
});

describe("Lottery contract", () => {
  it("deploys a contract", () => {
    assert.ok(lotteryContract.options.address);
  });

  it("allows one account to enter", async () => {
    await lotteryContract.methods.enter().send({
      from: fetchedAccounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });
    const players = await lotteryContract.methods.getPlayers().call({
      from: fetchedAccounts[0],
    });
    assert.equal(fetchedAccounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it("allows one multiple players to enter", async () => {
    await lotteryContract.methods.enter().send({
      from: fetchedAccounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lotteryContract.methods.enter().send({
      from: fetchedAccounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lotteryContract.methods.enter().send({
      from: fetchedAccounts[2],
      value: web3.utils.toWei("0.02", "ether"),
    });
    const players = await lotteryContract.methods.getPlayers().call({
      from: fetchedAccounts[0],
    });
    assert.equal(fetchedAccounts[0], players[0]);
    assert.equal(fetchedAccounts[1], players[1]);
    assert.equal(fetchedAccounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it("requires a minimum amount of ether to enter", async () => {
    try {
      await lotteryContract.methods.enter().send({
        from: fetchedAccounts[0],
        value: 0,
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("only manager can call pickWinner", async () => {
    try {
      await lotteryContract.methods.pickWinner().send({
        from: fetchedAccounts[2],
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("sends money to the winner and resets the players array", async () => {
    await lotteryContract.methods.enter().send({
      from: fetchedAccounts[0],
      value: web3.utils.toWei("2", "ether"),
    });

    const initialBalance = await web3.eth.getBalance(fetchedAccounts[0]);
    await lotteryContract.methods.pickWinner().send({
      from: fetchedAccounts[0],
    });
    const finalBalance = await web3.eth.getBalance(fetchedAccounts[0]);
    const difference = finalBalance - initialBalance;
    const players = await lotteryContract.methods.getPlayers().call({
      from: fetchedAccounts[0],
    });
    assert(difference > web3.utils.toWei("1.8", "ether"));
    assert.equal(0, players.length);
  });
});
