'use client';

interface Category {
  id: string;
  label: string;
}

const CATEGORIES: Category[] = [
  { id: 'all',            label: 'Tous' },
  { id: 'la-liga',        label: 'Liga 🇪🇸' },
  { id: 'premier-league', label: 'Premier League' },
  { id: 'ligue-1',        label: 'Ligue 1' },
  { id: 'maroc',          label: 'Maroc 🇲🇦' },
  { id: 'serie-a',        label: 'Serie A' },
];

interface FilterBarProps {
  active: string;
  onChange: (id: string) => void;
}

export default function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="sticky top-16 lg:top-20 z-30 bg-[#0A0A0F]/95 backdrop-blur-lg border-b border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      <div className="container mx-auto px-4 py-3">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2.5 min-w-max">
            {CATEGORIES.map(({ id, label }) => {
              const isActive = active === id;
              return (
                <button
                  key={id}
                  onClick={() => onChange(id)}
                  className={`
                    px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${isActive
                      ? 'bg-[#00FF87] text-[#0A0A0F] shadow-[0_0_15px_rgba(0,255,135,0.4)] scale-[1.03]'
                      : 'bg-[#1A1A26] text-[#A0A0B0] border border-white/[0.08] hover:border-[#00FF87]/50 hover:text-white hover:bg-[#1f1f30]'
                    }
                  `}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
