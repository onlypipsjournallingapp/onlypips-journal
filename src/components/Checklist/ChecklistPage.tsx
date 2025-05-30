
import React, { useState } from "react";
import StrategyList from "./StrategyList";
import StrategyChecklist from "./StrategyChecklist";
import MarketplaceDialog from "./MarketplaceDialog";

interface ChecklistPageProps {
  userId: string;
}

const ChecklistPage: React.FC<ChecklistPageProps> = ({ userId }) => {
  const [selectedId, setSelectedId] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleChecklistPurchased = () => {
    // Refresh the strategy list to show newly purchased items
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Strategy Checklists</h1>
        <MarketplaceDialog 
          userId={userId} 
          onChecklistPurchased={handleChecklistPurchased}
        />
      </div>
      
      <StrategyList 
        key={refreshKey}
        userId={userId} 
        selectedId={selectedId} 
        onStrategySelect={setSelectedId} 
      />
      {selectedId && <StrategyChecklist strategyId={selectedId} />}
    </div>
  );
};

export default ChecklistPage;
