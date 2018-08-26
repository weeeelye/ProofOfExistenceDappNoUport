var ProofOfExistence = artifacts.require("./ProofOfExistence.sol");
var IpfsAPI = require('ipfs-api');

/**
 * Helper to wait for log emission.
 * @param  {Object} _event The event to wait for.
 */
function promisifyLogWatch(_event) {
  return new Promise((resolve, reject) => {
    _event.watch((error, log) => {
      _event.stopWatching();
      if (error !== null)
        reject(error);

      resolve(log);
    });
  });
}

contract('ProofOfExistenceTester', (accounts) => {
    const owner = accounts[0];
    const user = accounts[1];
    let hashed_doc = web3.sha3("abc");
    let doc_name = web3.fromAscii("Hello.txt");
    let data_type = web3.fromAscii("text/html");
    let ipfs_hash = "QmDOESNOTEXIST";
    const ipfs = new IpfsAPI({ host: process.env.REACT_APP_IPFS_HOST, port: 5001, protocol: 'https'});
    let instance;
    
    beforeEach('Check that contract is deployed', async function () {
        instance = await ProofOfExistence.deployed();
    })

    it("should be able to set verify HTTP API endpoint", async () => {
	await instance.setVerifyAPIGateway(process.env.VERIFYIPFSAPI,{from: owner});
	let setVerifyAPIString = await instance.verifyApiCall.call();
	assert(process.env.VERIFYIPFSAPI == setVerifyAPIString);
    });

    it("should be able to store a document", async () => {
        let response = await instance.storeDocumentData(hashed_doc, doc_name, ipfs_hash, data_type, { from: user });

	let log = response.logs[0];
	assert.equal(log.event, 'DocumentStored', 'DocumentStored not emitted.');
	assert.equal(log.args._docOwner, user, 'Contract user address incorrect');
	assert.equal(log.args._hashed_doc, hashed_doc, 'Contract user hash stored incorrect');
	assert.equal(web3.toUtf8(log.args._dataType), web3.toUtf8(data_type), 'Contract user datatype stored incorrect');

	let status = await instance.getDocumentStatus(hashed_doc);
        assert.equal(status, 1, 'Document status not DocumentUploaded after upload');

	let totalItems = await instance.totalItems.call();
	assert.equal(totalItems, 1, 'Total Items do not match');
    });

    it("should reject a document if it already exists", async () => {
	try {
		await instance.storeDocumentData(hashed_doc, doc_name, ipfs_hash, data_type, { from: user });
		throw null;
	}
	catch (error) {
	        assert(error, "Expected an error but did not get one");
    	}
    });

    it("verify a IPFS file with an incorrect ipfs hash", async () => {
	let gasPrice = 500000;

	response = await instance.verifyIPFSHash(hashed_doc, gasPrice, { value: web3.toWei(0.03, 'ether') ,from: user });
        log = response.logs[0];
        assert.equal(log.event, 'LogNewOraclizeQuery', 'LogNewOraclizeQuery not emitted.');
        assert.equal(log.args._description, "Oraclize query was sent, standing by for the answer..", 'Oracle query failed.. send more eth');

	let status = await instance.getDocumentStatus(hashed_doc);
        assert.equal(status, 2, 'Document status not DocumentBeingVerified');

	const logDocumentVerifiedWatcher = promisifyLogWatch(instance.DocumentVerifyComplete({ fromBlock: 'latest' }));
        log = await logDocumentVerifiedWatcher;
        assert.equal(log.event, 'DocumentVerifyComplete', 'DocumentVerifyComplete not emitted.');
        assert.equal(log.args._hashed_doc, hashed_doc, 'Document hashes dont match');

	status = await instance.getDocumentStatus(hashed_doc);
        assert.equal(status, 4, 'Document status not DocumentVerifyFailed');
	
    });

    it("verify a real IPFS file using oracle with external file verification API", async () => {

	let sample_text = "Hello World";
	let sample_buffer = Buffer.from(sample_text, 'utf8');
	let sample_hashed_doc = web3.sha3(sample_text);
        let sample_doc_name = web3.fromAscii("HelloWorld.txt");
        let sample_data_type = web3.fromAscii("text/html");
	let gasPrice = 500000;

	let filesAdded = await ipfs.files.add({
		path: "HelloWorld.txt",
		content: sample_buffer
	});

	let sample_ipfs_hash = filesAdded[0].hash;

	assert(sample_ipfs_hash, "Expected a valid IPFS hash but did not have one");

	let response = await instance.storeDocumentData(sample_hashed_doc, sample_doc_name, sample_ipfs_hash, sample_data_type, { from: user });

	let log = response.logs[0];
        assert.equal(log.event, 'DocumentStored', 'DocumentStored not emitted.');

	response = await instance.verifyIPFSHash(sample_hashed_doc, gasPrice, { value: web3.toWei(0.03, 'ether') ,from: user });
	log = response.logs[0];

	assert.equal(log.event, 'LogNewOraclizeQuery', 'LogNewOraclizeQuery not emitted.');
        assert.equal(log.args._description, "Oraclize query was sent, standing by for the answer..", 'Oracle query failed.. send more eth');

	let status = await instance.getDocumentStatus(sample_hashed_doc);
        assert.equal(status, 2, 'Document status not DocumentBeingVerified');

	const logDocumentVerifiedWatcher = promisifyLogWatch(instance.DocumentVerifyComplete({ fromBlock: 'latest' }));

	log = await logDocumentVerifiedWatcher;

	assert.equal(log.event, 'DocumentVerifyComplete', 'DocumentVerifyComplete not emitted.');
    	assert.equal(log.args._hashed_doc, sample_hashed_doc, 'Document hashes dont match');

	status = await instance.getDocumentStatus(sample_hashed_doc);

	assert.equal(status, 3, 'Document status not DocumentVerified after verification');
    });
});
