0. Create account on rinkeby. Please get some ETH from faucet
1. geth --rinkeby --cache 1024 --ipcpath /Users/banffcyber/Library/Ethereum/geth.ipc --syncmode light -rpc --unlock="0xaF846548D739241bE58a4FA9E1410A57Bb26D6ca" --password="/Users/banffcyber/Desktop/rinkeby/password.txt"
2. cd react-backend && npm install
3. PORT=3001 node bin/www
4. lt --port 3001
   Note the link

5. cd react-uport && npm install
6. nano .env
   set the VERIFYIPFSAPI to the link above
7. truffle migrate --network rinkeby
8. npm run start
