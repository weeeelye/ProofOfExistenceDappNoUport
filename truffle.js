require('dotenv').config()

module.exports = {
  networks: {
	development: {
	      host: "127.0.0.1",
	      port: 8545,
	      network_id: "*", // Match any network id
    	},
	rinkeby: {
	      host: "localhost",
	      port: 8545,
       	      network_id: "4", // Rinkeby ID 4
	      from: "0xaF846548D739241bE58a4FA9E1410A57Bb26D6ca", // account from which to deploy
	}
  }
};
