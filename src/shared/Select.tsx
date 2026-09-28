/**
 * 選択肢が多いもの（年、都道府県、項目）の選択。
 * 独自のポップオーバーは作らず、ネイティブの select に見た目だけ当てる。
 */

export interface SelectGroup {
  label: string;
  options: { value: string; label: string }[];
}

export function Select({
  value,
  onChange,
  label,
  options,
  groups,
  wide = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options?: { value: string; label: string }[];
  groups?: SelectGroup[];
  wide?: boolean;
}) {
  return (
    <label className="relative flex min-w-0 items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full min-w-0 cursor-pointer appearance-none truncate rounded-md border border-rule bg-surface py-1 pr-7 pl-3 text-[12px] font-medium transition-colors duration-150 hover:border-rule-strong ${
          wide ? "max-w-[22rem]" : "max-w-[14rem]"
        }`}
      >
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {groups?.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <svg
        viewBox="0 0 10 6"
        width="9"
        height="6"
        aria-hidden
        className="pointer-events-none absolute right-2.5 fill-none stroke-muted"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 1l4 4 4-4" />
      </svg>
    </label>
  );
}
