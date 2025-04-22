
import React from "react";
import { Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const ChecklistInfo: React.FC = () => (
  <Popover>
    <PopoverTrigger asChild>
      <span className="inline-flex items-center cursor-pointer ml-2" tabIndex={0} aria-label="Show info">
        <Info className="h-4 w-4 text-primary" />
      </span>
    </PopoverTrigger>
    <PopoverContent
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
  </Popover>
);

export default ChecklistInfo;

