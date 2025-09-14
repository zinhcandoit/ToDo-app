export type ViewKey = 'list' | 'calendar' | 'analytics' | 'caring';

export function ViewTabs({ value, onChange }: {
    value: ViewKey; onChange: (v: ViewKey) => void;
}) {
    const btn = (key: ViewKey, label: string) => (
        <button
            onClick={() => onChange(key)}
            className={
                "px-4 py-2 rounded-full text-sm border " +
                (value === key
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : (key != 'caring' ?
                        "bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700" :
                        "bg-pink-200 dark:bg-pink-700 border-gray-300 hover:bg-gray-50 dark:border-gray-700"))
            }
        >
            {label}
        </button>
    );
    return (
        <div className="flex gap-2 flex-wrap">
            {btn('list', 'List')}
            {btn('calendar', 'Calendar')}
            {btn('analytics', 'Analytics')}
            {btn('caring', 'Caring')}
        </div>
    );
}
