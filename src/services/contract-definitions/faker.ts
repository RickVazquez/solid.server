import { ContractDefinition } from './contract-definitions.class'

const simpleStorageByteCode = "608060405234801561001057600080fd5b506103e860008190555060c8806100286000396000f3fe6080604052348015600f57600080fd5b50600436106045576000357c0100000000000000000000000000000000000000000000000000000000900480635524107714604a575b600080fd5b607360048036036020811015605e57600080fd5b81019080803590602001909291905050506089565b6040518082815260200191505060405180910390f35b600081600081905550600054905091905056fea165627a7a7230582019bdc8fcf98a8a338a8c93af3a3f79bf6a012abf63d9fb23603f9a2691b0c5c10029"

const simpleStorage2ByteCode = "608060405234801561001057600080fd5b5060007f66697273746b6579000000000000000000000000000000000000000000000000905060007f76616c756500000000000000000000000000000000000000000000000000000090508060008084815260200190815260200160002081905550505060e6806100826000396000f3fe6080604052348015600f57600080fd5b50600436106045576000357c01000000000000000000000000000000000000000000000000000000009004806315459db914604a575b600080fd5b607d60048036036040811015605e57600080fd5b8101908080359060200190929190803590602001909291905050506097565b604051808215151515815260200191505060405180910390f35b60008160008085815260200190815260200160002081905550600190509291505056fea165627a7a723058200f46aa1a00c98b29d7c7931acaa6674746c7733477495d99924763d262383c6e0029"

export const buildFakeContractDefinition = (): ContractDefinition => {
    const contractDefinition: ContractDefinition = {
        name: "SimpleStorage",
        runtimeBycode: '0x6080604052348015600f57600080fd5b506004361060285760003560e01c80635524107714602d575b600080fd5b605660048036036020811015604157600080fd5b8101908080359060200190929190505050606c565b6040518082815260200191505060405180910390f35b600081600081905550600054905091905056fea265627a7a7231582051ec1f29b2a4b3db54c7888ce82d9331e00e39b16446bfc4b3f797d04401887e64736f6c634300050b0032',
        sourceCode: `pragma solidity ^0.5.3;

contract SimpleStorage {
            
    uint256 value;
    
    constructor() public {
        value = 1000;
    }
    
    function setValue(uint256 _value) public returns(uint256){
        value = _value;
        return value;
    }
}`,
        abi: JSON.stringify([
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "setValue",
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
        ]),
        bytecode: simpleStorageByteCode
    }

    return contractDefinition
}

export const buildFakeContractDefinitions = (): ContractDefinition[] => {
    const contractDefinitions: ContractDefinition[] = [
        buildFakeContractDefinition(),
        {
            name: "SimpleRegistry",
            runtimeBycode: "0x6080604052348015600f57600080fd5b506004361060285760003560e01c806315459db914602d575b600080fd5b606060048036036040811015604157600080fd5b810190808035906020019092919080359060200190929190505050607a565b604051808215151515815260200191505060405180910390f35b60008160008085815260200190815260200160002081905550600190509291505056fea265627a7a72315820bcd505af265063a7adb28935e6a5a204f71c3a38b8822f1a30323667e35ce59964736f6c634300050b0032",
            sourceCode: `pragma solidity ^0.5.3;

contract SimpleRegistry {
    
    mapping(bytes32 => bytes32) values;
    
    constructor() public {
        bytes32 firstKey = "firstkey";
        bytes32 firstValue = "value";
        
        values[firstKey] = firstValue;
    }
    
    function setValue(bytes32 _key, bytes32 _value) public returns(bool){
        values[_key] = _value;
        return true;
    }
}`,
            abi: JSON.stringify([
                {
                    "constant": false,
                    "inputs": [
                        {
                            "name": "_key",
                            "type": "bytes32"
                        },
                        {
                            "name": "_value",
                            "type": "bytes32"
                        }
                    ],
                    "name": "setValue",
                    "outputs": [
                        {
                            "name": "",
                            "type": "bool"
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
            ]),
            bytecode: simpleStorage2ByteCode
        }]

    return contractDefinitions
}