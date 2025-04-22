
import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const ChecklistInfo: React.FC = () => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Listener for outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <span
          ref={triggerRef}
          className="inline-flex items-center cursor-pointer ml-2"
          tabIndex={0}
          aria-label="Show info"
          onClick={() => setOpen((v) => !v)}
        >
          <Info className="h-4 w-4 text-primary" />
        </span>
      </PopoverTrigger>
      {open && (
        <PopoverContent
          ref={popoverRef}
          side="top"
          className="bg-popover text-popover-foreground border p-2 rounded shadow-lg animate-fade-in"
          align="start"
        >
          <div className="max-w-xs text-sm">
            <strong>Trade Checklist:</strong>
            <ul className="list-disc ml-4 mt-2">
              <li>Create named strategies for your personal trading plans.</li>
              <li>Add checklist items to document your required confluences or conditions.</li>
              <li>Check off each item before taking a trade to help ensure you follow your plan.</li>
              <li>Use for reference, learning, or tracking consistency.</li>
            </ul>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default ChecklistInfo;
