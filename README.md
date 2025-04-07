1. Config Gelato

- Deposit USDC to Gelato for gas fee.
  https://app.gelato.network/1balance
  Select the polygon network and deposit USDC.

- Get the Gelato API_KEY
  https://app.gelato.network/relay

  Create an app and input 0x3c499c542cef5e3811e1192ce70d8cc03d5c3359(POLYGON USDC) as the contract address.

- Enable 2 functions:

  - transferFrom
  - permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)

- Get the API_KEY from the app.

2. add .env file by following .env_example.

- Update the PRC_URL with your infura API_KEY
- Update the PRIVATE_KEY: add 0x prefix like 0xPRIVATE_KEY
- Update GELATO_RELAYER_API_KEY
- Update RECIPIENT: the address you want to transfer USDC to
- Update AMOUNT: the amount of USDC you want to transfer

3. Run the script

```
node index.js
```

4. Expected Output

The script will:

1. Generate a permit signature for USDC transfer
2. Submit the transaction through Gelato relay
3. Print the transaction hash when successful
