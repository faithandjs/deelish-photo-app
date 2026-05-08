// src/components/LocationAutocomplete.tsx
import { useEffect, useRef, useState } from "react";
import { Input } from "./input";

export type PlaceResult = {
  address: string;
  lat: number;
  lng: number;
};

type Props = {
  value: string;
  onChange: (value: string, place?: PlaceResult) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
};

type GeoapifyFeature = {
  properties: {
    formatted: string;
    lat: number;
    lon: number;
  };
};

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = "Dolomites, Italy",
  maxLength = 120,
  className,
}: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const search = (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=5&apiKey=${import.meta.env.VITE_GEOAPIFY_KEY}`,
        );
        const data = await res.json();
        setSuggestions(data.features ?? []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 350);
  };

  const handleSelect = (feature: GeoapifyFeature) => {
    const place: PlaceResult = {
      address: feature.properties.formatted,
      lat: feature.properties.lat,
      lng: feature.properties.lon,
    };
    setInputValue(place.address);
    onChange(place.address, place);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <Input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
          search(e.target.value);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={className} // inherits whatever class your <Input> uses
      />

      {open && suggestions.length > 0 && (
        <ul className="absolute top-[calc(100%+4px)] left-0 right-0 bg-background border-[0.5px] border-accent rounded-lg list-none py-1 m-0 z-9999">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(s)}
              className={`px-3 py-3 cursor-pointer text-sm  ${
                i < suggestions.length - 1 ? "border-b-[0.5px] border-accent" : ""
              }`}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-background-secondary)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {s.properties.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
