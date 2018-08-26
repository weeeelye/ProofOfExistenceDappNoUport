# Stretch requirements 

Part of my goal in this project is to know more about the whole ecosystem.

Here are the following tools/frameworks that are used:


## Uport
This is used as the main mechanism to authenticate users and call contract functions.
This app requires the use of Uport account and the Uport App to work.
The original intent is to have a backend server to authenticate. However with time limitations, upon login, the user's credentials are stored in local storage. Please do not use this in production.

## IPFS
As the blockchain is impractical for storing data, IPFS is the perfect companion to store data.
This app uploads files to the infura IPFS node. However, the files are not pinned and will disappear anytime.

## Oracle
This app uses the Oraclize service to call an external URL API that will download and hash the file contents.
The original intent is to host and create the oracle service myself, but this is a good opportunity to learn about the Oraclize service.
