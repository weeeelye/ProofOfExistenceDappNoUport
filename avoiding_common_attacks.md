# Avoiding Common Attacks

## Logic Bugs
Automated tests are focused on the main use cases on the smart contract. 
Implementation is straightforward and non-complex

## Recursive call attacks:
There are no external calls to other contracts other than a lookup call to the Oracle.
The function modifies internal states before external call to the Oracle. 

## Overflow
User inputs are checked for validity before they are inserted. Also checks integer operation to detect overflow

## Poison data
Poisoned data by users are mitigated by checking user inputs.

## Exposed functions
Exposed functions uses modifiers to check for validity. 
Certain functions are only accessible to the contract Owner and certain functions can only be called if the document exists.

## Exposed data
Non of the data are sensitive, as this is designed to store files that allow people to verify the existence of files from other people as well.

## Timestamp vulnerabilities
Miners can influence global block timestamps and which transactions to be included in a block.
However, this could not be avoided as we upload the data to the blockchain, and does not impact the functions of this contract to a large extent.

## Contract Administration Risk
Contract is largely administrated by the Owner. However the owner cannot modify items stored on the blockchain, which defeats the purpose of using this blockchain.

## Cross Chain Replay
This can be an issue, and if the chain forks, technically there can be a different owner on the same file in each of the chain. However this cannot be avoided at the moment.

## Gas Limits
Gas limits are largely avoided by having no unbounded loops over arrays with undetermined length in the ProofOfExistence contract
The only factor that affects gas limits is user's supplied data. To combat this, several of the user's input are limited by fixed data type.
Some data types uses dynamic types for flexibility.

## Force sending ether
This is not an issue as none of the functions critically depends on the Ether balance on the contract. Only 1 function deals with Ether which will fail if balance sent by user is not enough.

## Denial Of Service (DOS)
One of the functions of this contract is using an Oracle to verify if the IPFS file matches the uploaded hash.
The Oracle is most susceptible to DOS attacks. However, the Oracle's functions is not critical to the main function of the contract.
In case the Oracle is down, users can still store file data on the blockchain, and verify them later when the Oracle is back online
