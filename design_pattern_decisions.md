# Design Pattern Decisions

## Commit/Reveal
No commit / reveal is needed, as non of the functions of the contract require this.

## Circuit Breaker/Emergency Stop
This is implemented in the contracts; The owner of the contract can halt the function of this contract (Mainly storing data and verifying data) if he/she desires.
However the get functions will still work.

## Pull Payments
No pull payments are required, as such is not implemented in the contract

## State Machine
The State Machine pattern is used to allow users to check the status of the Verification process, since it is triggered by the Oracle, the verification process can be quite opaque.

## Fail early and fail loud
Most of the functions fail early, with the exception of the verifyIPFSHash function.
This is because the 

## Restricting Access
Certain functions are only restricted to the owner. This includes the circuit breaker and change owner functions.
By design, the other contract functions are allowed to be accessed by anyone: Anyone can store file data in the contract.

## Auto Deprecation
This is not used as it is not required.

## Mortal
This is not implemented, as the data stored as proof of existence of files should not be able to be deleted at will.

## Speed Bump
This is not implemented, as there it is not required.
