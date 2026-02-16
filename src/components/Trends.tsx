import { getLast7Days, getHourlyHeatmap, getAllDays } from '../store';

export function Trends() {
  const days = getLast7Days();
  const heatmap = getHourlyHeatmap();
  const allDays = getAllDays();
  const maxMin = Math.max(...days.map(d => d.totalSilentMs / 60000), 1);

  // Mood/sleep correlation
  const withCheckIn = allDays.filter(d => d.checkIn && d.totalSilentMs > 0);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayOfWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    return dayLabels[(d.getDay() + 6) % 7]; // Mon=0
  };

  const heatColor = (db: number) => {
    if (db < 0) return '#F5F5F5';
    if (db < 30) return '#C5A55A';
    if (db < 45) return '#E8D5A0';
    if (db < 60) return '#E8E0D0';
    return '#D4D4D4';
  };

  return (
    <div className="space-y-12">
      {/* Weekly bar chart */}
      <section className="space-y-4">
        <h2 className="text-[10px] tracking-[0.3em] text-neutral-400 uppercase text-center">This Week</h2>
        <div className="flex items-end justify-center gap-2 h-32">
          {days.map((d, i) => {
            const min = d.totalSilentMs / 60000;
            const h = Math.max((min / maxMin) * 100, 2);
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-neutral-400">{Math.round(min)}m</span>
                <div
                  className="w-6 rounded-sm transition-all bg-[#C5A55A]/60"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-neutral-400">{dayOfWeek(d.date)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hourly heatmap */}
      <section className="space-y-4">
        <h2 className="text-[10px] tracking-[0.3em] text-neutral-400 uppercase text-center">Hourly Heatmap</h2>
        <div className="overflow-x-auto">
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: `auto repeat(24, 1fr)` }}>
            <div />
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="text-[7px] text-neutral-400 text-center">{i}</div>
            ))}
            {heatmap.map((row, ri) => (
              <>
                <div key={`l${ri}`} className="text-[8px] text-neutral-400 pr-1 flex items-center">
                  {dayOfWeek((() => { const d = new Date(); d.setDate(d.getDate() - (6 - ri)); return d.toISOString().slice(0, 10); })())}
                </div>
                {row.map((db, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    className="w-full aspect-square rounded-[2px]"
                    style={{ backgroundColor: heatColor(db) }}
                    title={db >= 0 ? `${Math.round(db)} dB` : 'No data'}
                  />
                ))}
              </>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-3 text-[8px] text-neutral-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#C5A55A]" /> Silent</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#E8D5A0]" /> Quiet</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#E8E0D0]" /> Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#D4D4D4]" /> Loud</span>
        </div>
      </section>

      {/* Mood/Sleep correlation */}
      {withCheckIn.length > 0 && (
        <section className="space-y-4 text-center">
          <h2 className="text-[10px] tracking-[0.3em] text-neutral-400 uppercase">Silence & Well-being</h2>
          <div className="space-y-2">
            {withCheckIn.slice(-7).map(d => {
              const min = Math.round(d.totalSilentMs / 60000);
              return (
                <div key={d.date} className="flex items-center justify-center gap-4 text-xs text-neutral-600">
                  <span className="w-16 text-right text-neutral-400">{d.date.slice(5)}</span>
                  <span className="w-12">{min}m</span>
                  <span>mood {d.checkIn!.mood}/5</span>
                  <span>sleep {d.checkIn!.sleep}/5</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
