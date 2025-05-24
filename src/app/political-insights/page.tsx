'use client';

import { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
import React, { createContext, useContext } from 'react';

interface GovernmentBranch {
  name: string;
  description: string;
  currentLeaders: Array<{
    title: string;
    name: string;
    party?: string;
    term?: string;
  }>;
  recentActions?: Array<{
    title: string;
    date: string;
    description: string;
    status: string;
  }>;
}

interface GovernmentLevel {
  name: string;
  description: string;
  judicial: GovernmentBranch;
  executive: GovernmentBranch;
  legislative: GovernmentBranch;
}

interface CountryData {
  name: string;
  government: string;
  population: string;
  federal?: GovernmentLevel;
  state?: GovernmentLevel;
  local?: GovernmentLevel;
  recentVotes: Array<{
    title: string;
    date: string;
    status: string;
  }>;
}

// Mock data for countries
const mockCountryData: Record<string, CountryData> = {
  'USA': {
    name: 'United States',
    government: 'Federal Presidential Constitutional Republic',
    population: '331.9M',
    federal: {
      name: 'Federal Government',
      description: 'The national government of the United States',
      judicial: {
        name: 'Federal Judiciary',
        description: 'The judicial branch of the federal government',
        currentLeaders: [
          { title: 'Chief Justice', name: 'John Roberts', term: '2005-Present' }
        ],
        recentActions: [
          {
            title: 'Supreme Court Decision',
            date: '2024-03-15',
            description: 'Ruling on federal election laws',
            status: 'Decided'
          }
        ]
      },
      executive: {
        name: 'Executive Branch',
        description: 'The executive branch of the federal government',
        currentLeaders: [
          { title: 'President', name: 'Joe Biden', party: 'Democratic', term: '2021-Present' },
          { title: 'Vice President', name: 'Kamala Harris', party: 'Democratic', term: '2021-Present' }
        ],
        recentActions: [
          {
            title: 'Executive Order',
            date: '2024-03-10',
            description: 'Climate change initiatives',
            status: 'Implemented'
          }
        ]
      },
      legislative: {
        name: 'Congress',
        description: 'The legislative branch of the federal government',
        currentLeaders: [
          { title: 'Speaker of the House', name: 'Mike Johnson', party: 'Republican', term: '2023-Present' },
          { title: 'Senate Majority Leader', name: 'Chuck Schumer', party: 'Democratic', term: '2021-Present' }
        ],
        recentActions: [
          {
            title: 'Federal Budget 2024',
            date: '2024-03-15',
            description: 'Annual federal budget approval',
            status: 'Passed'
          }
        ]
      }
    },
    state: {
      name: 'State Government',
      description: 'State-level government structure',
      judicial: {
        name: 'State Judiciary',
        description: 'The judicial branch of state government',
        currentLeaders: [
          { title: 'State Supreme Court Chief Justice', name: 'Varies by State', term: 'Varies' }
        ]
      },
      executive: {
        name: 'State Executive',
        description: 'The executive branch of state government',
        currentLeaders: [
          { title: 'Governor', name: 'Varies by State', party: 'Varies', term: 'Varies' }
        ]
      },
      legislative: {
        name: 'State Legislature',
        description: 'The legislative branch of state government',
        currentLeaders: [
          { title: 'State Senate President', name: 'Varies by State', party: 'Varies', term: 'Varies' },
          { title: 'State House Speaker', name: 'Varies by State', party: 'Varies', term: 'Varies' }
        ]
      }
    },
    local: {
      name: 'Local Government',
      description: 'County and municipal government structure',
      judicial: {
        name: 'Local Courts',
        description: 'Local judicial system',
        currentLeaders: [
          { title: 'Local Court Judge', name: 'Varies by Jurisdiction', term: 'Varies' }
        ]
      },
      executive: {
        name: 'Local Executive',
        description: 'Local executive offices',
        currentLeaders: [
          { title: 'Mayor', name: 'Varies by City', party: 'Varies', term: 'Varies' }
        ]
      },
      legislative: {
        name: 'Local Legislature',
        description: 'Local legislative bodies',
        currentLeaders: [
          { title: 'City Council President', name: 'Varies by City', party: 'Varies', term: 'Varies' }
        ]
      }
    },
    recentVotes: [
      { title: '2024 Presidential Election', date: '2024-11-05', status: 'Upcoming' },
      { title: 'Federal Budget 2024', date: '2024-03-15', status: 'Passed' }
    ]
  },
  'CAN': {
    name: 'Canada',
    government: 'Federal Parliamentary Constitutional Monarchy',
    population: '38.25M',
    recentVotes: [
      { title: 'Federal Election 2025', date: '2025-10-20', status: 'Upcoming' },
      { title: 'Climate Action Plan', date: '2024-02-01', status: 'Passed' }
    ]
  }
};

// Use the official react-simple-maps world-110m.json
const geoUrl = "/countries-110m.json";

const usStatesUrl = "/us-states.json";

interface Position {
  coordinates: [number, number];
  zoom: number;
}

// Helper to map geo.properties.name to mockCountryData key
const countryNameToKey: Record<string, string> = {
  'United States of America': 'USA',
  'Canada': 'CAN',
  // Add more mappings as needed
};

// Demo state-specific data
const stateGovernmentData: Record<string, GovernmentLevel> = {
  'California': {
    name: 'California State Government',
    description: 'The government of the state of California',
    judicial: {
      name: 'California Supreme Court',
      description: 'The highest court in California',
      currentLeaders: [
        { title: 'Chief Justice', name: 'Patricia Guerrero', term: '2023-Present' }
      ]
    },
    executive: {
      name: 'Governor',
      description: 'The executive branch of California',
      currentLeaders: [
        { title: 'Governor', name: 'Gavin Newsom', party: 'Democratic', term: '2019-Present' }
      ]
    },
    legislative: {
      name: 'California State Legislature',
      description: 'The legislative branch of California',
      currentLeaders: [
        { title: 'Senate President pro Tempore', name: 'Toni Atkins', party: 'Democratic', term: '2018-Present' },
        { title: 'Assembly Speaker', name: 'Robert Rivas', party: 'Democratic', term: '2023-Present' }
      ]
    }
  },
  'Texas': {
    name: 'Texas State Government',
    description: 'The government of the state of Texas',
    judicial: {
      name: 'Texas Supreme Court',
      description: 'The highest court in Texas',
      currentLeaders: [
        { title: 'Chief Justice', name: 'Nathan L. Hecht', term: '2013-Present' }
      ]
    },
    executive: {
      name: 'Governor',
      description: 'The executive branch of Texas',
      currentLeaders: [
        { title: 'Governor', name: 'Greg Abbott', party: 'Republican', term: '2015-Present' }
      ]
    },
    legislative: {
      name: 'Texas Legislature',
      description: 'The legislative branch of Texas',
      currentLeaders: [
        { title: 'Lt. Governor', name: 'Dan Patrick', party: 'Republican', term: '2015-Present' },
        { title: 'Speaker of the House', name: 'Dade Phelan', party: 'Republican', term: '2021-Present' }
      ]
    }
  },
  'New York': {
    name: 'New York State Government',
    description: 'The government of the state of New York',
    judicial: {
      name: 'New York Court of Appeals',
      description: 'The highest court in New York',
      currentLeaders: [
        { title: 'Chief Judge', name: 'Rowan D. Wilson', term: '2023-Present' }
      ]
    },
    executive: {
      name: 'Governor',
      description: 'The executive branch of New York',
      currentLeaders: [
        { title: 'Governor', name: 'Kathy Hochul', party: 'Democratic', term: '2021-Present' }
      ]
    },
    legislative: {
      name: 'New York State Legislature',
      description: 'The legislative branch of New York',
      currentLeaders: [
        { title: 'Senate Majority Leader', name: 'Andrea Stewart-Cousins', party: 'Democratic', term: '2019-Present' },
        { title: 'Assembly Speaker', name: 'Carl Heastie', party: 'Democratic', term: '2015-Present' }
      ]
    }
  }
};

// Mock state partisanship data (for demo)
const statePartisanship: Record<string, 'red' | 'blue'> = {
  'California': 'blue',
  'New York': 'blue',
  'Illinois': 'blue',
  'Massachusetts': 'blue',
  'Washington': 'blue',
  'Oregon': 'blue',
  'Maryland': 'blue',
  'New Jersey': 'blue',
  'Connecticut': 'blue',
  'Hawaii': 'blue',
  'Vermont': 'blue',
  'Rhode Island': 'blue',
  'Delaware': 'blue',
  'Colorado': 'blue',
  // The rest are red for demo
};

// Theme context and provider
const themes = {
  dark: {
    cardBg: 'rgba(24,28,42,0.95)',
    cardText: '#fff',
    accent: '#38bdf8',
    border: '#222b3a',
    shadow: '0 4px 32px 0 rgba(0,0,0,0.25)',
    progressBg: '#2d3748',
    progressFg: '#38bdf8',
    icon: '#38bdf8',
    mapBg: '#181c2a',
  },
  light: {
    cardBg: '#fff',
    cardText: '#222b3a',
    accent: '#2563eb',
    border: '#e5e7eb',
    shadow: '0 4px 32px 0 rgba(0,0,0,0.08)',
    progressBg: '#e5e7eb',
    progressFg: '#2563eb',
    icon: '#2563eb',
    mapBg: '#f3f4f6',
  },
};
const ThemeContext = createContext({ theme: themes.dark, toggleTheme: () => {} });
function useTheme() { return useContext(ThemeContext); }

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'dark' | 'light'>('dark');
  const toggleTheme = () => setMode(m => (m === 'dark' ? 'light' : 'dark'));
  return (
    <ThemeContext.Provider value={{ theme: themes[mode], toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Mock country vitals (for demo)
const countryVitals: Record<string, any> = {
  'USA': {
    flag: '🇺🇸',
    population: '331.9M',
    government: 'Federal Republic',
    literacy: 99,
    religion: 'Protestant (43%), Catholic (20%), None (26%)',
    lawIndex: { press: 70, lgbt: 60 },
    ethnicGroups: 'White (57%), Hispanic (19%), Black (12%), Asian (6%)',
    parties: ['Democratic', 'Republican'],
  },
  'CAN': {
    flag: '🇨🇦',
    population: '38.25M',
    government: 'Federal Parliamentary Monarchy',
    literacy: 99,
    religion: 'Christian (67%), None (29%)',
    lawIndex: { press: 85, lgbt: 90 },
    ethnicGroups: 'White (72%), South Asian (7%), Chinese (5%)',
    parties: ['Liberal', 'Conservative', 'NDP'],
  },
};

export default function PoliticalInsights() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>({ coordinates: [0, 0], zoom: 1 });
  const [showStates, setShowStates] = useState(false);
  const [usStates, setUsStates] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<'federal' | 'state' | 'local'>('federal');
  const [selectedBranch, setSelectedBranch] = useState<'judicial' | 'executive' | 'legislative'>('executive');
  const [selectedState, setSelectedState] = useState<any | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'judicial' | 'executive' | 'legislative'>('overview');
  const { theme, toggleTheme } = useTheme();

  // Load US states when USA is selected
  useEffect(() => {
    if (selectedCountry === 'USA') {
      fetch(usStatesUrl)
        .then(res => res.json())
        .then(data => {
          const features = feature(data, data.objects.states).features;
          setUsStates(features);
          setShowStates(true);
        });
    } else {
      setShowStates(false);
      setUsStates([]);
      setSelectedState(null);
    }
  }, [selectedCountry]);

  // When selectedCountry or selectedState changes, reset to overview tab
  useEffect(() => {
    setSelectedTab('overview');
  }, [selectedCountry, selectedState]);

  // Zoom and center on country click
  function handleCountryClick(geo: any) {
    const key = countryNameToKey[geo.properties.name] || geo.properties.name;
    setSelectedState(null);
    setSelectedCountry(key);
    setSelectedLevel('federal');
    if (key !== 'USA') {
      setPosition({ coordinates: geoCentroid(geo), zoom: 3 });
    }
  }

  // Zoom and center on state click (for US)
  function handleStateClick(stateGeo: any) {
    setSelectedState(stateGeo);
    setSelectedLevel('state');
    setPosition({ coordinates: geoCentroid(stateGeo), zoom: 6 });
  }

  function handleZoomIn() {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 2 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 2 }));
  }

  function handleMoveEnd(position: Position) {
    setPosition(position);
  }

  // Helper to get state name (if available)
  function getStateName(stateGeo: any) {
    return stateGeo?.properties?.name || 'State';
  }

  // Info panel rendering with tabs
  function renderInfoPanel() {
    // Determine if we're showing a state or country
    const isUSA = selectedCountry === 'USA';
    const isState = isUSA && selectedState;
    const countryKey = selectedCountry || '';
    const countryData = mockCountryData[countryKey];
    const vitals = countryVitals[countryKey];
    const stateName = isState ? getStateName(selectedState) : null;
    const stateData = isState ? (stateGovernmentData[stateName] || countryData?.state) : null;

    // Tabs
    const tabs = [
      { key: 'overview', label: 'Overview' },
      { key: 'judicial', label: 'Judicial' },
      { key: 'executive', label: 'Executive' },
      { key: 'legislative', label: 'Legislative' },
    ];

    // Panel content by tab
    let content = null;
    if (selectedTab === 'overview') {
      content = vitals ? (
        <>
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-3">{vitals.flag}</span>
            <h2 className="text-2xl font-extrabold tracking-tight">{countryData?.name}{isState && stateName ? ` - ${stateName}` : ''}</h2>
          </div>
          <div className="mb-2 text-lg font-medium">Population: <span className="font-bold">{vitals.population}</span></div>
          <div className="mb-2 text-lg font-medium">Government: <span className="font-bold">{vitals.government}</span></div>
          <div className="mb-4">
            <div className="flex items-center mb-1">
              <span className="mr-2">📚</span>
              <span>Literacy</span>
              <span className="ml-auto font-bold">{vitals.literacy}%</span>
            </div>
            <div className="w-full h-2 rounded" style={{ background: theme.progressBg, marginBottom: 8 }}>
              <div style={{ width: `${vitals.literacy}%`, background: theme.progressFg }} className="h-2 rounded"></div>
            </div>
            <div className="flex items-center mb-1">
              <span className="mr-2">🕊️</span>
              <span>Press Freedom</span>
              <span className="ml-auto font-bold">{vitals.lawIndex.press}</span>
            </div>
            <div className="w-full h-2 rounded" style={{ background: theme.progressBg, marginBottom: 8 }}>
              <div style={{ width: `${vitals.lawIndex.press}%`, background: theme.progressFg }} className="h-2 rounded"></div>
            </div>
            <div className="flex items-center mb-1">
              <span className="mr-2">🏳️‍🌈</span>
              <span>LGBT Rights</span>
              <span className="ml-auto font-bold">{vitals.lawIndex.lgbt}</span>
            </div>
            <div className="w-full h-2 rounded" style={{ background: theme.progressBg, marginBottom: 8 }}>
              <div style={{ width: `${vitals.lawIndex.lgbt}%`, background: theme.progressFg }} className="h-2 rounded"></div>
            </div>
            <div className="flex items-center mb-1">
              <span className="mr-2">🧑‍🤝‍🧑</span>
              <span>Ethnic Groups</span>
              <span className="ml-auto font-bold">{vitals.ethnicGroups}</span>
            </div>
            <div className="flex items-center mb-1">
              <span className="mr-2">🛐</span>
              <span>Religion</span>
              <span className="ml-auto font-bold">{vitals.religion}</span>
            </div>
            <div className="flex items-center mb-1">
              <span className="mr-2">🗳️</span>
              <span>Major Parties</span>
              <span className="ml-auto font-bold">{vitals.parties.join(', ')}</span>
            </div>
          </div>
        </>
      ) : null;
    } else if (['judicial', 'executive', 'legislative'].includes(selectedTab)) {
      const levelData = isState ? stateData : countryData?.federal;
      const branch = levelData ? levelData[selectedTab] : null;
      content = branch ? (
        <>
          <h3 className="text-xl font-bold mb-2">{branch.name}</h3>
          <p className="mb-4 text-gray-300" style={{ color: theme.cardText }}>{branch.description}</p>
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Current Leaders</h4>
            <div className="space-y-2">
              {branch.currentLeaders.map((leader: any, idx: number) => (
                <div key={idx} className="bg-opacity-30 rounded p-2" style={{ background: theme.progressBg }}>
                  <span className="font-bold">{leader.title}</span>: {leader.name}
                  {leader.party && <span className="ml-2 text-xs">({leader.party})</span>}
                  {leader.term && <span className="ml-2 text-xs">Term: {leader.term}</span>}
                </div>
              ))}
            </div>
          </div>
          {branch.recentActions && branch.recentActions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Recent Actions</h4>
              <ul className="space-y-2">
                {branch.recentActions.map((action: any, idx: number) => (
                  <li key={idx} className="bg-opacity-30 rounded p-2" style={{ background: theme.progressBg }}>
                    <span className="font-bold">{action.title}</span> - {action.date} <br />
                    <span className="text-xs">{action.description}</span> <span className="ml-2 text-xs">({action.status})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : <div className="text-gray-400">No data available.</div>;
    }

    return (
      <div
        className="rounded-2xl shadow-xl p-6 relative"
        style={{
          background: theme.cardBg,
          color: theme.cardText,
          border: `1.5px solid ${theme.border}`,
          boxShadow: theme.shadow,
          minWidth: 320,
          maxWidth: 400,
        }}
      >
        <ThemeSwitcher />
        <div className="flex space-x-2 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`px-3 py-1 rounded-lg font-semibold transition ${selectedTab === tab.key ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
              style={selectedTab === tab.key ? { background: theme.accent, color: theme.cardText } : { background: theme.progressBg, color: theme.cardText }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {content}
      </div>
    );
  }

  // Theme switcher placeholder
  function ThemeSwitcher() {
    const { toggleTheme, theme } = useTheme();
    return (
      <div className="absolute top-4 right-4 z-20">
        <button onClick={toggleTheme} style={{ background: theme.accent, color: theme.cardText }} className="px-3 py-2 rounded-lg font-bold shadow-lg hover:opacity-80 transition">🌗 Theme</button>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <main className="min-h-screen py-8" style={{ background: theme.mapBg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Global Political Insights
            </h1>
            <p className="text-xl text-gray-600">
              Explore political systems and recent votes around the world
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="relative h-[600px] border-4 border-blue-400">
                  {selectedCountry === 'USA' && showStates && usStates.length > 0 ? (
                    <ComposableMap projection="geoAlbersUsa" style={{ background: themes.dark.mapBg, borderRadius: '1rem' }}>
                      <ZoomableGroup
                        zoom={0.9}
                        center={[-98, 38]}
                        onMoveEnd={handleMoveEnd}
                      >
                        <Geographies geography={{ type: 'FeatureCollection', features: usStates }}>
                          {({ geographies }) =>
                            geographies.map(stateGeo => {
                              const stateName = getStateName(stateGeo);
                              const partisanship = statePartisanship[stateName] || 'red';
                              const fillColor = partisanship === 'blue' ? '#2563eb' : '#ef4444';
                              return (
                                <Geography
                                  key={stateGeo.rsmKey}
                                  geography={stateGeo}
                                  onClick={() => handleStateClick(stateGeo)}
                                  style={{
                                    default: {
                                      fill: selectedState && getStateName(selectedState) === stateName ? '#f59e42' : fillColor,
                                      stroke: themes.dark.border,
                                      strokeWidth: 1.5,
                                      outline: 'none',
                                      cursor: 'pointer',
                                      filter: selectedState && getStateName(selectedState) === stateName ? 'drop-shadow(0 0 8px #f59e42)' : 'none',
                                    },
                                    hover: {
                                      fill: '#f59e42',
                                      stroke: themes.dark.accent,
                                      strokeWidth: 2,
                                      outline: 'none',
                                      cursor: 'pointer',
                                    },
                                    pressed: {
                                      fill: '#d97706',
                                      stroke: themes.dark.accent,
                                      strokeWidth: 2,
                                      outline: 'none',
                                      cursor: 'pointer',
                                    },
                                  }}
                                />
                              );
                            })
                          }
                        </Geographies>
                      </ZoomableGroup>
                    </ComposableMap>
                  ) : (
                    <ComposableMap projection="geoMercator" style={{ background: themes.dark.mapBg, borderRadius: '1rem' }}>
                      <ZoomableGroup
                        zoom={position.zoom}
                        center={position.coordinates}
                        onMoveEnd={handleMoveEnd}
                      >
                        <Geographies geography={geoUrl}>
                          {({ geographies }) =>
                            geographies.map(geo => (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                onClick={() => handleCountryClick(geo)}
                                style={{
                                  default: {
                                    fill: selectedCountry === (countryNameToKey[geo.properties.name] || geo.properties.name) ? '#1E40AF' : '#60A5FA',
                                    stroke: '#181c2a',
                                    strokeWidth: 0.5,
                                    outline: 'none',
                                    cursor: 'pointer',
                                  },
                                  hover: {
                                    fill: '#2563EB',
                                    stroke: '#fff',
                                    strokeWidth: 0.5,
                                    outline: 'none',
                                    cursor: 'pointer',
                                  },
                                  pressed: {
                                    fill: '#1D4ED8',
                                    stroke: '#fff',
                                    strokeWidth: 0.5,
                                    outline: 'none',
                                    cursor: 'pointer',
                                  },
                                }}
                              />
                            ))
                          }
                        </Geographies>
                      </ZoomableGroup>
                    </ComposableMap>
                  )}
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <button
                      onClick={handleZoomIn}
                      className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
                    >
                      +
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50"
                    >
                      -
                    </button>
                  </div>
                  {selectedCountry && (
                    <button
                      className="absolute top-2 left-2 mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-medium z-10"
                      onClick={() => {
                        setSelectedCountry(null);
                        setShowStates(false);
                        setUsStates([]);
                        setSelectedState(null);
                        setPosition({ coordinates: [0, 0], zoom: 1 });
                      }}
                    >
                      ← Back to World View
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              {selectedCountry ? renderInfoPanel() : (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <p className="text-gray-600 text-center">
                    Select a country on the map to view its political information
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
} 