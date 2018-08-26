import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import { web3, contract_instance } from '../../util/connectors.js'
import { ipfs } from '../../util/ipfs.js'
import FontAwesome from 'react-fontawesome'

class Dashboard extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props

    this.state = {
      tx: [],
      buffer: null,
      data: null,
      hash: null,
      loading: false,
      added: false,
      status: ""
    }
    this.onSubmit = this.onSubmit.bind(this)
    this.onDrop = this.onDrop.bind(this)
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    if(this.state.loading === false)
    {
      acceptedFiles.forEach(file => {
        this.setState({
          data: file
        });
        const reader = new FileReader()
        reader.onloadend = () => {
              this.setState({ buffer: Buffer(reader.result), hash: web3.sha3(reader.result) })
        };
        reader.readAsBinaryString(file)
      });
    }
  }

  showDocumentData(){
    if(this.state.data)
    {
      return <div><br /><br />
        <h2>Data</h2>
        <p><strong>File name: </strong> {this.state.data.name}</p>
        <p><strong>Data detected: </strong> { this.state.data.type ? this.state.data.type : 'unknown'}</p>
        <p><strong>Size: </strong> {this.state.data.size} bytes</p>
        <p><strong>Keccak256 Hash: </strong> {this.state.hash} </p>
      </div>
    }
  }

  showImagePreview(){
    if((this.state.data) && (/^image\//i).test(this.state.data.type))
    {
      return <div><br /><br />
        <h2>Preview</h2>
        <div><img alt='' src={this.state.data.preview}/></div>
        </div>
    }
  }

  showSubmitButton(){
    if((this.state.data))
    {
      if(this.state.loading)
      {
        return <div><br /><br /><button type="button" onClick={this.onSubmit} disabled>Upload</button>
        &nbsp; &nbsp; <FontAwesome name="spinner" spin /> {this.state.status}
        </div>
      }
      else
        return <div><br /><br /><button onClick={this.onSubmit}>Upload</button></div>
    }
  }

  showDropzone(){
    if(!this.state.loading)
    {
      return <Dropzone style={{"width" : "100%", "height" : "100px", "borderStyle" : "dashed", "borderWidth": "2px", "borderColor": "rgb(102, 102, 102)"}} onDrop={this.onDrop.bind(this)} multiple={false}>
          <div className="drop-files">Drop your files or click here !!</div>
      </Dropzone>
    }
    else {
      return <Dropzone style={{"width" : "100%", "height" : "1-0px", "borderStyle" : "dashed", "borderWidth": "2px", "borderColor": "rgb(102, 102, 102)"}} onDrop={this.onDrop.bind(this)} multiple={false} disabled>
          <div className="drop-files">Drop your files here !!</div>
      </Dropzone>
    }
  }


  showTransactionMessage(){
    if(this.state.added && this.state.tx.length !== 0)
    {
        return <div><p style={{ "color": "green", "fontSize": "20px" }}><FontAwesome name="child" size="4x"/>Success! Your transaction { this.state.tx[this.state.tx.length - 1] } is
        now waiting for confirmation. Click <a href={'https://rinkeby.etherscan.io/tx/' + this.state.tx[this.state.tx.length - 1]} target="_blank">here</a> to view the transaction.</p>
        </div>
    }
  }

  onSubmit(){
    if(this.state.data && this.state.hash && this.state.buffer)
    {
        this.setState({ status: "Uploading to IPFS.. please be patient (May take up to 10 mins)", loading: true })
        ipfs.files.add(this.state.buffer, (error, result) => {
          if(error){
            alert(error)
            this.setState({ loading: false })
            return
          }
          var type = this.state.data.type
          if(!type)
              type = 'unknown'

          //console.log("File Hash", this.state.hash, " Name", web3.fromAscii(this.state.data.name),
          //"IPFS Hash", result[0].hash, "Data Type", web3.fromAscii(type))
          this.setState({ status: "Storing data in contract"})
          contract_instance.storeDocumentData(this.state.hash, web3.fromAscii(this.state.data.name),
            result[0].hash, web3.fromAscii(type), { gas: 600000 }, (error,result) =>{
              //console.log("TX_STORE_DOC", result)
              this.setState({ buffer: null, data: null, hash: null, loading: false, tx: [...this.state.tx,result], added: true})
          })
        })
    }
  }

  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Upload your file</h1>
            {this.showTransactionMessage()}
            <p><strong>To store a file, drop your file to the box below, or click to select file</strong> </p>
            <p><strong>Your file will be uploaded and stored on IPFS. A hash of the file and other meta data will be
            stored on the block chain. <br /> This will allow you to prove the existence of this file.
            </strong> </p>
            {this.showDropzone()}
            {this.showImagePreview()}
            {this.showDocumentData()}
            {this.showSubmitButton()}
          </div>
        </div>
      </main>
    )
  }
}

export default Dashboard
