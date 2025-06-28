
import React from 'react';
import ChecklistInfo from '@/components/Checklist/ChecklistInfo';

interface ChecklistPageProps {
  userId: string;
}

const ChecklistPage: React.FC<ChecklistPageProps> = ({ userId }) => {
  return (
    <div className="container mx-auto py-6">
      <ChecklistInfo userId={userId} />
    </div>
  );
};

export default ChecklistPage;
