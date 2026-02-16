import { getAchievements } from '../store';

const ALL_ACHIEVEMENTS = [
  '🤫 First minute of silence',
  '🕐 First hour of silence!',
  '🏔️ 5 hours of total silence',
  '🌙 24 hours of lifetime silence',
  '🔥 3-day streak!',
  '⭐ 7-day streak!',
  '👑 30-day streak!',
  '📝 First check-in',
  '📊 Week of check-ins',
  '🎯 30-minute daily goal hit!',
  '🧘 60 minutes in one day',
];

export function Achievements() {
  const unlocked = getAchievements();

  return (
    <section className="space-y-6">
      <h2 className="text-[10px] tracking-[0.3em] text-neutral-400 uppercase text-center">Achievements</h2>
      <div className="space-y-3">
        {ALL_ACHIEVEMENTS.map(a => {
          const isUnlocked = unlocked.includes(a);
          return (
            <div
              key={a}
              className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${
                isUnlocked ? 'bg-[#C5A55A]/5' : 'opacity-25'
              }`}
            >
              <span className="text-lg">{a.split(' ')[0]}</span>
              <span className={`text-sm ${isUnlocked ? 'text-neutral-700' : 'text-neutral-400'}`}>
                {a.split(' ').slice(1).join(' ')}
              </span>
              {isUnlocked && <span className="ml-auto text-[#C5A55A] text-xs">✓</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
