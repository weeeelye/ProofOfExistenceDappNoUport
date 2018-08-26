var express = require('express');
var router = express.Router();
var url = require('url');
const https = require('https');
const web3 = require('web3');

var options = {
  host: 'ipfs.infura.io',
  port: 443,
  headers:{
	'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
	'pragma': 'no-cache',
	'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.84 Safari/537.36'
  },
  method: 'GET',
  timeout: 10000
};

router.get('/getHash', function(req, res, next) {

	var ipfsHash = req.query.q;
	options.path = '/ipfs/'+ipfsHash;

	let body = "";
	
	console.log(options);

	
	var request = https.get(options, function (response) {  
	  response.setEncoding('utf8')  
	  response.on('data', function(data){
		body += data;
	  })  
	  response.on('error', function(e){
		res.statusCode(404);
		res.setHeader('Content-Type', 'application/json');
                res.send({ error: e });
	  })
	  response.on('end', function(){
		if(response.statusCode === 200)
		{
			const hash1 = web3.utils.sha3(body);
			const bytes1 = web3.utils.hexToBytes(hash1);
			res.setHeader('Content-Type', 'application/json');
			res.send({ actual_hash: hash1 });
		}
		else
		{
			res.statusCode = response.statusCode;
			res.setHeader('Content-Type', 'application/json');
                        res.send({ error: "non 200", actual_hash: "0" });
		}
	  })
	})

	request.on('socket', function (socket) {
	    socket.setTimeout(10000);  
	    socket.on('timeout', function() {
	        request.abort();
	    });
	});

	request.on('timeout', function (err) {
		request.abort();
        });

	request.on('error', function (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.send({ error: err, actual_hash: "0"});
        });
});

module.exports = router;
