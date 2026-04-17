# NFTmail.box — Decentralized Sovereign Inbox Protocol

**0G APAC Hackathon Submission — Core Module**

> [!IMPORTANT]
> This repository is the Protocol Frontend for the **GhostAgent 0G Hackathon Submission**. To see the full A2A Agent orchestration logic, please refer to the primary repository: [GhostAgent Ninja](https://github.com/eyemine/ghostagent-ninja)

---

## 1. Project Summary

### What the project does
NFTmail.box acts as the foundational decentralized email client for human operators and AI delegates. Users can claim a `.0g` or `.gno` namespace, which provisions a Web3-native email inbox (`name@nftmail.box`). 

### The Problem it solves
Emails currently rely on centralized servers (Gmail, Outlook) that harvest data and cannot natively integrate with Web3 smart contracts or autonomous agents. By mapping an email address entirely to an on-chain NFT/Token Bound Account, ownership of the inbox becomes an immutable digital asset. The user's public key acts as the encryption layer, and A2A communications are trustlessly verifiable on-chain.

### 0G Components Used
- **0G Storage:** Replaces IPFS as the primary, persistent Decentralized Data Availability layer for all inbox states, drafts, and encrypted attachments.
- **0G SpaceID Integration:** Native resolution of `.0g` domains to deploy and claim custom agent namespace tokens via our wizard.

---

## 2. 0G Integration Proof

- **0G Storage Adapter:** Integrated within the Next.js API ecosystem.
- **On-Chain Log Verifier (Newton Testnet):** `0x8378054ffFac40f795dbA039156535eb953b3356`
- **Explorer Link:** [View Contract on 0G Explorer](https://scan-testnet.0g.ai/address/0x8378054ffFac40f795dbA039156535eb953b3356)

---

## 3. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    NFTmail.box Dashboard                     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │ Dashboard│  │ Inbox /  │  │ X402     │  │ Privy Auth │   │
│  │ UI &     │  │ Webhook  │  │ Payments │  │ (Wallets)  │   │
│  │ Send     │  │ ECIES    │  │ Gateway  │  │            │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘   │
│       └─────────────┴─────────────┴───────────────┘         │
│                          │                                  │
│              ┌───────────▼───────────┐                      │
│              │  zero-g-storage.ts    │  ◄── 0G ADAPTER      │
│              └───────────┬───────────┘                      │
└──────────────────────────┼──────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │      0G Storage         │  
              │  (Inbox Persistence)    │
              └─────────────────────────┘
```

**How the Modules Support the Product:**
- **0G Storage** allows the email history of agents and humans to be stored in an immutable, low-cost decentralized persistent layer, avoiding centralized hosting completely.

---

## 4. Local Deployment & Reproduction

### Setup Steps
```bash
# 1. Clone the repository
git clone https://github.com/eyemine/nftmailbox-netlify-0g.git
cd nftmailbox-netlify-0g

# 2. Setup Environment Variables
cp env.example .env.local

# REQUIRED 0G ENV VARS (ensure these are populated):
# ZEROG_PRIVATE_KEY=<your 0G Network funding private key>
# ZEROG_STORAGE_NODE=https://rpc-testnet.0g.ai
# NEXT_PUBLIC_ZEROG_GATEWAY=https://${YOUR_RPC_ENDPOINT}

# 3. Install dependencies
npm install

# 4. Boot the development servers
npm run dev
```

---

## 5. Demo Video
Please refer to the main submission repository (GhostAgent) for the comprehensive 3-minute video demonstrating the ecosystem.

---

**Built by the GhostAgent Team for the 0G APAC Hackathon (May 2026).**
