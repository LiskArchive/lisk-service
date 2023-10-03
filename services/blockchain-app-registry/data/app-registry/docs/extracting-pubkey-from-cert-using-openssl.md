# How to extract Public Key from a PEM certificate using OpenSSL

OpenSSL is a widely used cryptographic library that allows you to work with SSL/TLS certificates and keys. If you have a PEM certificate that you use to secure your deployments and need to extract the associated public key, you can use the OpenSSL command-line tool.

## Prerequisites

Before proceeding, please make sure you have OpenSSL installed on your system. Most unix-like systems such as Ubuntu, MacOS come with OpenSSL pre-installed. But, if you're on Windows, you can download OpenSSL binaries from the [official website](https://www.openssl.org/).

## Steps to extract the public key

1. **Open a Terminal or Command Prompt window:**

   For Unix-like systems, open your terminal. For Windows, launch the Command Prompt or PowerShell.

2. **Locate your PEM certificate:**

   Ensure you have the PEM certificate file (e.g. `certificate.pem`) available in the directory where you are executing the OpenSSL command.

3. **Extract the public key:**

   Use the `openssl` CLI to extract the public key from the PEM certificate with the following command. The extracted public key will be saved in `public_key.pem` file:

   ```bash
   openssl rsa -pubout -in certificate.pem -out public_key.pem
   ```
