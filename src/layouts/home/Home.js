import React, { Component } from 'react'

class Home extends Component {
  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Proof Of Existence DApp</h1>
            <h3>Verifies the existence of your files.</h3>
            <p></p>
            <p>This application uses the Ethereum Blockchain to store files meta data and uses IPFS to store your files</p>
	          <p>To start, login using UPort on the upper right corner</p>
            <p>This app is for Demo purposes..there is no backend service for auth</p>
          </div>
        </div>
      </main>
    )
  }
}

export default Home
