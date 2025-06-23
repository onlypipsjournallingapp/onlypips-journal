
import React from 'react';
import PerformanceReport from '@/components/Performance/PerformanceReport';

interface PerformanceProps {
  userId: string;
}

const Performance: React.FC<PerformanceProps> = ({ userId }) => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Performance Analysis</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your trading performance and patterns.
        </p>
      </div>
      <PerformanceReport userId={userId} />
    </div>
  );
};

export default Performance;
