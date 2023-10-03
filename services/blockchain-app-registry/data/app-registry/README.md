![Logo](./docs/assets/banner_app_registry.png)

# Lisk Application Registry

Welcome to the Lisk Application Registry. The repository contains off-chain metadata for applications developed based on the Lisk SDK and any other applications that are compatible with the Lisk Protocol.
Each application will include the [*app.json*](#app-json) containing the blockchain application-specific metadata and [*nativetokens.json*](#native-tokens-json) containing metadata about the application's native tokens.

## Repository Structure

The blockchain application metadata is arranged in the following structure: <br/> `{network}/{application}`, such as *mainnet/Lisk*.

The repository currently supports adding off-chain application metadata for the following networks:
- mainnet
- testnet
- betanet &nbsp; (temporary)
- devnet &nbsp;&nbsp; (temporary)

### App JSON

*app.json* contains high-level metadata about a specific blockchain application, such as the `chainName` corresponding to an existing `chainID`. It also supplies information regarding the application's genesis block (`genesisURL`), seed nodes (`appNodes`), corresponding Lisk Service deployments (`serviceURLs`), explorers and more. This information makes it easy to bootstrap a new node in the network or interact with an existing node.

All the *app.json* files within the repository must adhere to the schema specified [here](./schema/app.json).

Example: *mainnet/Lisk/app.json*

*Important information*:
- All the specified URLs in *app.json* (i.e. `genesisURL`, `appNodes`, and `serviceURLs`, etc.) are validated in real-time. Hence, please ensure that they are valid and reachable at the time of submission.
- Prior to the metadata submission, please ensure that the Lisk applications are registered on the Lisk mainchain and vice-versa.
- For logos pointing to app-registry GitHub URL, use the main branch in the URL to ensure working functionality after PR merge. All logos submitted need to adhere to `64px x 64px` resolution.
- For `mainnet` and `testnet` submissions, it is necessary that all the API deployments are secured with SSL/TLS.
- For every SSL/TLS secured API deployment (i.e. for `appNodes`, and `serviceURLs`), it is mandatory to specify the `apiCertificatePublicKey`. In case you need support in extracting the public key from your SSL/TLS certificate, you can use one of the following methods:
    1. [Using OpenSSL](./docs/extracting-pubkey-from-cert-using-openssl.md)
    2. [Using the NodeJS script](./utility/README.md)

### Native Tokens JSON

*nativetokens.json* contains metadata about the blockchain application's native tokens, which enables token discoverability across the Lisk ecosystem and for community tools.

All the *nativetokens.json* files within the repository must adhere to the schema specified [here](./schema/nativetokens.json).

Example: *mainnet/Lisk/nativetokens.json*

*Important information*:
- Prior to the metadata submission, please ensure that the Lisk applications are registered on the Lisk mainchain and vice-versa.
- For logos pointing to app-registry GitHub URL, use the main branch in the URL to ensure working functionality after PR merge. All logos submitted need to adhere to `64px x 64px` resolution.

### Logo Images

We recommend that all the *svg* and *png* format logo images added to the repository adhere to the following resolution: `64px x 64px`.

We also recommend that all the images are stored directly under the application's directory in the `images` subdirectory.

Example: *mainnet/Lisk/images/application/lisk.svg*

## Contributing
To contribute to the application registry with the metadata for your blockchain application, please [fork this repository and submit a *Pull Request*](./docs/creating-pull-request-from-a-fork.md) with the necessary changes. Before submitting a PR, please read through the [Repository Structure](#repository-structure) section.

This app-registry was inspired by [Cosmos Chain Registry](https://github.com/cosmos/chain-registry).

## Contributors

https://github.com/LiskHQ/app-registry/graphs/contributors

## License

Copyright 2016-2023 Lisk Foundation

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
