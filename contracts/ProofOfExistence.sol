pragma solidity 0.4.24;

import "./Ownable.sol";
import "../installed_contracts/oraclize-api/contracts/usingOraclize.sol";

contract ProofOfExistence is Ownable, usingOraclize {

  enum DocumentState{
      DocumentNull,
      DocumentUploaded,
      DocumentBeingVerified,
      DocumentVerified,
      DocumentVerifyFailed
  }

  mapping (string => Document) private hashToDocuments;
  mapping (bytes32 => string) private queryToHash;

  uint256 public totalItems;
  string public verifyApiCall;

  struct Document{
    address documentOwner;
    bytes32 docName;
    string ipfsHash;
    uint256 publishedBlockNumber;
    uint256 verifiedBlockNumber;
    bytes32 dataType;
    bool exist;
    DocumentState state;
  }

  modifier documentExist(string _document){
    require(hashToDocuments[_document].exist == true);
    _;
  }

  modifier documentDoesNotExist(string _document){
    require(hashToDocuments[_document].exist == false);
    _;
  }

  modifier nonZero(string _str){
    require(compareStrings(_str, "0") == false);
    _;
  }

  event DocumentStored(address indexed _docOwner, string _hashed_doc, bytes32 _dataType, string _ipfsHash, bytes32 _docName, uint256 _publishedBlockNumber);
  event DocumentVerifyComplete(address indexed _docOwner, string _hashed_doc, string _ipfsHash, bool _result);
  event LogNewOraclizeQuery(string _description);
  event EmitPrice(uint _required, uint _sent);

  constructor() public
  {
    //OAR = OraclizeAddrResolverI(0x4E8052BA76a00fB0A220500F53A467D5b207E252);
  }

  function setVerifyAPIGateway(string _verifyApiCall)
  public onlyOwner
  {
    verifyApiCall = _verifyApiCall;
  }

  function storeDocumentData(string _hashed_doc, bytes32 _docName, string _ipfsHash, bytes32 _dataType)
  public switchOn documentDoesNotExist(_hashed_doc)
  nonZero(_hashed_doc)
  nonZero(_ipfsHash)
  payable {
    //Check for overflow
    require((totalItems + 1) >  totalItems);

    hashToDocuments[_hashed_doc] = Document ({
      documentOwner: msg.sender,
      docName: _docName,
      ipfsHash: _ipfsHash,
      publishedBlockNumber: block.number,
      verifiedBlockNumber: 0,
      dataType: _dataType,
      exist: true,
      state: DocumentState.DocumentUploaded
    });
    totalItems++;
    emit DocumentStored(msg.sender, _hashed_doc, _dataType, _ipfsHash, _docName, block.number);
  }

  function getDocumentIPFSHash(string _docHash)
  public documentExist(_docHash) view returns (string)
  {
    return hashToDocuments[_docHash].ipfsHash;
  }

  function getDocumentMetaData(string _docHash)
  public documentExist(_docHash) view returns (address, bytes32, bytes32, uint)
  {
    return (hashToDocuments[_docHash].documentOwner, hashToDocuments[_docHash].docName,
    hashToDocuments[_docHash].dataType, uint(hashToDocuments[_docHash].state));
  }

  function getDocumentStatus(string _docHash)
  public documentExist(_docHash) view returns (uint)
  {
    return uint(hashToDocuments[_docHash].state);
  }

  function getDocumentBlockInfo(string _docHash)
  public documentExist(_docHash) view returns (uint, uint)
  {
    return (hashToDocuments[_docHash].publishedBlockNumber,
    hashToDocuments[_docHash].verifiedBlockNumber);
  }

  function compareStrings (string a, string b) private pure returns (bool){
       return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
  }

  function __callback(bytes32 _queryId, string result)
  public
  {
        require (msg.sender == oraclize_cbAddress());
        require (hashToDocuments[queryToHash[_queryId]].exist == true);

        if(compareStrings(queryToHash[_queryId], result) == true)
        {
            hashToDocuments[queryToHash[_queryId]].state = DocumentState.DocumentVerified;
            hashToDocuments[queryToHash[_queryId]].verifiedBlockNumber = block.number;
            emit DocumentVerifyComplete(hashToDocuments[queryToHash[_queryId]].documentOwner,
            queryToHash[_queryId], hashToDocuments[queryToHash[_queryId]].ipfsHash, true);
            delete queryToHash[_queryId];
        }
        else
        {
            hashToDocuments[queryToHash[_queryId]].state = DocumentState.DocumentVerifyFailed;
            emit DocumentVerifyComplete(hashToDocuments[queryToHash[_queryId]].documentOwner,
            queryToHash[_queryId], hashToDocuments[queryToHash[_queryId]].ipfsHash, false);
            delete queryToHash[_queryId];
        }
  }

  function verifyIPFSHash(string _docHash, uint gasPrice)
  public switchOn documentExist(_docHash) payable
  {
    require((hashToDocuments[_docHash].state != DocumentState.DocumentNull));
    require(oraclize_getPrice("URL", gasPrice) < msg.value);

    if (oraclize_getPrice("URL", gasPrice) < msg.value) {
      hashToDocuments[_docHash].state = DocumentState.DocumentBeingVerified;
      bytes32 queryId = oraclize_query('URL', strConcat('json(', verifyApiCall , hashToDocuments[_docHash].ipfsHash,').actual_hash'));
      queryToHash[queryId] = _docHash;
      emit LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
    }
    else
    {
      emit LogNewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
      emit EmitPrice(oraclize_getPrice("URL", gasPrice), msg.value);
    }
  }
}