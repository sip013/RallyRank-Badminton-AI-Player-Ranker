import React from 'react';
import { Navigate } from 'react-router-dom';
import { useClub } from '@/context/ClubContext';

const ClubGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { club, clubs, isLoading } = useClub();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-court border-t-transparent" />
      </div>
    );
  }

  if (!club || clubs.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ClubGate;
