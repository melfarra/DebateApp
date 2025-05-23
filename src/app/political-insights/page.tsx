'use client';

import { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';

// Mock data for countries
const mockCountryData = {
  'USA': {
    name: 'United States',
    government: 'Federal Presidential Constitutional Republic',
    recentVotes: [
      { title: '2024 Presidential Election', date: '2024-11-05', status: 'Upcoming' },
      { title: 'Federal Budget 2024', date: '2024-03-15', status: 'Passed' }
    ],
    states: 50,
    population: '331.9M'
  },
  'CAN': {
    name: 'Canada',
    government: 'Federal Parliamentary Constitutional Monarchy',
    recentVotes: [
      { title: 'Federal Election 2025', date: '2025-10-20', status: 'Upcoming' },
      { title: 'Climate Action Plan', date: '2024-02-01', status: 'Passed' }
    ],
    provinces: 10,
    population: '38.25M'
  },
  // Add more countries as needed
};

// Use the official react-simple-maps world-110m.json
const geoUrl = "/countries-110m.json";

const usStatesUrl = "/us-states.json";

interface Position {
  coordinates: [number, number];
  zoom: number;
}

export default function PoliticalInsights() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>({ coordinates: [0, 0], zoom: 1 });
  const [showStates, setShowStates] = useState(false);
  const [usStates, setUsStates] = useState<any[]>([]);

  // Load US states when USA is selected
  useEffect(() => {
    if (selectedCountry === 'United States of America') {
      fetch(usStatesUrl)
        .then(res => res.json())
        .then(data => {
          // Convert TopoJSON to GeoJSON features using topojson-client
          const features = feature(data, data.objects.states).features;
          console.log('Loaded US states TopoJSON:', data);
          console.log('Parsed US states features:', features.length);
          setUsStates(features);
          setShowStates(true);
        });
    } else {
      setShowStates(false);
      setUsStates([]);
    }
  }, [selectedCountry]);

  // Zoom and center on country click
  function handleCountryClick(geo: any) {
    console.log('Clicked country properties:', geo.properties);
    setSelectedCountry(geo.properties.name);
    const centroid = geoCentroid(geo);
    setPosition({ coordinates: centroid, zoom: 3 });
  }

  // Zoom and center on state click (for US)
  function handleStateClick(stateGeo: any) {
    const centroid = geoCentroid(stateGeo);
    setPosition({ coordinates: centroid, zoom: 6 });
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

  return (
    <main className="min-h-screen bg-gray-50 py-8">
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
                {selectedCountry && (
                  <button
                    className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-medium"
                    onClick={() => {
                      setSelectedCountry(null);
                      setShowStates(false);
                      setUsStates([]);
                      setPosition({ coordinates: [0, 0], zoom: 1 });
                    }}
                  >
                    ← Back to World View
                  </button>
                )}
                <ComposableMap projection="geoMercator">
                  <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={handleMoveEnd}
                  >
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        !showStates ? (
                          geographies.map(geo => (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              onClick={() => handleCountryClick(geo)}
                              style={{
                                default: {
                                  fill: selectedCountry === geo.properties.name ? '#1E40AF' : '#60A5FA',
                                  stroke: '#FFFFFF',
                                  strokeWidth: 0.5,
                                  outline: 'none',
                                },
                                hover: {
                                  fill: '#2563EB',
                                  stroke: '#FFFFFF',
                                  strokeWidth: 0.5,
                                  outline: 'none',
                                },
                                pressed: {
                                  fill: '#1D4ED8',
                                  stroke: '#FFFFFF',
                                  strokeWidth: 0.5,
                                  outline: 'none',
                                },
                              }}
                            />
                          ))
                        ) : null
                      }
                    </Geographies>
                    {showStates && usStates.length > 0 && (
                      <Geographies geography={{ type: 'FeatureCollection', features: usStates }}>
                        {({ geographies }) => {
                          console.log('Rendering US state geographies:', geographies.length);
                          return geographies.map(stateGeo => (
                            <Geography
                              key={stateGeo.rsmKey}
                              geography={stateGeo}
                              onClick={() => handleStateClick(stateGeo)}
                              style={{
                                default: {
                                  fill: '#F59E42',
                                  stroke: '#FFFFFF',
                                  strokeWidth: 0.5,
                                  outline: 'none',
                                },
                                hover: {
                                  fill: '#FBBF24',
                                  stroke: '#FFFFFF',
                                  strokeWidth: 0.5,
                                  outline: 'none',
                                },
                                pressed: {
                                  fill: '#D97706',
                                  stroke: '#FFFFFF',
                                  strokeWidth: 0.5,
                                  outline: 'none',
                                },
                              }}
                            />
                          ));
                        }}
                      </Geographies>
                    )}
                  </ZoomableGroup>
                </ComposableMap>
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
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {selectedCountry && mockCountryData[selectedCountry as keyof typeof mockCountryData] ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {mockCountryData[selectedCountry as keyof typeof mockCountryData].name}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Government Type</h3>
                    <p className="text-gray-600">
                      {mockCountryData[selectedCountry as keyof typeof mockCountryData].government}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Recent Votes</h3>
                    <ul className="space-y-2">
                      {mockCountryData[selectedCountry as keyof typeof mockCountryData].recentVotes.map((vote, index) => (
                        <li key={index} className="text-gray-600">
                          <span className="font-medium">{vote.title}</span>
                          <br />
                          <span className="text-sm">
                            {vote.date} - {vote.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Population</h3>
                    <p className="text-gray-600">
                      {mockCountryData[selectedCountry as keyof typeof mockCountryData].population}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
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
  );
} 