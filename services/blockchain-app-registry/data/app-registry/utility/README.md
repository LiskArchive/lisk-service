# Extract public key from PEM Certificate using Node.js

This Node.js script lets you extract the public key from a PEM certificate and save it locally to your filesystem. Follow the steps below to use the script:

## Prerequisites

Before using the script, kindly ensure that you have Node.js installed on your system. You can download Node.js from the [official website](https://nodejs.org).

## Getting Started

1. **Download the script:**

   Download the [`extractPublicKeyFromCertificate.js`](https://github.com/LiskHQ/app-registry/blob/main/utility/generatePublicKeyFromCertificate.js) file from this repository and save it to a location on your computer.

2. **Open a Terminal or Command Prompt:**

   Navigate to the directory where you saved the `extractPublicKeyFromCertificate.js` file using the terminal or command prompt.

4. **Generate Public Key:**

   To run the script and generate the public key, use the following command:

   ```bash
   node generate_public_key.js <path/to/certificate.pem> <path/to/public_key.pem>
   ```

   Replace `<path/to/certificate.pem>` with the path to your PEM certificate file, and `<path/to/public_key.pem>` with the desired output file path for the public key to be extracted.
