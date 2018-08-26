import React, { Component } from 'react'
import { web3, contract_instance } from '../../util/connectors.js'
import FontAwesome from 'react-fontawesome'

class Find extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props

    this.state = {
      hash: "",
      ipfs: "",
      documentState: null,
      documentName: null,
      documentOwner: null,
      documentDataType: null,
      documentPublishedBlock: null,
      documentVerifiedBlock: null,
      result: "",
      error: "",
      notFound: "",
      loading: false
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    if(event.target.name.value)
    {
      this.setState({ hash: event.target.name.value, loading: true });

      contract_instance.getDocumentMetaData( this.state.hash , (error, result) => {
            //console.log("result", result)
            if(!error && result[0] !== "0x" && result[3].toString !== "0"){
              this.setState({ error: error, result: result, notFound: "" });
              contract_instance.getDocumentIPFSHash(this.state.hash, (error, result) =>{
                  if(!error){
                      this.setState({ipfs: result, loading: false,});
                  }
              });
            }
            else
              this.setState({ error: error, result: "", loading: false, notFound: "Document not found in blockchain." });
      });
    }
  }

  showDocumentData(){
      return <div>
        <h2>Data</h2>
        <p>File name: {this.state.result.name}</p>
        <p>Data detected: {this.state.result.type}</p>
        <p>Size: {this.state.result.size} bytes</p>
        <p>IPFS: {this.state.ipfs} </p>
      </div>
  }

  showImagePreview(){
    if((this.state.result) && (/^image\//i).test(this.state.result.type))
    {
      return <div>
        <h2>Preview</h2>
        <div><img alt='' src={this.state.result.preview}/></div>
        </div>
    }
  }

  translateDocumentStateToString(i){
      var state = "Document does not exist"
      switch(i)
      {
          case "0": state = "Document does not exist"
                  break
          case "1": state = "Document entry added to blockchain"
                  break
          case "2": state = "Document is currently being verified by oracle"
                  break
          case "3": state = "Document has been verified by oracle"
                  break
          case "4": state = "Document verification failed."
                  break
          default: state = "Document does not exist"
                  break
      }
      return state
  }

  showFile(){
      return <div>
          <p><strong>Owner: </strong>{ this.state.result[0] } </p>
          <p><strong>Document Name: </strong>{ web3.toAscii(this.state.result[1]) } </p>
          <p><strong>Data Type: </strong>{ web3.toAscii(this.state.result[2]) } </p>
          <p><strong>Status: </strong>{ this.translateDocumentStateToString(this.state.result[3].toString()) } </p>
      </div>
  }

  notfound(){
      return <div><p> { this.state.notFound }</p></div>
  }

  loadingSpinner(){
      return <FontAwesome name="spinner" spin size="4x"/>
  }

  render() {

    let status;

    if(this.state.notFound)
        status = this.notfound()
    else if (this.state.result) {
        status = this.showFile()
    }
    else if(this.state.loading)
        status = this.loadingSpinner()

    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Find a file in the block chain</h1>
            <h5>
              Enter the file's keccak256 hash to find out about that file's information.
            </h5>
            <br />
            <form onSubmit={this.handleSubmit}>
              <label>
                Hex String (0xDEADBEEF) : {'  '}
                <input type="text" name="name" pattern="(0x)[a-fA-f0-9]{64}$" size="75" required/>
              </label>
              &nbsp;&nbsp;<input type="submit" value="Submit"/>
            </form>
            <br /><br />
            <div style={{display: 'flex', justifyContent: 'center'}}>
              { status }
            </div>
          </div>
        </div>
      </main>
    )
  }
}

export default Find
