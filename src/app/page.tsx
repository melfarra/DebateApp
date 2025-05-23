'use client';

import { useState } from 'react';
import DebateSpaceList from '@/components/DebateSpaceList';
import CreateDebateSpace from '@/components/CreateDebateSpace';

// Mock data for initial development
const mockDebateSpaces = [
  {
    id: '1',
    title: 'Climate Change Solutions',
    description: 'Discussing effective strategies to combat climate change and promote sustainability.',
    participants: 42,
    createdAt: '2024-03-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'AI Ethics',
    description: 'Exploring the ethical implications of artificial intelligence in modern society.',
    participants: 28,
    createdAt: '2024-03-14T15:30:00Z',
  },
  {
    id: '3',
    title: 'Future of Work',
    description: 'Debating how remote work and automation will shape the future workplace.',
    participants: 35,
    createdAt: '2024-03-13T09:15:00Z',
  },
];

export default function Home() {
  const [debateSpaces, setDebateSpaces] = useState(mockDebateSpaces);

  const handleCreateDebateSpace = (data: { title: string; description: string }) => {
    const newSpace = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      participants: 1,
      createdAt: new Date().toISOString(),
    };
    setDebateSpaces([newSpace, ...debateSpaces]);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Debate Spaces
          </h1>
          <p className="text-xl text-gray-600">
            Join meaningful discussions and share your perspective
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DebateSpaceList spaces={debateSpaces} />
          </div>
          <div>
            <CreateDebateSpace onSubmit={handleCreateDebateSpace} />
          </div>
        </div>
      </div>
    </main>
  );
}
