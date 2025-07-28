// src/components/CategoryFilter.jsx

export const categories = [
  { name: "All", icon: "📚" },
  { name: "Programming", icon: "💻" },
  { name: "Design", icon: "🎨" },
  { name: "Marketing", icon: "📈" },
  { name: "Business", icon: "💼" },
  { name: "Language", icon: "🗣️" },
  { name: "Photography", icon: "📷" },
];

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="overflow-x-auto py-3 px-2">
      <div className="flex gap-3 snap-x snap-mandatory w-max">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className={`flex items-center gap-2 snap-start px-4 py-2 rounded-full text-sm font-medium border transition whitespace-nowrap ${
              selected === cat.name
                ? "bg-[#b7c26d] text-black border-[#b7c26d]"
                : "bg-black/40 text-white border-white/20 hover:bg-black/60"
            }`}
            onClick={() => onSelect(cat.name)}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

