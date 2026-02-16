import { getQuietestHours } from '../store';

export function SilenceWindows() {
  const hours = getQuietestHours();

  if (hours.length === 0) return null;

  const fmt = (h: number) => {
    const suffix = h >= 12 ? 'pm' : 'am';
    const hr = h % 12 || 12;
    return `${hr}${suffix}`;
  };

  return (
    <section className="text-center space-y-3">
      <h2 className="text-[10px] tracking-[0.3em] text-neutral-400 uppercase">Quietest Times</h2>
      <div className="flex justify-center gap-6">
        {hours.map(h => (
          <div key={h} className="flex flex-col items-center">
            <span className="text-lg font-extralight text-neutral-700">{fmt(h)}</span>
            <span className="text-[9px] text-neutral-400">–{fmt(h + 1)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
