import IpfsAPI from 'ipfs-api'

export const ipfs = new IpfsAPI({ host: process.env.REACT_APP_IPFS_HOST , port: 5001, protocol: 'https'});
