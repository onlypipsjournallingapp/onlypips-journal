
import React from "react";
import { Info } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const ChecklistInfo: React.FC = () => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center cursor-pointer ml-2">
          <Info className="h-4 w-4 text-primary" />
        </span>
      </TooltipTrigger>
      <TooltipContent 
        side="top" 
        className="bg-popover text-popover-foreground border p-2 rounded shadow-lg"
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
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default ChecklistInfo;
