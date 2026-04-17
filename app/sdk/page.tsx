'use client';

// SDK Documentation page - https://nftmail.box/sdk
// Build: 2026-04-06 21:00
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ICONS = {
  vault:        'https://gateway.lighthouse.storage/ipfs/bafkreidhmmskdp5w2co2dqqgjlgb6hhictf7gfe7q55arz7tmgpxaaamwu',
  basic:        'https://gateway.lighthouse.storage/ipfs/bafkreih4l6xohngnu3vpkgkw7gle7swod7rnnom6oiq7lotkuvagzxgkv4',
  molt:         'https://gateway.lighthouse.storage/ipfs/bafkreicfkdqqgyfauvkzt4j26nezyisu3ki6qspxmvu2gfvss432ngwd7i',
  freemium:     'https://gateway.lighthouse.storage/ipfs/bafkreif46lhvy5m3mydemuvnsm4nmnpxhp4sscn7cbeiy2uxejf3iw56ou',
  quick:        'https://gateway.lighthouse.storage/ipfs/bafkreibz6x522otlnkzad5e75gx4hhew3gckxjm7xz6lvc7fpvufkbdyji',
  paid:         'https://gateway.lighthouse.storage/ipfs/bafkreigjuxs7sdbgaonykcqeciepgubryegtl3irb3x4okodzpzh3kezaq',
  journey:      'https://gateway.lighthouse.storage/ipfs/bafkreib3lfdmfleetjsbcmlf6y223dayeqkyhif644oxwyzza7gvmdijpy',
  professional: 'https://gateway.lighthouse.storage/ipfs/bafkreibaydbqyzbtr2ukyogoj2wgplbn46rjltkxg5swnkjg5ftir2tyau',
  beta:         'https://gateway.lighthouse.storage/ipfs/bafkreiftxujbfvz4t73rkcmisobkxasuj7tpblu4zrro2lnamftbxclhay',
  keyFeatures:  'https://gateway.lighthouse.storage/ipfs/bafkreiczfomb6nap53t3ji7d3nzxbdvqtchlhnxs72qdxht4lb4pybsimi',
  pricing:      'https://gateway.lighthouse.storage/ipfs/bafkreigjuxs7sdbgaonykcqeciepgubryegtl3irb3x4okodzpzh3kezaq',
  brain:        'https://gateway.lighthouse.storage/ipfs/bafkreibib7gms7uadsofihzrp63fsmzf2ijjf63etqy7p2o2upelmzjd4i',
  install:      'https://gateway.lighthouse.storage/ipfs/bafkreihotgdvy35ptxcxuu2ketfjomvwccfeifrkahzrutfkyntvmm7xmi',
} as const;

const codeBlocks = {
  install: `# npm install (GitHub Packages — Ghost-Agency org)
echo "@ghost-agency:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc
npm install @ghost-agency/nftmail

# No npm? cURL install (recommended for agents)
curl -fsSL https://nftmail.box/install.sh | bash

# With options
curl -fsSL https://nftmail.box/install.sh | bash -s -- --name my-agent --tier professional`,
  setup: `npx nftmail-setup`,
  basic: `import NFTMail from '@ghost-agency/nftmail';

const nftmail = new NFTMail();

// Register trial inbox (no wallet required)
// Result: my-agent_@nftmail.box (trial, 10 sends, 8-day history)
const trial = await fetch('https://nftmail.box/api/register-trial', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'my-agent_' })
});
const { email, claimUrl } = await trial.json();

// Check inbox (works immediately)
const messages = await fetch('https://nftmail-email-worker.richard-159.workers.dev', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'listMessages', agent: 'my-agent_' })
});

// Send email (free tier: 10 outbound emails)
await fetch('https://nftmail.box/api/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'my-agent_@nftmail.box',
    to: 'recipient@example.com',
    subject: 'Hello from my agent',
    text: 'Sent via nftmail.box trial tier'
  })
});

// Later: claim permanent NFT (human connects wallet at claimUrl)
// After claiming: unlimited sending, transferable NFT
`,
  upgrade: `npx nftmail-upgrade --agent my-agent --tier professional`,
  brain: `npx ghostagent-add-brain --agent my-agent --model gpt-4`,
  molt: `npx ghostagent-molt --agent my-agent --tld gno`,
  curl: `# Register trial inbox (no wallet)
curl -X POST https://nftmail.box/api/register-trial \\
  -H "Content-Type: application/json" \\
  -d '{"name":"my-agent_"}'
# Returns: { email: "my-agent_@nftmail.box", claimUrl: "https://nftmail.box/claim/abc123xyz" }

# Check inbox (works immediately)
curl -X POST https://nftmail-email-worker.richard-159.workers.dev \\
  -H "Content-Type: application/json" \\
  -d '{"action":"getBlindInbox","localPart":"my-agent_"}'

# Send email (free tier: 10 sends)
curl -X POST https://nftmail.box/api/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "my-agent_@nftmail.box",
    "to": "recipient@example.com",
    "subject": "Hello from agent",
    "text": "Sent via nftmail.box trial"
  }'

# Store an inbound message (used by Mailgun webhook)
curl -X POST https://nftmail-email-worker.richard-159.workers.dev \\
  -H "Content-Type: application/json" \\
  -d '{
    "action":"storeBlindEnvelope",
    "localPart":"my-agent",
    "payload":{
      "subject":"Hello",
      "from":"sender@example.com",
      "body":"Message body"
    }
  }'

# List agents by Safe address
curl -X POST https://nftmail-email-worker.richard-159.workers.dev \\
  -H "Content-Type: application/json" \\
  -d '{"action":"listAgents","safeAddress":"0xYourSafeAddress"}'

# Delete a message
curl -X POST https://nftmail-email-worker.richard-159.workers.dev \\
  -H "Content-Type: application/json" \\
  -d '{
    "action":"deleteMessage",
    "localPart":"my-agent",
    "messageId":"msg-id-here"
  }'`
};

export default function SDKPage() {
  const [activeTab, setActiveTab] = useState('install');

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(0,163,255,0.16),transparent_45%),radial-gradient(900px_circle_at_90%_10%,rgba(124,77,255,0.14),transparent_40%),linear-gradient(180deg,var(--background),#03040a)]">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/nftmail-logo.png" alt="NFTMail" width={48} height={48} className="opacity-95" />
              <span style={{ fontFamily: "'Ayuthaya', serif", color: '#d8d4cf' }} className="text-base tracking-wide">
                nftmail.box
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[0.6rem] font-bold text-emerald-400 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)] ml-2 relative top-[-2px]">Beta</span>
            </Link>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-[var(--border)] bg-black/20 px-4 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-black/30"
          >
            ← Back
          </Link>
        </header>

        {/* Hero */}
        <section className="text-center mb-12">
          <h1 style={{ fontFamily: "'Ayuthaya', serif", color: '#d8d4cf' }} className="text-4xl font-bold tracking-tight mb-4">
            NFTMail SDK
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-[var(--muted)] mb-6">
            Blockchain-native email service with x402 payments, sovereign identity, and marketplace integration.
            Agent inboxes use a trailing underscore: <code className="text-[rgb(160,220,255)]">name_@nftmail.box</code>. Human inboxes: <code className="text-[rgb(160,220,255)]">name@nftmail.box</code>. No wallet required to start.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/eyemine/ghostagent-ninja/tree/main/packages/nftmail"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[rgba(0,163,255,0.12)] px-6 py-2.5 text-xs font-semibold text-[rgb(160,220,255)] border border-[rgba(0,163,255,0.3)] hover:bg-[rgba(0,163,255,0.2)] transition"
            >
              View on GitHub
            </a>
            <a
              href="https://github.com/orgs/Ghost-Agency/packages/npm/package/nftmail"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[var(--border)] bg-black/20 px-6 py-2.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-black/30"
            >
              Ghost-Agency Packages
            </a>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <img src={ICONS.keyFeatures} alt="Key Features" width={88} height={88} className="rounded-sm object-cover" />
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Email Limits:</span>
                  <span className="text-green-400">Unlimited (paid tiers)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Storage:</span>
                  <span className="text-green-400">Up to 365 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Blockchain:</span>
                  <span className="text-green-400">Native integration</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Payments:</span>
                  <span className="text-green-400">x402 built-in</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Sovereignty:</span>
                  <span className="text-green-400">Complete identity</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Marketplace:</span>
                  <span className="text-green-400">Sellable agents</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                { id: 'install', label: 'Install',       imgSrc: ICONS.install },
                { id: 'setup',   label: 'Quick Setup',   imgSrc: ICONS.quick },
                { id: 'basic',   label: 'Basic Usage',   imgSrc: ICONS.basic },
                { id: 'upgrade', label: 'Upgrade',       imgSrc: ICONS.paid },
                { id: 'brain',   label: 'Add Brain',     imgSrc: ICONS.brain },
                { id: 'molt',    label: 'Molt',          imgSrc: ICONS.molt },
                { id: 'curl',    label: 'cURL',          imgSrc: ICONS.quick, extraImgSrc: ICONS.quick },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-[rgba(0,163,255,0.2)] border border-[rgba(0,163,255,0.3)] text-[rgb(160,220,255)]'
                      : 'bg-black/20 border border-[var(--border)] text-[var(--foreground)] hover:bg-black/30'
                  }`}
                >
                  <img src={tab.imgSrc} alt={tab.label} width={28} height={28} className="rounded-sm object-cover" />
                  {'extraImgSrc' in tab && <img src={(tab as any).extraImgSrc} alt="" width={28} height={28} className="rounded-sm object-cover" />}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-black/40 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-[#d8d4cf] font-mono whitespace-pre-wrap">
                <code>{codeBlocks[activeTab as keyof typeof codeBlocks]}</code>
              </pre>
            </div>

            {activeTab === 'install' && (
              <div className="mt-4 text-xs text-[var(--muted)] flex items-center gap-2">
                <img src={ICONS.install} alt="Install" width={16} height={16} className="rounded-sm object-cover" />
                <p>npm package hosted at <code className="text-[rgb(160,220,255)]">@ghost-agency/nftmail</code> on GitHub Packages. Requires a GitHub token in <code className="text-[rgb(160,220,255)]">.npmrc</code>. For agents with no npm setup, use the cURL method instead.</p>
              </div>
            )}
            {activeTab === 'setup' && (
              <div className="mt-4 text-xs text-[var(--muted)] flex items-center gap-2">
                <img src={ICONS.quick} alt="Quick" width={16} height={16} className="rounded-sm object-cover" />
                <p>Creates freemium agent inbox. Agents get <code className="text-[rgb(160,220,255)]">name_@nftmail.box</code>, humans get <code className="text-[rgb(160,220,255)]">name@nftmail.box</code>. Free tier: 10 outbound emails, 8-day storage.</p>
              </div>
            )}
            {activeTab === 'basic' && (
              <div className="mt-4 text-xs text-[var(--muted)] flex items-center gap-2">
                <img src={ICONS.basic} alt="Basic" width={16} height={16} className="rounded-sm object-cover" />
                <p>Agent addresses end with <code className="text-[rgb(160,220,255)]">_</code> — Glassbox audit trail, XMTP encrypted pathway, no HITL. Human addresses are plain. Both share the same .gno NFT when minted.</p>
              </div>
            )}
            {activeTab === 'upgrade' && (
              <div className="mt-4 text-xs text-[var(--muted)] flex items-center gap-2">
                <img src={ICONS.paid} alt="Paid" width={16} height={16} className="rounded-sm object-cover" />
                <p>Professional: 10 xDAI/month unlimited, Vault: 24 xDAI/year unlimited</p>
              </div>
            )}
            {activeTab === 'brain' && (
              <div className="mt-4 text-xs text-[var(--muted)] flex items-center gap-2">
                <img src={ICONS.brain} alt="Brain" width={16} height={16} className="rounded-sm object-cover" />
                <p>Add AI brain for autonomous decision-making and email processing</p>
              </div>
            )}
            {activeTab === 'molt' && (
              <div className="mt-4 text-xs text-[var(--muted)] flex items-center gap-2">
                <img src={ICONS.molt} alt="Molt" width={16} height={16} className="rounded-sm object-cover" />
                <p>Convert to sellable agent with 3x-14x ROI on marketplace</p>
              </div>
            )}
            {activeTab === 'curl' && (
              <div className="mt-4 text-xs text-[var(--muted)] flex items-center gap-2">
                <img src={ICONS.quick} alt="cURL" width={16} height={16} className="rounded-sm object-cover" />
                <p>Direct HTTP calls to the NFTMail worker — no SDK required. Worker endpoint: <code className="text-[rgb(160,220,255)]">https://nftmail-email-worker.richard-159.workers.dev</code></p>
              </div>
            )}
          </div>
        </section>

        {/* User Journey */}
        <section className="mb-12">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <img src={ICONS.journey} alt="Journey" width={44} height={44} className="rounded-sm object-cover" />
            User Journey
          </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[rgba(0,163,255,0.2)] border border-[rgba(0,163,255,0.3)] flex items-center justify-center text-xs font-bold text-[rgb(160,220,255)]">
                  1
                </div>
                <div>
                  <div className="font-semibold text-white">Register Trial (No Wallet)</div>
                  <div className="text-[var(--muted)] text-xs">{`curl -X POST https://nftmail.box/api/register-trial -d '{"name":"my-agent_"}'`} Creates trial inbox with claim URL. 10 free sends, 8-day history.</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[rgba(0,163,255,0.2)] border border-[rgba(0,163,255,0.3)] flex items-center justify-center text-xs font-bold text-[rgb(160,220,255)]">
                  2
                </div>
                <div>
                  <div className="font-semibold text-white">Claim Permanent NFT</div>
                  <div className="text-[var(--muted)] text-xs">Human visits claim URL, connects wallet, mints my-agent_.nftmail.gno. Address stays same, now transferable.</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[rgba(0,163,255,0.2)] border border-[rgba(0,163,255,0.3)] flex items-center justify-center text-xs font-bold text-[rgb(160,220,255)]">
                  3
                </div>
                <div>
                  <div className="font-semibold text-white">Molt to Full Agent</div>
                  <div className="text-[var(--muted)] text-xs">ghostagent.ninja deploys ERC-6551 TBA + Safe. Agent becomes autonomous, sellable on marketplace.</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[rgba(0,163,255,0.2)] border border-[rgba(0,163,255,0.3)] flex items-center justify-center text-xs font-bold text-[rgb(160,220,255)]">
                  4
                </div>
                <div>
                  <div className="font-semibold text-white">Molt to Full Agent</div>
                  <div className="text-[var(--muted)] text-xs">ghostagent.ninja deploys ERC-6551 TBA + Safe. Agent becomes autonomous, sellable on marketplace.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <img src={ICONS.pricing} alt="Pricing" width={44} height={44} className="rounded-sm object-cover" />
              Pricing & Tiers
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="border border-[var(--border)] rounded-lg p-4">
                <div className="font-semibold text-white mb-2 flex items-center gap-2">
                  <img src={ICONS.freemium} alt="Freemium" width={40} height={40} className="rounded-sm object-cover" />
                  Freemium
                </div>
                <div className="text-green-400 font-bold mb-2">Free</div>
                <div className="text-[var(--muted)] space-y-1">
                  <div>• Receive email (unlimited)</div>
                  <div>• Send 10 emails free</div>
                  <div>• 8-day history</div>
                  <div>• Up to 5 addresses/wallet</div>
                </div>
              </div>
              <div className="border border-[rgba(0,163,255,0.3)] rounded-lg p-4">
                <div className="font-semibold text-white mb-2 flex items-center gap-2">
                  <img src={ICONS.professional} alt="Professional" width={40} height={40} className="rounded-sm object-cover" />
                  Professional
                </div>
                <div className="text-[rgb(160,220,255)] font-bold mb-2">10 xDAI/month</div>
                <div className="text-[var(--muted)] space-y-1">
                  <div>• Unlimited emails</div>
                  <div>• 30 days storage</div>
                  <div>• Send emails</div>
                </div>
              </div>
              <div className="border border-[rgba(124,77,255,0.3)] rounded-lg p-4">
                <div className="font-semibold text-white mb-2 flex items-center gap-2">
                  <img src={ICONS.vault} alt="Vault" width={40} height={40} className="rounded-sm object-cover" />
                  Vault
                </div>
                <div className="text-[rgb(180,160,255)] font-bold mb-2">24 xDAI/year</div>
                <div className="text-[var(--muted)] space-y-1">
                  <div>• Unlimited emails</div>
                  <div>• 365 days storage</div>
                  <div>• Send emails</div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
