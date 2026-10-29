import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
export function DateField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min?: string | undefined;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value + "T00:00:00") : undefined;
  const earliest = min ? new Date(min + "T00:00:00") : new Date();
  earliest.setHours(0, 0, 0, 0);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="search-field date-trigger"
          aria-label={`${label}${value ? ": " + value : ""}`}
        >
          <CalendarDays />
          <span>
            <strong>{label.toUpperCase()}</strong>
            <span>
              {selected
                ? selected.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Add dates"}
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="date-popover" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? earliest}
          disabled={{ before: earliest }}
          onSelect={(date) => {
            if (date) {
              onChange(
                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
              );
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
