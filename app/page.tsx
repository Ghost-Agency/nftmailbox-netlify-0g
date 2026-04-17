'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let name = emailInput.trim().toLowerCase();
    if (name.endsWith('@nftmail.box')) {
      name = name.replace('@nftmail.box', '');
    }

    if (!name || !/^[a-z0-9._-]+$/.test(name)) {
      setError('Enter a valid name — e.g. alice.ops or agent_molt');
      return;
    }

    router.push(`/inbox/${encodeURIComponent(name)}`);
  };

  return (
    <div className="min-h-screen bg-[#020205] relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(0,163,255,0.15)_0%,transparent_60%)] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(124,77,255,0.12)_0%,transparent_60%)] blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.05)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-12 px-4 py-10 md:px-6">

        {/* Header */}
        <header className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur group-hover:opacity-40 transition duration-500"></div>
              <Image src="/nftmail-logo.png" alt="NFTMail" width={42} height={42} className="relative opacity-95 transition-transform duration-300 group-hover:scale-105" />
            </div>
            <span className="flex items-center gap-2">
              <span style={{ fontFamily: "'Ayuthaya', serif" }} className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 drop-shadow-md">nftmail.box</span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[0.6rem] font-bold text-emerald-400 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">Beta</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://ghostagent.ninja"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "'Ayuthaya', serif" }}
              className="group relative overflow-hidden rounded-full border border-[rgba(220,40,40,0.3)] bg-black/40 px-5 py-2 text-xs font-semibold tracking-wide text-gray-300 transition-all hover:text-white hover:border-[rgba(220,40,40,0.6)] shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] backdrop-blur-sm"
            >
              <div className="absolute inset-0 w-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 transition-all duration-300 ease-out group-hover:w-full"></div>
              <span className="relative">GHOSTAGENT.NINJA</span>
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="text-center w-full flex flex-col items-center animate-fade-in-up mt-8">
          <h1 style={{ fontFamily: "'Ayuthaya', serif" }} className="text-5xl md:text-6xl font-bold tracking-tight flex items-center justify-center gap-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-2xl">
            nftmail.box
            <span className="rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/40 px-3 py-1 text-[0.8rem] font-bold text-emerald-300 uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-2">Beta</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-sm text-gray-400 leading-relaxed md:text-base">
            Claim a free, sovereign email inbox. <br/> No credit card. No personal data. Protocol natively built for 0G.
          </p>
        </section>

        {/* Content Grid */}
        <div className="grid w-full gap-8 md:grid-cols-2 mt-4">
          
          {/* Access Inbox & Dashboard */}
          <section className="group w-full translate-y-0 hover:-translate-y-1 transition-transform duration-300">
            <div className="relative h-full rounded-2xl border border-white/5 bg-black/40 p-8 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
               <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
              
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Access Platform
              </h2>
              
              <Link 
                href="/dashboard" 
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/30 px-5 py-4 text-sm font-bold text-blue-300 transition-all hover:bg-blue-500/20 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] mb-2"
              >
                Go To Dashboard ↗
              </Link>

              <div className="flex items-center justify-center gap-4 my-6">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">OR CHECK AN INBOX</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>

              <form onSubmit={handleLookup} className="flex flex-col gap-4 mb-2 flex-grow">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value.toLowerCase());
                      setError('');
                    }}
                    placeholder="yourname"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 pr-28 text-sm text-white placeholder-gray-500 outline-none focus:border-[rgba(0,163,255,0.5)] focus:bg-white/10 focus:ring-1 focus:ring-[rgba(0,163,255,0.3)] transition-all shadow-inner"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-500">
                    @nftmail.box
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-5 py-3.5 text-sm font-semibold text-gray-400 transition-all hover:bg-white/10 hover:text-white"
                >
                  Unlock →
                </button>
              </form>
              {error && <p className="mb-0 text-xs font-mono text-red-400 bg-red-400/10 p-2 rounded-lg border border-red-400/20">{error}</p>}
              
            </div>
          </section>

          {/* Primary CTA — claim inbox */}
          <section className="group w-full translate-y-0 hover:-translate-y-1 transition-transform duration-300">
            <div className="relative h-full rounded-2xl border border-emerald-500/20 bg-black/40 p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.05)] overflow-hidden flex flex-col">
               <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-emerald-500/10 blur-[60px] pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2"></div>
               <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

              <div className="flex items-center gap-2 mb-6">
                <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">Zero Wallet Required</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Claim Your Namespace</h2>
              <p className="text-xs text-gray-400 mb-8 leading-relaxed">
                Secure your handle permanently. Your new universal address will be <span className="text-emerald-300 font-mono font-bold tracking-tight bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">you@nftmail.box</span>
              </p>
              
              <div className="flex flex-col gap-4 mb-6 flex-grow">
                <a
                  href="/nftmail"
                  className="relative w-full overflow-hidden rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-3.5 text-sm font-bold text-emerald-400 text-center transition-all hover:bg-emerald-500/20 hover:border-emerald-400/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] group/btn"
                >
                  <div className="absolute inset-0 w-full translate-x-[-100%] bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent transition-transform duration-500 group-hover/btn:translate-x-[100%]"></div>
                  Start For Free →
                </a>
                <a
                  href="/sdk"
                  className="w-full text-center rounded-xl border border-white/5 bg-transparent px-4 py-3 text-xs font-semibold text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  Developers API / SDK ↗
                </a>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-white/5 mt-auto">
                {[
                  { icon: '✓', label: 'Receive email', color: 'text-gray-300' },
                  { icon: '✓', label: 'Send free', color: 'text-gray-300' },
                  { icon: '✓', label: 'Sovereign', color: 'text-gray-300' }
                ].map((item) => (
                  <span key={item.label} className={`text-[10px] font-medium ${item.color} flex items-center gap-1.5`}>
                    <span className="text-emerald-500 mr-0.5">{item.icon}</span> 
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </section>

        </div>
        
        <footer className="text-center w-full mt-8 flex flex-col items-center gap-5 border-t border-white/5 pt-10 pb-4">
          <p className="text-[10px] text-gray-500 max-w-lg leading-relaxed">
             * Free tier trial generated via <code className="bg-white/5 px-1 rounded text-gray-400 font-mono">cURL</code> or <code className="bg-white/5 px-1 rounded text-gray-400 font-mono">npx</code>. Immutable permanent inbox requires .0g namespace mint.
          </p>
          <div className="flex items-center gap-4 text-[10px] font-semibold text-gray-500">
            <a href="/terms" className="hover:text-gray-300 transition-colors">Terms of Protocol</a>
            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
            <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Notice</a>
            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
            <span className="text-gray-600">© 2026 Ghost Agent Pty Ltd</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
