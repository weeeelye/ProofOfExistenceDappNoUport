import React, { Component } from 'react'
import { web3, contract_address, contract_instance } from '../../../util/connectors.js'
import { decode } from 'mnid'
import abiDecoder from 'abi-decoder'
import FontAwesome from 'react-fontawesome'
import ProofOfExistenceContract from '../../../../build/contracts/ProofOfExistence.json'
import "./Profile.css";

class Profile extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props
    this.state = {
      results: null,
      decodedData: null,
      userAddr: null,
      docStatus: [],
      finishedLoading: false,
      verifyStatus: [],
      verifyResults: null,
      verifyDecodedData: null,
      verifyMsg: ""
    }
  }

  componentDidMount() {
    this.setState({ userAddr: decode(this.props.authData.address).address })
    abiDecoder.addABI(ProofOfExistenceContract.abi)
    this.getRelatedLogs()
    this.interval = setInterval(() => this.getRelatedLogs(), 5000);
    //this.interval = setInterval(() => this.getVerifyLogs(), 10000);
  }

  getDocPromise(hash) {
    return new Promise (function (resolve, reject) {
    contract_instance.getDocumentStatus(hash, (error,result) =>{
      if (error) {
        reject(error)
      } else {
        let t = {}
        t.hash = hash
        t.state = result.toString()
        resolve(t);
      }
    })
   })
  }

  getDocStatus() {
    if(this.state.decodedData)
    {
      let promises = []
      for(let i=0;i<this.state.decodedData.length;++i)
      {
        console.log("Promises ",this.state.decodedData[i].events[1].value)
        promises.push(this.getDocPromise(this.state.decodedData[i].events[1].value))
      }
      Promise.all(promises).then((values) => {
        let docStats = []
        for(let k=0;k<values.length;k++)
        {
          docStats[values[k].hash] = values[k].state
        }
        this.setState({ docStatus: docStats, finishedLoading: true })
      })
    }
  }

  getRelatedLogs() {
    let usraddr = decode(this.props.authData.address)
    let idx_topic = '0x000000000000000000000000' + usraddr.address.slice(2)
    console.log("Log Topics: ",web3.sha3("DocumentStored(address,string,bytes32,string,bytes32,uint256)"), idx_topic)
    web3.currentProvider.sendAsync({
        jsonrpc: "2.0",
        method: "eth_getLogs",
        params: [{
                    "topics": [ web3.sha3("DocumentStored(address,string,bytes32,string,bytes32,uint256)"), idx_topic ],
                    "fromBlock": "0x0",
                    "toBlock": "latest",
                    "address": contract_address
                }],
        id : 2
        }, (err, result) => {
            if(!err && result && result.result.length > 0)
            {
              let decoded = abiDecoder.decodeLogs(result.result)
              this.setState({ "results": result, "decodedData": decoded })
              this.getDocStatus()
            }
            else if (err)
              console.log ("Failed to retrieve from Infura node.", err)
            else {
              this.setState({ finishedLoading: true })
              console.log ("No results")
            }
        })
  }

  getVerifyLogs(){
    let usraddr = decode(this.props.authData.address)
    let idx_topic = '0x000000000000000000000000' + usraddr.address.slice(2)
    //console.log("Topics",web3.sha3("DocumentStored(address,string,bytes32,string,bytes32,uint256)"), idx_topic)
    web3.currentProvider.sendAsync({
        jsonrpc: "2.0",
        method: "eth_getLogs",
        params: [{
                    "topics": [ web3.sha3("DocumentVerifyComplete(address,string,string,bool)"), idx_topic ],
                    "fromBlock": "latest",
                    "toBlock": "latest",
                    "address": contract_address
                }],
        id : 11
        }, (err, result) => {
            if(!err && result && result.result.length > 0)
            {
              let decoded = abiDecoder.decodeLogs(result.result)
              console.log("VerifyLogs", decoded)
              this.setState({ "verifyResults": result, "verifyDecodedData": decoded })
            }
            else if (err)
              console.log ("Error", err)
        })
  }

  verifyFile(fileHash){

      if(!this.state.verifyStatus[fileHash])
      {
        this.setState({verifyMsg: "A verify process has already been triggered before."})
      }

      let currStatus = this.state.verifyStatus
      currStatus[fileHash] = "Verifying.."
      this.setState({verifyStatus: currStatus})

      console.log("Verifying ", fileHash)

      contract_instance.verifyIPFSHash(fileHash, 300000, { gas: 600000, value: 50000000000000000 }, (error,result) =>{
        if (error) {
          this.setState({verifyMsg: "Error occurred when calling verify"})
          console.log("Error verifying", error)
        }
        else{
          console.log("Verify Transaction Hash", result)
          this.setState({verifyMsg: 'Verification started on transaction: ' + result})
        }
      })
  }

  showVerifyMessage(){
    return <div><p>{this.state.verifyMsg}</p></div>
  }

  showVerifyEventsByUser(){
    if(this.state.verifyDecodedData)
    {
        console.log("VERIFY EVENT",this.state.verifyDecodedData)
    }
  }

  createFileList(){
    if(this.state.results && this.state.results.result && this.state.finishedLoading)
    {
        let decodedData = this.state.decodedData
        return decodedData.map(function(data,index){
         return(
          <div className="file" key={index}>
            <p key={data.events[4].value + data.events[1].value}><strong>File Name: </strong> { web3.toAscii( data.events[4].value ) }</p>
            <p key={data.events[1].value}><strong>File Hash:</strong> { data.events[1].value }</p>
            <p key={data.events[2].value + data.events[1].value}><strong>Data Type: </strong> { web3.toAscii( data.events[2].value ) }</p>
            <p key={data.events[5].value + data.events[1].value}><strong>Published Block Number: </strong>
              <a href={'https://rinkeby.etherscan.io/block/'+ data.events[5].value } target="_blank">{ data.events[5].value }</a>
            </p>
            <p key={data.events[3].value + data.events[1].value}><strong>IPFS Hash: </strong>
              <a href={'https://' + process.env.REACT_APP_IPFS_HOST + '/ipfs/' + data.events[3].value} target="_blank">{ data.events[3].value }</a>
            </p>
            { this.state.docStatus[data.events[1].value] !== '3' ?
              <button onClick={() => this.verifyFile(data.events[1].value) }>Verify Your File Using an Oracle</button> :
              <p>This file is verified.</p>
            }
            <br /><br />
          </div>
         )
        }, this )
    }
    else if(!this.state.finishedLoading){
        return <div><FontAwesome name="spinner" spin /> Loading ... </div>
    }
    else {
        return <div><p><strong>No files uploaded!</strong></p></div>
    }
  }

  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Your Files</h1>
            <p>
              <strong>Name: </strong>&nbsp;{this.props.authData.name}<br /><br />
              <strong>Country: </strong>&nbsp;{this.props.authData.country}<br />
              <strong>UPort Address: </strong>&nbsp;{this.props.authData.address}<br />
              <strong>Ethereum Address: </strong>&nbsp;{this.state.userAddr}<br />
              <strong>Network Address: </strong>&nbsp;{this.props.authData.networkAddress}<br />
              <strong>PublicEncKey: </strong>&nbsp;{this.props.authData.publicEncKey}<br />
              <strong>Public Key: </strong>&nbsp;{this.props.authData.publicKey}<br />
              <strong>Push Token: </strong>&nbsp;{this.props.authData.pushToken}<br />
            </p><br />
            {this.showVerifyMessage()}
            {this.showVerifyEventsByUser()}
            <h2>File List</h2>
            {this.createFileList()}
          </div>
        </div>
      </main>
    )
  }
}

export default Profile
