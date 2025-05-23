import React from 'react';
import DebateSpace from './DebateSpace';

interface DebateSpaceData {
  id: string;
  title: string;
  description: string;
  participants: number;
  createdAt: string;
}

interface DebateSpaceListProps {
  spaces: DebateSpaceData[];
}

const DebateSpaceList: React.FC<DebateSpaceListProps> = ({ spaces }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {spaces.map((space) => (
        <DebateSpace
          key={space.id}
          id={space.id}
          title={space.title}
          description={space.description}
          participants={space.participants}
          createdAt={space.createdAt}
        />
      ))}
    </div>
  );
};

export default DebateSpaceList; 