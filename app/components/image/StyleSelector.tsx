type StyleSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  styles: string[];
};

export default function StyleSelector({
  value,
  onChange,
  styles,
}: StyleSelectorProps) {
  return (
    <div className="mt-6">
      <label className="mb-2 block font-medium">
        Image Style
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white p-3 focus:border-purple-500 focus:outline-none"
      >
        {styles.map((style) => (
          <option
            key={style}
            value={style.toLowerCase()}
          >
            {style}
          </option>
        ))}
      </select>
    </div>
  );
}