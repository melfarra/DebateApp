import React from 'react';

interface DebateSpaceProps {
  id: string;
  title: string;
  description: string;
  participants: number;
  createdAt: string;
}

const DebateSpace: React.FC<DebateSpaceProps> = ({
  title,
  description,
  participants,
  createdAt,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{participants} participants</span>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default DebateSpace; 