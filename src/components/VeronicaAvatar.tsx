import React, { useEffect, useState } from 'react';

interface VeronicaAvatarProps {
  mood: 'happy' | 'neutral' | 'worried' | 'angry';
  isSpeaking: boolean;
  isListening: boolean;
  subtitle: string;
}

export default function VeronicaAvatar({
  mood,
  isSpeaking,
  isListening,
  subtitle,
}: VeronicaAvatarProps) {
  const [blink, setBlink] = useState(false);

  // Periodic blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Determine colors and visual factors based on mood
  const getThemeColors = () => {
    switch (mood) {
      case 'happy':
        return {
          halo: 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
          spinHalo: 'border-t-2 border-emerald-400/60',
          faceBg: 'from-emerald-400/20 to-pink-500/20',
          auraColor: 'bg-emerald-500/10',
          blush: 'bg-pink-400/40',
          eyeColor: '#10B981', // emerald
          cheekSmile: true,
        };
      case 'worried':
        return {
          halo: 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
          spinHalo: 'border-t-2 border-amber-400/60',
          faceBg: 'from-amber-400/20 to-pink-500/20',
          auraColor: 'bg-amber-500/10',
          blush: 'bg-pink-400/20',
          eyeColor: '#F59E0B', // amber
          cheekSmile: false,
        };
      case 'angry':
        return {
          halo: 'border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.3)]',
          spinHalo: 'border-t-2 border-rose-500/80 animate-[spin_2s_linear_infinite]',
          faceBg: 'from-rose-500/30 to-pink-600/30',
          auraColor: 'bg-rose-500/20',
          blush: 'bg-rose-400/60',
          eyeColor: '#EF4444', // red/rose
          cheekSmile: false,
        };
      case 'neutral':
      default:
        return {
          halo: 'border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
          spinHalo: 'border-t-2 border-cyan-400/60',
          faceBg: 'from-cyan-400/20 to-pink-500/20',
          auraColor: 'bg-cyan-500/10',
          blush: 'bg-pink-400/30',
          eyeColor: '#06B6D4', // cyan
          cheekSmile: true,
        };
    }
  };

  const theme = getThemeColors();

  return (
    <div className="flex flex-col items-center justify-center relative w-full select-none">
      {/* Immersive Holographic Halos */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Outer Halo */}
        <div
          className={`absolute w-80 h-80 border rounded-full animate-[spin_15s_linear_infinite] transition-all duration-500 ${theme.halo}`}
        />
        {/* Inner Counter-spinning Halo */}
        <div
          className={`absolute w-[290px] h-[290px] border border-dashed border-white/10 rounded-full animate-[spin_8s_linear_infinite_reverse]`}
        />
        {/* Mood-colored Spin Halo */}
        <div
          className={`absolute w-72 h-72 rounded-full animate-[spin_4s_linear_infinite] transition-all duration-500 ${theme.spinHalo}`}
        />

        {/* Listening Ring Indicator */}
        {isListening && (
          <div className="absolute w-[330px] h-[330px] border-2 border-cyan-400 rounded-full animate-ping opacity-60" />
        )}

        {/* Veronica Visual Character Concept */}
        <div
          className={`z-20 w-52 h-52 rounded-full border-2 border-white/20 overflow-hidden relative backdrop-blur-md bg-gradient-to-b ${theme.faceBg} transition-all duration-500 group cursor-pointer`}
          id="veronica-face-canvas"
        >
          {/* Pulsing Aura */}
          <div className={`absolute inset-0 transition-all duration-500 ${theme.auraColor} ${isSpeaking ? 'animate-pulse' : ''}`} />

          {/* SVG Character illustration */}
          <svg
            viewBox="0 0 100 100"
            className={`w-full h-full transform transition-transform duration-700 ${
              isListening ? 'rotate-2 scale-105' : 'hover:scale-105'
            } ${mood === 'angry' ? 'animate-[shake_0.5s_ease-in-out_infinite]' : 'animate-[float_6s_ease-in-out_infinite]'}`}
          >
            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-3px); }
              }
              @keyframes shake {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                20% { transform: translate(-1px, 1px) rotate(-1deg); }
                40% { transform: translate(1px, -1px) rotate(1deg); }
                60% { transform: translate(-1px, -1px) rotate(0deg); }
                80% { transform: translate(1px, 1px) rotate(1deg); }
              }
            `}</style>

            {/* Back Hair (Ponytail) */}
            <path
              d="M 50 15 C 25 15, 12 35, 18 65 C 20 75, 28 80, 32 65 C 38 45, 45 45, 50 45 Z"
              fill="#F472B6" // pink ponytail left/behind
            />
            <path
              d="M 50 15 C 75 15, 88 35, 82 65 C 80 75, 72 80, 68 65 C 62 45, 55 45, 50 45 Z"
              fill="#EC4899" // darker pink ponytail right
            />

            {/* Neck */}
            <rect x="46" y="58" width="8" height="12" rx="3" fill="#FFE4E6" />

            {/* White Sundress Collar & Body */}
            <path d="M 35 70 C 45 68, 55 68, 65 70 L 72 95 L 28 95 Z" fill="#F8FAFC" />
            
            {/* Green collar trim/bow */}
            <path d="M 38 71 C 45 74, 55 74, 62 71 L 60 76 L 40 76 Z" fill="#059669" />
            <circle cx="50" cy="74" r="3" fill="#10B981" />
            
            {/* Head/Face base */}
            <circle cx="50" cy="45" r="20" fill="#FFF1F2" />

            {/* Blushing Cheeks */}
            <ellipse cx="38" cy="49" rx="3" ry="1.5" fill="#FDA4AF" opacity={mood === 'angry' ? 0.8 : 0.5} />
            <ellipse cx="62" cy="49" rx="3" ry="1.5" fill="#FDA4AF" opacity={mood === 'angry' ? 0.8 : 0.5} />

            {/* Headband (Green flower) */}
            <path d="M 32 34 C 40 28, 60 28, 68 34" stroke="#047857" strokeWidth="2.5" fill="none" />
            <circle cx="50" cy="29" r="2.5" fill="#10B981" />
            <circle cx="43" cy="30" r="2.2" fill="#059669" />
            <circle cx="57" cy="30" r="2.2" fill="#059669" />

            {/* Eyes Section */}
            {blink ? (
              // Blinking state (closed eyes)
              <>
                <path d="M 33 44 Q 38 46 41 44" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 59 44 Q 62 46 67 44" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />
              </>
            ) : (
              // Open eyes depending on mood
              <>
                {/* Eyebrows */}
                {mood === 'angry' ? (
                  <>
                    <path d="M 32 38 L 42 41" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 68 38 L 58 41" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                ) : mood === 'worried' ? (
                  <>
                    <path d="M 33 39 Q 38 37 42 40" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M 67 39 Q 62 37 58 40" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <path d="M 33 39 Q 38 36 41 39" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M 67 39 Q 62 36 59 39" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </>
                )}

                {/* Left Eye */}
                <ellipse cx="37" cy="45" rx="4.5" ry="5.5" fill="#0F172A" />
                <ellipse cx="37" cy="45" rx="3.5" ry="4.5" fill={theme.eyeColor} />
                <circle cx="35.5" cy="43" r="1.5" fill="#FFFFFF" /> {/* Sparkle */}
                {mood === 'happy' && (
                  <path d="M 34 47 Q 37 49 40 47" stroke="#FFFFFF" strokeWidth="1" fill="none" />
                )}

                {/* Right Eye */}
                <ellipse cx="63" cy="45" rx="4.5" ry="5.5" fill="#0F172A" />
                <ellipse cx="63" cy="45" rx="3.5" ry="4.5" fill={theme.eyeColor} />
                <circle cx="61.5" cy="43" r="1.5" fill="#FFFFFF" /> {/* Sparkle */}
                {mood === 'happy' && (
                  <path d="M 60 47 Q 63 49 66 47" stroke="#FFFFFF" strokeWidth="1" fill="none" />
                )}
              </>
            )}

            {/* Nose */}
            <path d="M 50 47 L 49.5 49.5 L 50.5 49.5 Z" fill="#FDA4AF" />

            {/* Mouth Section */}
            {isSpeaking ? (
              // Dynamic talking mouth
              <ellipse cx="50" cy="53.5" rx="2.5" ry="3.5" fill="#E11D48" className="animate-[pulse_0.15s_infinite_alternate]" />
            ) : mood === 'happy' ? (
              // Sweet smile
              <path d="M 46 52 Q 50 56 54 52" stroke="#E11D48" strokeWidth="2" fill="none" strokeLinecap="round" />
            ) : mood === 'angry' ? (
              // Sharp scowl/pout
              <path d="M 46 54 Q 50 51 54 54" stroke="#BE123C" strokeWidth="2" fill="none" strokeLinecap="round" />
            ) : mood === 'worried' ? (
              // Wavy mouth
              <path d="M 47 53 Q 48.5 54 50 53 Q 51.5 52 53 53" stroke="#BE123C" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            ) : (
              // Neutral small smile
              <path d="M 47 53 Q 50 54.5 53 53" stroke="#E11D48" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            )}

            {/* Beautiful pink front hair bangs */}
            <path d="M 30 29 C 32 38, 38 41, 41 41 Q 44 32, 45 28" fill="#F472B6" />
            <path d="M 70 29 C 68 38, 62 41, 59 41 Q 56 32, 55 28" fill="#F472B6" />
            <path d="M 45 25 C 48 35, 52 35, 55 25" fill="#EC4899" /> {/* Center strand */}
          </svg>
        </div>

        {/* Speech Bubble */}
        {subtitle && (
          <div className="absolute top-[215px] max-w-xs z-30 transition-all duration-300 transform scale-100">
            <div className="bg-slate-900/90 border border-white/20 px-4 py-2.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md relative text-center">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-l border-t border-white/20 rotate-45" />
              <p className="text-xs text-white font-medium italic">"{subtitle}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Voice Visualizer Indicator */}
      <div className="flex justify-center items-end gap-1 h-8 mt-1 select-none">
        {[0.6, 0.4, 0.9, 0.3, 0.75, 0.2, 0.55].map((val, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              mood === 'angry' ? 'bg-rose-500' : mood === 'worried' ? 'bg-amber-500' : 'bg-cyan-400'
            }`}
            style={{
              height: isSpeaking
                ? `${val * 100}%`
                : isListening
                ? `${val * 40}%`
                : '6px',
              animation: isSpeaking
                ? `bounce ${0.4 + i * 0.1}s infinite alternate ease-in-out`
                : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
