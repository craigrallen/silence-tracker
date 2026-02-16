import { useState } from 'react';
import { Monitor } from './components/Monitor';
import { DailyScore } from './components/DailyScore';
import { Trends } from './components/Trends';
import { CheckIn } from './components/CheckIn';
import { Achievements } from './components/Achievements';
import { SilenceWindows } from './components/SilenceWindows';

type Tab = 'home' | 'trends' | 'achievements';

export default function App() {
  const [tab, setTab] = useState<Tab>('home');

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center">
        <h1 className="text-2xl font-light tracking-[0.2em] text-neutral-800 uppercase">
          Silence
        </h1>
        <p className="text-xs text-neutral-400 mt-1 tracking-widest">tracker</p>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-6 space-y-10">
        {tab === 'home' && (
          <>
            <Monitor />
            <DailyScore />
            <SilenceWindows />
            <CheckIn />
          </>
        )}
        {tab === 'trends' && <Trends />}
        {tab === 'achievements' && <Achievements />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-neutral-100">
        <div className="max-w-md mx-auto flex justify-around py-3">
          {(['home', 'trends', 'achievements'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs tracking-wider uppercase transition-colors ${
                tab === t ? 'text-[#C5A55A]' : 'text-neutral-400'
              }`}
            >
              {t === 'home' ? '◉' : t === 'trends' ? '◫' : '★'}
              <span className="block mt-0.5">{t}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
