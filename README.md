# Proof Of Existence DApp Readme

This is a proof of existence dapp. It uses the truffle box react-uport boiler plate.

The web UI provides a way for the user to upload their document data (Hashes, and other data like file name, file data type)
Although it can be done, it is not practical to code the contract to hash the data on chain, hence the file is hashed on the client (UI) side and uploaded to infura's IPFS
A oracle service is run such that it will retrieve the file from the IPFS and hash the data.
The function on the blockchain will compare the hash from the user's submitted hash and the hash that the oracle service provides and update the status on the blockchain.

## Getting Started
To run it on localhost, please do the following:
- Install truffle, ganache-cli, ethereum-bridge (https://github.com/oraclize/ethereum-bridge), localtunnel (https://github.com/localtunnel/localtunnel), along with the usual node, npm
- Start your ganache-cli in a window
- Start the backend IPFS file auth server (This is NOT a IPFS node.)
  - Run: `cd react-backend && npm install`
  - Run the server: `PORT=3001 node bin/www ``(Please take note of the generated link. You can change the port to whatever you like)
  - Edit .env file and change the line "VERIFYIPFSAPI" to the url (Please update the URL hostname and protocol(https/http) only, the query string are fixed)
- Install the necessary packages for the UI and migrate the contracts to your local blockchain
  - Install dependencies `npm install`
  - Compile contracts `truffle compile`
  - Migrate to blockchain `truffle migrate`
  - Run `truffle test` to run the tests (You MUST start the backend server to complete the test. This also requires connection to the internet (Using Infura IPFS))
  - Start the server `npm run start`

### Server/Browser
The server has been configured to listen on 0.0.0.0 port 3000. Open your browser to http://localhost:3000 to view the web UI.

### Web3 Injectors
There is no need for metamask or other web3 injectors. The web3 object is injected by Uport.

## Code Structure
The main solidity contract is at contracts/ProofOfExistence.sol. This contains the main contract logic.
This project also uses the Oraclize library for Oracle services (To poll the backend API that verifies IPFS)
The other folders are only related to the web UI

## Tests
Tests are contained in tests/ProofOfExistence.sol.
Each test are aimed at a specific use case, such as storing a document, and verification of document.

## Libraries
Uses the Oraclize (https://github.com/oraclize/ethereum-api) API to provide Oracle services. This is stored at installed_contracts/

