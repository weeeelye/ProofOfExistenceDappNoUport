var ProofOfExistence = artifacts.require("./ProofOfExistence.sol");
var solc = require('solc')

module.exports = function(callback) {

    	ProofOfExistence.web3.eth.getGasPrice(function(error, result){ 
        var gasPrice = Number(result);
        console.log("Gas Price is " + gasPrice + " wei"); // "10000000000000"

        var ProofOfExistenceContract = web3.eth.contract(ProofOfExistence._json.abi);
        var contractData = ProofOfExistenceContract.new.getData({data: ProofOfExistence._json.bytecode});
        var gas = Number(web3.eth.estimateGas({data: contractData}))


        console.log("gas estimation = " + gas + " units");
        console.log("gas cost estimation = " + (gas * gasPrice) + " wei");
        console.log("gas cost estimation = " + ProofOfExistence.web3.fromWei((gas * gasPrice), 'ether') + " ether");

    });
};
