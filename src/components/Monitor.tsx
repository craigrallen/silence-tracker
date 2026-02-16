import { useAudio } from '../useAudio';

const levelColors = {
  silent: '#C5A55A',
  quiet: '#8B9A6B',
  moderate: '#D4915E',
  loud: '#C46B6B',
};

const levelLabels = {
  silent: 'Silent',
  quiet: 'Quiet',
  moderate: 'Moderate',
  loud: 'Loud',
};

export function Monitor() {
  const { isListening, currentDb, level, start, stop } = useAudio();

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const dbNorm = Math.min(currentDb / 100, 1);
  const offset = circumference * (1 - dbNorm);

  return (
    <section className="flex flex-col items-center space-y-6">
      {/* dB ring */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#F0F0F0" strokeWidth="6" />
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={isListening ? levelColors[level] : '#E0E0E0'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isListening ? offset : circumference}
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extralight text-neutral-800">
            {isListening ? currentDb : '—'}
          </span>
          <span className="text-[10px] tracking-widest text-neutral-400 uppercase mt-1">
            {isListening ? levelLabels[level] : 'dB'}
          </span>
        </div>
      </div>

      {/* Start/Stop */}
      <button
        onClick={isListening ? stop : start}
        className={`w-14 h-14 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${
          isListening
            ? 'border-[#C5A55A] bg-[#C5A55A]/10'
            : 'border-neutral-300 hover:border-[#C5A55A]'
        }`}
        style={isListening ? { animation: 'pulse-ring 3s ease-in-out infinite' } : {}}
      >
        <div className={`w-4 h-4 rounded-sm transition-all ${
          isListening ? 'bg-[#C5A55A]' : 'bg-neutral-400 rounded-full'
        }`} />
      </button>
      <p className="text-[10px] text-neutral-400 tracking-widest uppercase">
        {isListening ? 'Listening' : 'Tap to begin'}
      </p>
    </section>
  );
}
