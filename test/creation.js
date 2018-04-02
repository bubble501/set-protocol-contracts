const chai = require('chai');
const assert = chai.assert;
chai.use(require('chai-as-promised')).should();

const SetToken = artifacts.require('SetToken');
const StandardTokenMock = artifacts.require('StandardTokenMock');

const expectedExceptionPromise = require('./helpers/expectedException.js');
web3.eth.getTransactionReceiptMined = require('./helpers/getTransactionReceiptMined.js');

exports.test = function(accounts) {
  let tokens = [];
  let units = [];

  let tokenA, tokenSupplyA, unitsA;
  let tokenB, tokenSupplyB, unitsB;

  unitsA = 1;
  unitsB = 2;

  let testAccount, setToken;
  let initialTokens = 10000000;
  let name = 'AB Set';
  let symbol = 'AB';
  beforeEach(async () => {
    testAccount = accounts[0];

    tokenA = await StandardTokenMock.new(
      testAccount,
      initialTokens,
      'Token A',
      'A',
    );
    tokenB = await StandardTokenMock.new(
      testAccount,
      initialTokens,
      'Token B',
      'B',
    );
  });

  it('should not allow creation of a {Set} with no inputs', async () => {
    return expectedExceptionPromise(
      () => SetToken.new([], [], name, symbol, { from: testAccount }),
      3000000,
    );
  });

  it('should not allow creation of a {Set} with mismatched quantity of units and tokens', async () => {
    return expectedExceptionPromise(
      () =>
        SetToken.new(
          [tokenA.address, tokenB.address],
          [unitsA],
          name,
          symbol,
          { from: testAccount },
        ),
      3000000,
    );
  });

  it('should not allow creation of a {Set} with units of 0 value', async () => {
    let badUnit = 0;

    return expectedExceptionPromise(
      () =>
        SetToken.new(
          [tokenA.address, tokenB.address],
          [unitsA, badUnit],
          name,
          symbol,
          { from: testAccount },
        ),
      3000000,
    );
  });

  it('should not allow creation of a {Set} with address of 0', async () => {
    let badUnit = 0;

    return expectedExceptionPromise(
      () =>
        SetToken.new(
          [tokenA.address, null],
          [unitsA, badUnit],
          name,
          symbol,
          { from: testAccount },
        ),
      3000000,
    );
  });

  it('should allow creation of a {Set} with correct data', async () => {
    let setToken = await SetToken.new(
      [tokenA.address, tokenB.address],
      [unitsA, unitsB],
      name,
      symbol,
      { from: testAccount },
    );
    assert.exists(setToken, 'Set Token does not exist');

    // Assert correct name
    let setTokenName = await setToken.name({ from: testAccount });
    assert.strictEqual(setTokenName, name);

    // Assert correct symbol
    let setTokenSymbol = await setToken.symbol({ from: testAccount });
    assert.strictEqual(setTokenSymbol, symbol);

    // Assert correctness of number of tokens
    let setTokenCount = await setToken.tokenCount({ from: testAccount });
    assert.strictEqual(setTokenCount.toString(), '2');

    // Assert correct length of tokens
    let setTokens = await setToken.getTokens({ from: testAccount });
    assert.strictEqual(setTokens.length, 2);

    // Assert correct length of units
    let setUnits = await setToken.getUnits({ from: testAccount });
    assert.strictEqual(setUnits.length, 2);

    // Assert correctness of token A
    let addressComponentA = await setToken.tokens(0, { from: testAccount });
    assert.strictEqual(addressComponentA, tokenA.address);

    // Assert correctness of token B
    let addressComponentB = await setToken.tokens(1, { from: testAccount });
    assert.strictEqual(addressComponentB, tokenB.address);

    // Assert correctness of units for token A
    let componentAUnit = await setToken.units(0, { from: testAccount });
    assert.strictEqual(componentAUnit.toString(), unitsA.toString());

    // Assert correctness of units for token B
    let componentBUnit = await setToken.units(1, { from: testAccount });
    assert.strictEqual(componentBUnit.toString(), unitsB.toString());
  });
};