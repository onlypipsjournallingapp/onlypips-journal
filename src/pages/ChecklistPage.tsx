
import React from 'react';
import ChecklistPageComponent from '@/components/Checklist/ChecklistPage';

interface ChecklistPageProps {
  userId: string;
}

const ChecklistPage: React.FC<ChecklistPageProps> = ({ userId }) => {
  return <ChecklistPageComponent userId={userId} />;
};

export default ChecklistPage;
