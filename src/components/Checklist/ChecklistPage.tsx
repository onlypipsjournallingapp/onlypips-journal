
import React, { useState } from "react";
import StrategyList from "./StrategyList";
import StrategyChecklist from "./StrategyChecklist";

interface ChecklistPageProps {
  userId: string;
}

const ChecklistPage: React.FC<ChecklistPageProps> = ({ userId }) => {
  const [selectedId, setSelectedId] = useState<string>("");

  return (
    <div className="max-w-2xl mx-auto py-8">
      <StrategyList userId={userId} selectedId={selectedId} onStrategySelect={setSelectedId} />
      {selectedId && <StrategyChecklist strategyId={selectedId} />}
    </div>
  );
};

export default ChecklistPage;
