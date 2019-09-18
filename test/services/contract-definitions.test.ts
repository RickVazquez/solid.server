import app from '../../src/app';

import assert from 'assert'
// const assert = require('assert');

describe('\'contract-definitions\' service', () => {
  it('registered the service', () => {
    const service = app.service('contract-definitions');
    expect(service).toBeTruthy();
  });

  it('creates a contract definition', async () => {
    const name = "SimpleStorage.sol"
    const sourceCode = "code"
    const abi = [
      {
        "constant": true,
        "inputs": [],
        "name": "getValue",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "value",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "getValueLast",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      }
    ]
    const bytecode = "bytecode"

    const contractDefinition = await app.service('contract-definitions').create({
      name,
      sourceCode,
      abi,
      bytecode
    });

    assert.equal(contractDefinition.name, name);
    assert.equal(contractDefinition.sourceCode, sourceCode);
    assert.deepEqual(contractDefinition.abi, abi);
    assert.equal(contractDefinition.bytecode, bytecode);

    assert.ok(contractDefinition._id !== undefined)
  });
});
