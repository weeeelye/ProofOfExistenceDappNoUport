import { Connect, SimpleSigner } from 'uport-connect'
import ProofOfExistenceContract from '../../build/contracts/ProofOfExistence.json'
const contract_address = process.env.REACT_APP_CONTRACT_ADDRESS

// This section should be on a auth server. DO NOT USE THIS IN PRODUCTION
const signer = SimpleSigner('f3d4417ea84191bf730ab24eedc10cb9c2fa7584bb5bcac1dd5301045346d488')

const uport = new Connect('POE', {
      clientId: '2orUcknzwpGZTARvfnkW1EqQAc1X8GnARXQ',
      network: 'rinkeby',
      signer: signer
})
// End section

const web3 = uport.getWeb3()

const contract_factory = web3.eth.contract(ProofOfExistenceContract.abi)
const contract_instance = contract_factory.at(contract_address)

export { web3, uport, signer , contract_instance, contract_address}
