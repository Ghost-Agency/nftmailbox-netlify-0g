# 🦾 GhostAgent: Sovereign AI Agents on Gnosis Chain & 0G

> Built for the 0G APAC Hackathon 2026

GhostAgent is a framework for deploying sovereign AI agents on Gnosis Chain. Each agent gets:
- 🔐 A Gnosis Safe for secure asset management
- 📧 An `[agent]_@nftmail.box` email address
- 🦾 An upgradeable ERC-6551 Token Bound Account
- 🎭 Story Protocol IPA registration

## 🏗️ Architecture

### Core Components
- **GhostRegistryV2**: Upgradeable registry that mints agent NFTs and manages their Safes
- **MinimalERC6551Account**: Lightweight implementation focused on security and reliability
- **Safe Module**: Enables automated Safe management through the registry

### Key Features
- ✨ One-click agent deployment via `register(name, safe)`
- 🔄 Upgradeable account implementation via `updateImplementation()`
- 🛡️ Safe-native security model
- 📈 $SURGE reputation tracking (coming soon)

## 🚀 Deployment

```bash
# Install dependencies
forge install

# Deploy contracts
forge script script/DeployMinimalERC6551Account.s.sol --rpc-url $GNOSIS_RPC --broadcast
```

## 🔗 Contract Addresses

### 0G Newton Testnet
- **GhostAgentStorageLog**: `0x8378054ffFac40f795dbA039156535eb953b3356`
- **MinimalERC6551Account**: `0xD21134524F02F5FbA2d83891C1EE0b60943E1d47`

### Gnosis Mainnet
- **GNS Registry**: `0x1993425f18AdE3A68A79E2E20a65684f885f6EAd`
- **ERC-6551 Registry**: `0x000000006551c19487814612e58FE06813775758`
- **Story Protocol IPA**: `0x773197595A8897db8419106308D222f063b11568`

## 📚 Documentation

### Creating an Agent
1. Deploy a Gnosis Safe
2. Call `register("name", safeAddress)` on GhostRegistryV2
3. Your agent is now accessible at `name_@nftmail.box`

### Security
- All agent assets are secured by Gnosis Safe
- Registry acts as a Safe module for automated management
- Upgradeable implementation allows security patches

## 🛠️ Development

```bash
# Copy example env
cp env.example .env

# Configure your environment
vim .env

# Run tests
forge test
```

## 🏆 0G Hackathon Integration

Built for the 0G APAC Hackathon 2026, integrating:
- ⚡ 0G Storage for Sovereign Decentralized Data Availability (replaces legacy IPFS)
- 🌐 SpaceID `.0g` Names (recognizing new Web3 agent identities)
- 🛡️ Gnosis Safe for institutional-grade security
- 📜 Story Protocol for IP management

## 📄 License

MIT
