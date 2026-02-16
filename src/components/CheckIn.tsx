import { useState, useEffect } from 'react';
import { saveCheckIn, getDay, today } from '../store';

export function CheckIn() {
  const [mood, setMood] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const day = getDay(today());
    if (day.checkIn) {
      setMood(day.checkIn.mood);
      setSleep(day.checkIn.sleep);
      setSaved(true);
    }
  }, []);

  const submit = () => {
    if (mood && sleep) {
      saveCheckIn({ date: today(), mood, sleep });
      setSaved(true);
    }
  };

  const Dots = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-2">
      <span className="text-[10px] tracking-[0.2em] text-neutral-400 uppercase">{label}</span>
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map(v => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`w-8 h-8 rounded-full border transition-all text-xs ${
              v <= value
                ? 'border-[#C5A55A] bg-[#C5A55A]/20 text-[#C5A55A]'
                : 'border-neutral-200 text-neutral-300'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section className="text-center space-y-6 py-4">
      <h2 className="text-[10px] tracking-[0.3em] text-neutral-400 uppercase">Evening Check-in</h2>
      <div className="space-y-5">
        <Dots value={mood} onChange={setMood} label="Mood" />
        <Dots value={sleep} onChange={setSleep} label="Sleep Quality" />
      </div>
      {!saved ? (
        <button
          onClick={submit}
          disabled={!mood || !sleep}
          className="text-xs tracking-widest uppercase text-[#C5A55A] border border-[#C5A55A]/30 px-6 py-2 rounded-full hover:bg-[#C5A55A]/5 transition disabled:opacity-30"
        >
          Save
        </button>
      ) : (
        <p className="text-[10px] text-[#C5A55A] tracking-widest">✓ Saved</p>
      )}
    </section>
  );
}
