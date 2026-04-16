'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createWalletClient, createPublicClient, custom, http, encodeFunctionData, decodeEventLog, namehash } from 'viem';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { gnosis, BRAIN_MODULE, GHOST_REGISTRY } from '../utils/chains';
import BrainModuleABI from '../abi/BrainModule.json';
import GhostRegistryABI from '../abi/GhostRegistry.json';
import { useSFX } from '../hooks/useSFX';

interface MoltToAgentProps {
  agentName: string;
  tbaAddress: string;
  email: string;
}

type MoltStep = 'idle' | 'deploying-safe' | 'installing-brain' | 'awakening' | 'done' | 'error';

interface MoltResult {
  safeAddress?: string;
  brainTxHash?: string;
  awakenTxHash?: string;
}

const zeroG = {
  id: 16602,
  name: '0G Newton Testnet',
  network: 'zero-g-newton',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
    public: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
};

const ERC6551_REGISTRY = '0x000000006551c19487814612e58FE06813775758';
const ACCOUNT_IMPL = '0xD21134524F02F5FbA2d83891C1EE0b60943E1d47';
const SPACEID_REGISTRY = process.env.NEXT_PUBLIC_SPACEID_0G_REGISTRY || '0x0000000000000000000000000000000000000000';

export function MoltToAgent({ agentName, tbaAddress, email }: MoltToAgentProps) {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [step, setStep] = useState<MoltStep>('idle');
  const [result, setResult] = useState<MoltResult>({});
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { playClick, playMoltSequence, playSuccess } = useSFX();
  const [glitchText, setGlitchText] = useState('Installing Brain...');

  // Glitch effect hook for installing step
  useEffect(() => {
    if (step === 'installing-brain') {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
      const timer = setInterval(() => {
        let newText = '';
        const base = 'Neural Synapse ';
        for(let i=0; i<4; i++) {
            newText += chars[Math.floor(Math.random() * chars.length)];
        }
        setGlitchText(base + newText);
      }, 80);
      return () => clearInterval(timer);
    }
  }, [step]);

  const steps: { key: MoltStep; label: string }[] = [
    { key: 'deploying-safe', label: agentName.endsWith('.0g') ? 'Deploy 0G TBA' : 'Deploy Safe' },
    { key: 'installing-brain', label: 'Install Brain' },
    { key: 'awakening', label: 'Awaken Agent' },
  ];

  const currentIndex = steps.findIndex(s => s.key === step);

  const molt = useCallback(async () => {
    if (!authenticated || wallets.length === 0) {
      setError('Connect your wallet first');
      return;
    }
    if (!tbaAddress) {
      setError(`Mint your ${agentName.endsWith('.0g') ? '.0g' : 'nftmail.gno'} identity first`);
      return;
    }

    setStep('deploying-safe');
    setError(null);
    setResult({});
    playMoltSequence();

    try {
      const wallet = wallets[0];
      const is0G = agentName.endsWith('.0g');

      if (is0G) {
        // --- 0G CHAIN FLOW ---
        await wallet.switchChain(zeroG.id);
        const provider = await wallet.getEthereumProvider();

        const walletClient = createWalletClient({
          chain: zeroG as any,
          transport: custom(provider),
          account: wallet.address as `0x${string}`,
        });

        const publicClient = createPublicClient({
          chain: zeroG as any,
          transport: http(),
        });

        // namehash gives a hex string, which can be easily cast to BigInt for tokenIds
        const tokenId = BigInt(namehash(agentName));

        const createAccountHash = await walletClient.writeContract({
          account: wallet.address as `0x${string}`,
          chain: zeroG as any,
          address: ERC6551_REGISTRY,
          abi: [{
            name: 'createAccount',
            type: 'function',
            inputs: [
              { name: 'implementation', type: 'address' },
              { name: 'salt', type: 'bytes32' },
              { name: 'chainId', type: 'uint256' },
              { name: 'tokenContract', type: 'address' },
              { name: 'tokenId', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'address' }],
            stateMutability: 'nonpayable',
          }],
          functionName: 'createAccount',
          args: [
            ACCOUNT_IMPL as `0x${string}`,
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            BigInt(zeroG.id),
            SPACEID_REGISTRY as `0x${string}`,
            tokenId,
          ],
        });

        await publicClient.waitForTransactionReceipt({ hash: createAccountHash });

        const computedAddress = await publicClient.readContract({
          address: ERC6551_REGISTRY,
          abi: [{
            name: 'account',
            type: 'function',
            inputs: [
              { name: 'implementation', type: 'address' },
              { name: 'salt', type: 'bytes32' },
              { name: 'chainId', type: 'uint256' },
              { name: 'tokenContract', type: 'address' },
              { name: 'tokenId', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'address' }],
            stateMutability: 'view',
          }],
          functionName: 'account',
          args: [
            ACCOUNT_IMPL as `0x${string}`,
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            BigInt(zeroG.id),
            SPACEID_REGISTRY as `0x${string}`,
            tokenId,
          ]
        });

        setResult(prev => ({ ...prev, safeAddress: computedAddress as string }));
        setStep('done');
        playSuccess();
        setShowModal(true);
        return;

      } else {
        // --- GNOSIS CHAIN FLOW ---
        await wallet.switchChain(gnosis.id);
        const provider = await wallet.getEthereumProvider();

        const walletClient = createWalletClient({
          chain: gnosis,
          transport: custom(provider),
          account: wallet.address as `0x${string}`,
        });

        const publicClient = createPublicClient({
          chain: gnosis,
          transport: http(),
        });

        const registerHash = await walletClient.writeContract({
          account: wallet.address as `0x${string}`,
          chain: gnosis,
          address: GHOST_REGISTRY,
          abi: GhostRegistryABI,
          functionName: 'register',
          args: [agentName, wallet.address as `0x${string}`],
        });

        const registerReceipt = await publicClient.waitForTransactionReceipt({ hash: registerHash });

        let safeAddress: string | undefined;
        for (const log of registerReceipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: GhostRegistryABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === 'Registered') {
              safeAddress = (decoded.args as any).safe;
            }
          } catch {}
        }

        if (!safeAddress) {
          throw new Error('Safe address not found in Registered event');
        }

        setResult(prev => ({ ...prev, safeAddress }));

        setStep('installing-brain');

        const enableData = encodeFunctionData({
          abi: [{
            name: 'enableModule',
            type: 'function',
            inputs: [{ name: 'module', type: 'address' }],
            outputs: [],
            stateMutability: 'nonpayable',
          }],
          functionName: 'enableModule',
          args: [BRAIN_MODULE],
        });

        const brainHash = await walletClient.writeContract({
          account: wallet.address as `0x${string}`,
          chain: gnosis,
          address: safeAddress as `0x${string}`,
          abi: [{
            name: 'execTransaction',
            type: 'function',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'value', type: 'uint256' },
              { name: 'data', type: 'bytes' },
              { name: 'operation', type: 'uint8' },
              { name: 'safeTxGas', type: 'uint256' },
              { name: 'baseGas', type: 'uint256' },
              { name: 'gasPrice', type: 'uint256' },
              { name: 'gasToken', type: 'address' },
              { name: 'refundReceiver', type: 'address' },
              { name: 'signatures', type: 'bytes' },
            ],
            outputs: [{ name: 'success', type: 'bool' }],
            stateMutability: 'nonpayable',
          }],
          functionName: 'execTransaction',
          args: [
            safeAddress as `0x${string}`,
            BigInt(0),
            enableData,
            0,
            BigInt(0),
            BigInt(0),
            BigInt(0),
            '0x0000000000000000000000000000000000000000' as `0x${string}`,
            '0x0000000000000000000000000000000000000000' as `0x${string}`,
            ('0x' + '0'.repeat(130)) as `0x${string}`,
          ],
        });

        await publicClient.waitForTransactionReceipt({ hash: brainHash });
        setResult(prev => ({ ...prev, brainTxHash: brainHash }));

        setStep('awakening');

        const awakenHash = await walletClient.writeContract({
          account: wallet.address as `0x${string}`,
          chain: gnosis,
          address: BRAIN_MODULE,
          abi: BrainModuleABI,
          functionName: 'awaken',
          args: [safeAddress as `0x${string}`, agentName],
        });

        await publicClient.waitForTransactionReceipt({ hash: awakenHash });
        setResult(prev => ({ ...prev, awakenTxHash: awakenHash }));

        setStep('done');
        playSuccess();
        setShowModal(true);
      }
    } catch (err: any) {
      console.error('Molt failed:', err);
      setError(err?.shortMessage || err?.message || 'Molt failed');
      setStep('error');
    }
  }, [authenticated, wallets, agentName, tbaAddress, playMoltSequence, playSuccess]);

  if (!authenticated) return null;

  return (
    <>
      <div className="space-y-4 relative">
        
        <AnimatePresence>
          {step === 'installing-brain' && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.15 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 pointer-events-none rounded-xl bg-[linear-gradient(rgba(16,185,129,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.5)_1px,transparent_1px)] bg-[size:20px_20px]" 
            />
          )}
        </AnimatePresence>

        {/* What you get */}
        <div className="grid grid-cols-3 gap-3 relative z-10">
          <motion.div whileHover={{ scale: 1.02 }} onHoverStart={playClick} className="rounded-xl border border-[var(--border)] bg-black/40 backdrop-blur-md px-3 py-3 text-center transition-colors hover:border-[rgb(160,220,255)]">
            <div className="text-lg font-bold text-[rgb(160,220,255)]">{agentName.endsWith('.0g') ? '0G TBA' : 'Safe'}</div>
            <p className="mt-1 text-[10px] text-[var(--muted)]">Sovereign Vault — multi-sig treasury</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} onHoverStart={playClick} className="rounded-xl border border-[var(--border)] bg-black/40 backdrop-blur-md px-3 py-3 text-center transition-colors hover:border-violet-300">
            <div className="text-lg font-bold text-violet-300">Brain</div>
            <p className="mt-1 text-[10px] text-[var(--muted)]">Core logic — autonomous execution</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} onHoverStart={playClick} className="rounded-xl border border-[var(--border)] bg-black/40 backdrop-blur-md px-3 py-3 text-center transition-colors hover:border-emerald-300">
            <div className="text-lg font-bold text-emerald-300">A2A</div>
            <p className="mt-1 text-[10px] text-[var(--muted)]">Agent-to-agent email wire</p>
          </motion.div>
        </div>

        {/* Progress steps */}
        {step !== 'idle' && step !== 'error' && (
          <div className="flex items-center gap-2 relative z-10">
            {steps.map((s, i) => {
              if (agentName.endsWith('.0g') && i > 0) return null; // 0G skips brain/awakening for now
              return (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  i < currentIndex || step === 'done'
                    ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : i === currentIndex
                    ? 'bg-amber-500/20 text-amber-300 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-white/5 text-[var(--muted)]'
                }`}>
                  {i < currentIndex || step === 'done' ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-mono font-bold tracking-tight ${
                  i < currentIndex || step === 'done'
                    ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                    : i === currentIndex
                    ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : 'text-[var(--muted)]'
                }`}>
                  {i === currentIndex && step === 'installing-brain' ? glitchText : s.label}
                </span>
                {!(agentName.endsWith('.0g') && i === 0) && i < steps.length - 1 && <span className="text-[var(--muted)]">→</span>}
              </div>
            )})}
          </div>
        )}

        {/* Molt button */}
        <motion.button
          onClick={molt}
          whileHover={step === 'idle' ? { scale: 1.01, backgroundColor: 'rgba(245,158,11,0.15)' } : {}}
          whileTap={step === 'idle' ? { scale: 0.98 } : {}}
          onHoverStart={step === 'idle' ? playClick : undefined}
          disabled={step !== 'idle' && step !== 'error' && step !== 'done'}
          className="relative z-10 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 px-5 py-3.5 text-sm font-semibold text-amber-200 transition-all hover:shadow-[0_0_24px_rgba(245,158,11,0.2)] disabled:cursor-not-allowed disabled:opacity-80 overflow-hidden"
        >
           {step === 'deploying-safe' || step === 'installing-brain' || step === 'awakening' ? (
            <motion.div 
               className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" 
               initial={{ x: '-100%' }}
               animate={{ x: '100%' }}
               transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          ) : null}

          {step === 'idle' || step === 'error' ? (
            <>
              <svg className="h-4 w-4 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              Initiate Genesis Molt
            </>
          ) : step === 'done' ? (
            <>
              <svg className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Agent Awakened
            </>
          ) : (
            <>
              <svg className="h-4 w-4 animate-spin text-amber-300 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4m0 12v4m-7.07-3.93 2.83-2.83m8.48-8.48 2.83 2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83" />
              </svg>
              <span className="text-amber-300 font-mono tracking-widest">{step === 'deploying-safe' ? 'CONSTRUCTING VAULT...' : step === 'installing-brain' ? 'FORMATTING NEURAL NET...' : 'AWAKENING...'}</span>
            </>
          )}
        </motion.button>

        {error && <p className="text-center text-xs text-red-400 font-mono bg-red-500/10 py-2 border border-red-500/20 rounded">{error}</p>}

        {/* Pathway diagram */}
        <div className="rounded-xl border border-[var(--border)] bg-black/40 backdrop-blur-md px-4 py-3 relative z-10">
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
            <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-300 font-mono">{agentName.endsWith('.0g') ? '.0g' : 'nftmail.gno'}</span>
            <span>→</span>
            {agentName.endsWith('.0g') ? (
              <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-violet-300 font-mono">+ 0G TBA</span>
            ) : (
             <>
              <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-violet-300 font-mono">+ Safe</span>
              <span>→</span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-amber-300 font-mono">+ Brain</span>
             </>
            )}
            <span>→</span>
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-300 font-mono shadow-[0_0_8px_rgba(16,185,129,0.2)]">Full Agent</span>
          </div>
          <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
            Same NFT, same email — your namespace identity evolves into a full autonomous agent.
          </p>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: -10 }}
              transition={{ type: 'spring', stiffness: 250, damping: 20 }}
              style={{ transformPerspective: 1000 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-[rgba(16,185,129,0.3)] bg-gradient-to-b from-gray-900 to-black shadow-[0_0_50px_rgba(16,185,129,0.15)]"
            >
              <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-emerald-500/20 px-6 py-6 border-b border-[rgba(255,255,255,0.05)]">
                 <motion.div 
                   animate={{ opacity: [0.3, 0.6, 0.3] }} 
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" 
                 />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                    <svg className="h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">Agent Genesis Complete</h3>
                    <p className="text-sm font-mono text-[var(--muted)]">{agentName} is fully autonomous.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-6 py-6 bg-black/50">
                {result.safeAddress && (
                  <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold tracking-widest text-[var(--muted)] uppercase border-l-2 border-[rgb(160,220,255)] pl-2">{agentName.endsWith('.0g') ? '0G TBA PROXY' : 'GNOSIS SAFE'}</span>
                    <div className="flex items-center gap-2 pl-2">
                      <code className="break-all text-sm font-bold text-[rgb(160,220,255)] drop-shadow-[0_0_5px_rgba(160,220,255,0.4)]">{result.safeAddress}</code>
                    </div>
                  </motion.div>
                )}

                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-widest text-[var(--muted)] uppercase border-l-2 border-emerald-500 pl-2">ENCRYPTED INBOX</span>
                  <code className="text-sm font-bold text-emerald-300 drop-shadow-[0_0_5px_rgba(16,185,129,0.4)] pl-2">{email}</code>
                </motion.div>

                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-widest text-[var(--muted)] uppercase border-l-2 border-amber-500 pl-2">IDENTITY ANCHOR</span>
                  <code className="break-all text-xs font-bold text-amber-200/70 pl-2">{tbaAddress}</code>
                </motion.div>

                {result.awakenTxHash && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <a
                      href={`https://gnosisscan.io/tx/${result.awakenTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[rgb(160,220,255)] hover:underline flex items-center justify-center border border-[rgb(160,220,255)]/20 p-2 rounded-lg bg-[rgb(160,220,255)]/5"
                    >
                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      Verify On-Chain
                    </a>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.05)] bg-[#050505] px-6 py-4">
                <a
                  href="/dashboard"
                  onMouseEnter={playClick}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-xs font-bold font-mono tracking-wide text-emerald-400 transition-all hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  SYSTEM DASHBOARD
                </a>
                <button
                  onClick={() => setShowModal(false)}
                  onMouseEnter={playClick}
                  className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-5 py-2.5 text-xs font-bold tracking-wide text-[var(--muted)] transition-all hover:text-white hover:bg-[rgba(255,255,255,0.1)] gap-2"
                >
                  DISMISS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
