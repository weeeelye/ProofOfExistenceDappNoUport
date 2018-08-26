var ProofOfExistence = artifacts.require("./ProofOfExistence.sol");

module.exports = async function(deployer) {
	await deployer.deploy(ProofOfExistence);
	var instance = await ProofOfExistence.deployed();
	await instance.setVerifyAPIGateway(process.env.VERIFYIPFSAPI);
};
