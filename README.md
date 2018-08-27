# Proof Of Existence DApp Readme

This is a proof of existence dapp. It uses the truffle box react-uport boiler plate.

The web UI provides a way for the user to upload their document data (Hashes, and other data like file name, file data type).


Although it can be done, it is not practical to code the contract to hash the data on chain, hence the file is hashed on the client (UI) side and uploaded to infura's IPFS. A oracle service is run such that it will retrieve the file from the IPFS and hash the data.
The function on the blockchain will compare the hash from the user's submitted hash and the hash that the oracle service provides and update the status on the blockchain.

## Getting Started

### Demo Site
http://ec2-18-136-124-79.ap-southeast-1.compute.amazonaws.com:3000/

### Running on localhost
To run it on localhost, please do the following:
- Install truffle, ganache-cli, ethereum-bridge (https://github.com/oraclize/ethereum-bridge), localtunnel (https://github.com/localtunnel/localtunnel), along with the usual node, npm
- Start your ganache-cli in a window
- Start the Ethereum bridge in another window
  - Run: `ethereum-bridge -H localhost:8545 -a 9` where (9) is the account to deploy contract to.
  - Copy the line that says `OAR = OraclizeAddrResolverI(0xXXXXXX);` to contracts/ProofOfExistence.sol's constructor. A commented out line should be present there. Replace it with yours
- Start the backend IPFS file auth server (This is NOT a IPFS node.)
  - Default will be using my server at `http://ec2-18-136-124-79.ap-southeast-1.compute.amazonaws.com/api/getHash?q=`
  - If you do, you can skip straight to "Install the necessary packages"
  - Run: `cd react-backend && npm install`
  - Run the server: `PORT=3001 node bin/www `(You can change the port to whatever you like)
  - Run localtunnel `lt --port 3001` (Please take note of the URL for next step)
  - Edit .env file and change the line "VERIFYIPFSAPI" to the url (Please update the URL hostname and protocol(https/http) only, the query string are fixed)
- Install the necessary packages for the UI and migrate the contracts to your local blockchain
  - Install dependencies `npm install`
  - Compile contracts `truffle compile`
  - Migrate to blockchain `truffle migrate`
  - Copy the address ProofOfExistence has been deployed to .env, line "REACT_APP_CONTRACT_ADDRESS"
  - Run `truffle test` to run the tests (You MUST start the backend server to complete the test. This also requires connection to the internet (Using Infura IPFS))
  - Start the server `npm run start`

### Running on Rinkeby
To run it on Rinkeby, please do the follow:
- Get at least 2 Rinkeby accounts with some Eth from the Rinkeby faucet. (For truffle test)
- Edit `truffle.js` set the `from:` param to your account
- Run geth: `geth --rinkeby --cache 1024 --ipcpath <IPC_PATH> --syncmode light --rpc --unlock="0,1" --password="<PASSWORD_FILE>"`
- Wait for your node to sync (5 mins to be safe)
- Start the backend IPFS file auth server (This is NOT a IPFS node.)
  - Default will be using my server at `http://ec2-18-136-124-79.ap-southeast-1.compute.amazonaws.com/api/getHash?q=`
  - If you do, you can skip straight to "Install the necessary packages"
  - Run: `cd react-backend && npm install`
  - Run the server: `PORT=3001 node bin/www `(You can change the port to whatever you like)
  - Run localtunnel `lt --port 3001` (Please take note of the URL for next step)
  - Edit .env file and change the line "VERIFYIPFSAPI" to the url (Please update the URL hostname and protocol(https/http) only, the query string are fixed)
- Install the necessary packages for the UI and migrate the contracts to your local blockchain
  - Install dependencies `npm install`
  - Compile contracts `truffle compile`
  - Migrate to blockchain `truffle migrate --network rinkeby --reset`
  - Copy the address ProofOfExistence has been deployed to .env, line "REACT_APP_CONTRACT_ADDRESS"
  - Run `truffle test --network rinkeby` to run the tests (You MUST start the backend server to complete the test. This also requires connection to the internet (Using Infura IPFS)). Note: The tests also take around ~10mins? to complete
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

## Known Issues
1) Find files always fails on first try.


Click submit a second time.


2) No files found at "Your Files" page or loading takes forever.


Unfortunately, there could be an issue with the rinkeby infura node that we cannot do about. 


Sometimes the RPC node is too busy or overloaded it returns a 502 error (Check your browser's console). 
Sometimes it returns an empty array when queried (May have to do with Infura's caching?). 
You can load the contract up at Remix with the address from deployed_addresses.txt and it will work.
