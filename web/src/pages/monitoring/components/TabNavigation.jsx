const tabs = [
  { key: "harian", label: "Harian" },
  { key: "mingguan", label: "Mingguan" },
  { key: "bulanan", label: "Bulanan" },
];

export default function TabNavigation({ activeTab, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((t) => {
        const isActive = activeTab === t.key;

        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            role="tab"
            aria-selected={isActive}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
              }
            `}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
