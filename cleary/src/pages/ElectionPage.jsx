import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ElectionMap from '../components/ElectionMap';
import CityMap from '../components/CityMap';
import { TrendingUp, MapPin, Users, Clock, Building2, Landmark, Sun, Moon } from '../components/Icons';
import { useTheme } from '../contexts/ThemeContext';

const ElectionPage = () => {
  const navigate = useNavigate();
  const [electionData, setElectionData] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeElections, setActiveElections] = useState([]);
  const [electionType, setElectionType] = useState('presidential');
  const { theme, toggle } = useTheme();

  // Fetch active elections once on mount
  useEffect(() => {
    fetchActiveElections();
  }, []);

  // Define fetchElectionResults BEFORE useEffect that calls it to satisfy ESLint no-use-before-define
  const fetchElectionResults = useCallback(async () => {
    try {
      const response = await fetch(`/api/election-results?type=${electionType}`);
      const data = await response.json();
      setElectionData(data);
      // Auto-select first city for mayoral so the map shows immediately
      if (electionType === 'mayoral' && data?.cities) {
        const cityNames = Object.keys(data.cities);
        if (cityNames.length > 0) {
          if (!selectedCity || !data.cities[selectedCity]) {
            setSelectedCity(cityNames[0]);
            setSelectedDistrict(null);
          }
        }
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch election results:', error);
    }
  }, [electionType, selectedCity]);

  // Fetch election results when type or active elections change
  useEffect(() => {
    if (activeElections.length > 0) {
      fetchElectionResults();
      const interval = setInterval(fetchElectionResults, 30000);
      return () => clearInterval(interval);
    }
  }, [electionType, activeElections, fetchElectionResults]);

  const fetchActiveElections = async () => {
    try {
      const response = await fetch('/api/elections/active');
      const data = await response.json();
      setActiveElections(data.activeElections || []);
      
      // Set default election type to first active election
      if (data.activeElections && data.activeElections.length > 0) {
        setElectionType(data.activeElections[0].type);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch active elections:', error);
      setLoading(false);
    }
  };

  // (fetchElectionResults moved above for ESLint compliance)

  const handleStateClick = (stateCode) => {
    setSelectedState(stateCode === selectedState ? null : stateCode);
  };

  const handleDistrictClick = (districtName) => {
    setSelectedDistrict(districtName === selectedDistrict ? null : districtName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg">Loading election results...</p>
        </div>
      </div>
    );
  }

  if (activeElections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Landmark className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Active Elections</h2>
            <p className="text-gray-400">
              There are currently no active elections. Check back during election periods to see live results.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const getElectionIcon = (type) => {
    switch (type) {
      case 'gubernatorial': return <Landmark className="w-5 h-5" />;
      case 'mayoral': return <Building2 className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getElectionTitle = (type) => {
    switch (type) {
      case 'gubernatorial': return 'Gubernatorial Elections';
      case 'mayoral': return 'Mayoral Elections';
      default: return 'Presidential Election';
    }
  };

  const demEV = electionData?.totals?.democrat?.ev || 0;
  const repEV = electionData?.totals?.republican?.ev || 0;
  const demVotes = electionData?.totals?.democrat?.votes || 0;
  const repVotes = electionData?.totals?.republican?.votes || 0;
  const demCandidate = electionData?.totals?.democrat?.candidate || 'Democrat';
  const repCandidate = electionData?.totals?.republican?.candidate || 'Republican';
  const isPresidential = electionType === 'presidential';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back/Home navigation */}
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700"
              >
                Back
              </button>
              <button
                onClick={() => navigate('/feed')}
                className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700"
              >
                Home
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
                {getElectionIcon(electionType)}
                {getElectionTitle(electionType)}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggle}
                className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200 flex items-center gap-2"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
                <span className="hidden md:inline">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
              </motion.button>

              {/* Election Type Selector */}
              {activeElections.length > 1 && (
                <div className="flex gap-2">
                  {activeElections.map((election) => (
                    <motion.button
                      key={election.type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setElectionType(election.type);
                        setSelectedState(null);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        electionType === election.type
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getElectionIcon(election.type)}
                        <span className="capitalize">{election.type}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchElectionResults}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                Refresh
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Electoral Vote Counter - Presidential only */}
        {isPresidential && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Democrat */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-blue-400">{demCandidate}</h3>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-1">{demEV}</div>
                <div className="text-sm text-gray-400">Electoral Votes</div>
                <div className="text-xs text-gray-500 mt-2">
                  {(demVotes / 1000000).toFixed(1)}M votes
                </div>
              </motion.div>

              {/* Needed to Win */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 flex flex-col items-center justify-center"
              >
                <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
                  270
                </div>
                <div className="text-sm text-gray-400">Electoral Votes Needed</div>
                <div className="text-xs text-gray-500 mt-1">
                  out of {electionData?.totalEV || 538}
                </div>
              </motion.div>

              {/* Republican */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-red-400">{repCandidate}</h3>
                  <Users className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-1">{repEV}</div>
                <div className="text-sm text-gray-400">Electoral Votes</div>
                <div className="text-xs text-gray-500 mt-2">
                  {(repVotes / 1000000).toFixed(1)}M votes
                </div>
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-800/50 rounded-full h-4 overflow-hidden mb-8 border border-gray-700">
              <div className="flex h-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(demEV / 538) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="bg-blue-600"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(repEV / 538) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="bg-red-600"
                />
              </div>
            </div>

            {/* Map and State Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  Interactive Map
                </h2>
                <ElectionMap
                  electionData={electionData?.states}
                  onStateClick={handleStateClick}
                  selectedState={selectedState}
                />
                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded" />
                    <span className="text-gray-300">Democrat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded" />
                    <span className="text-gray-300">Republican</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded" />
                    <span className="text-gray-300">Toss-up</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-400 rounded" />
                    <span className="text-gray-300">Leading</span>
                  </div>
                </div>
              </motion.div>

              {/* State Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  {selectedState ? `${selectedState} Details` : 'Key Races'}
                </h2>
                
                {selectedState && electionData?.states?.[selectedState] ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-400 font-medium">{demCandidate}</span>
                        <span className="text-white font-bold">
                          {((electionData.states[selectedState].democrat / 
                            (electionData.states[selectedState].democrat + electionData.states[selectedState].republican)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(electionData.states[selectedState].democrat / 
                              (electionData.states[selectedState].democrat + electionData.states[selectedState].republican)) * 100}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        {electionData.states[selectedState].democrat.toLocaleString()} votes
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-red-400 font-medium">{repCandidate}</span>
                        <span className="text-white font-bold">
                          {((electionData.states[selectedState].republican / 
                            (electionData.states[selectedState].democrat + electionData.states[selectedState].republican)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${(electionData.states[selectedState].republican / 
                              (electionData.states[selectedState].democrat + electionData.states[selectedState].republican)) * 100}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        {electionData.states[selectedState].republican.toLocaleString()} votes
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Reporting</span>
                        <span className="text-white font-medium">
                          {electionData.states[selectedState].reporting}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Status</span>
                        <span className={`font-medium ${
                          electionData.states[selectedState].called 
                            ? 'text-yellow-400' 
                            : 'text-gray-400'
                        }`}>
                          {electionData.states[selectedState].called ? '✓ Called' : 'Counting'}
                        </span>
                      </div>
                      {electionData.states[selectedState].called && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Winner</span>
                          <span className={`font-bold ${
                            electionData.states[selectedState].winner === 'democrat' 
                              ? 'text-blue-400' 
                              : 'text-red-400'
                          }`}>
                            {electionData.states[selectedState].winner === 'democrat' ? demCandidate : repCandidate}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm mb-4">
                      Click on a state to see detailed results
                    </p>
                    {/* Show swing states */}
                    {['PA', 'GA', 'MI', 'NC', 'WI', 'AZ', 'NV'].map((state) => {
                      const data = electionData?.states?.[state];
                      if (!data) return null;
                      
                      const total = data.democrat + data.republican;
                      const demPercent = ((data.democrat / total) * 100).toFixed(1);
                      const repPercent = ((data.republican / total) * 100).toFixed(1);
                      const leader = data.democrat > data.republican ? 'D' : 'R';
                      const margin = Math.abs(demPercent - repPercent).toFixed(1);
                      
                      return (
                        <div 
                          key={state}
                          className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                          onClick={() => setSelectedState(state)}
                        >
                          <div>
                            <span className="font-bold text-white">{state}</span>
                            <span className="text-xs text-gray-400 ml-2">{data.reporting}%</span>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${leader === 'D' ? 'text-blue-400' : 'text-red-400'}`}>
                              {leader} +{margin}
                            </div>
                            <div className="text-xs text-gray-400">
                              {data.called ? '✓ Called' : 'Leading'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* Gubernatorial Results */}
        {electionType === 'gubernatorial' && electionData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(electionData.states || {}).map(([stateCode, data]) => {
              const total = data.democrat.votes + data.republican.votes;
              const demPercent = ((data.democrat.votes / total) * 100).toFixed(1);
              const repPercent = ((data.republican.votes / total) * 100).toFixed(1);
              
              return (
                <motion.div
                  key={stateCode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{stateCode}</h3>
                      <p className="text-sm text-gray-400">{data.reporting}% reporting</p>
                    </div>
                    {data.called && (
                      <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full">
                        ✓ Called
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Democrat */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-400 font-medium">{data.democrat.candidate}</span>
                        <span className="text-white font-bold">{demPercent}%</span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${data.winner === 'democrat' ? 'bg-blue-600' : 'bg-blue-400'}`}
                          style={{ width: `${demPercent}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        {data.democrat.votes.toLocaleString()} votes
                      </div>
                    </div>

                    {/* Republican */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-red-400 font-medium">{data.republican.candidate}</span>
                        <span className="text-white font-bold">{repPercent}%</span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${data.winner === 'republican' ? 'bg-red-600' : 'bg-red-400'}`}
                          style={{ width: `${repPercent}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        {data.republican.votes.toLocaleString()} votes
                      </div>
                    </div>

                    {data.called && data.winner && (
                      <div className="pt-4 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Winner:</span>
                          <span className={`font-bold ${data.winner === 'democrat' ? 'text-blue-400' : 'text-red-400'}`}>
                            {data.winner === 'democrat' ? data.democrat.candidate : data.republican.candidate}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Mayoral Results */}
        {electionType === 'mayoral' && electionData && (
          <div>
            {/* City Selector */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                Select City
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.keys(electionData.cities || {}).map((cityName) => (
                  <motion.button
                    key={cityName}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedCity(cityName === selectedCity ? null : cityName);
                      setSelectedDistrict(null);
                    }}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      selectedCity === cityName
                        ? 'bg-purple-600 text-white border-2 border-purple-400'
                        : 'bg-gray-800/50 text-gray-300 border border-gray-700 hover:border-purple-500'
                    }`}
                  >
                    {cityName}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* City Map and District Details */}
            {selectedCity && electionData.cities[selectedCity] && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* District Map */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                >
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    {selectedCity} Districts
                  </h2>
                  <CityMap
                    cityName={selectedCity}
                    districtResults={electionData.cities[selectedCity].districts}
                    onDistrictClick={handleDistrictClick}
                    selectedDistrict={selectedDistrict}
                  />
                  <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded" />
                      <span className="text-gray-300">Democrat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-600 rounded" />
                      <span className="text-gray-300">Republican</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-600 rounded" />
                      <span className="text-gray-300">Independent / Toss-up</span>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-xs text-gray-500">
                    Data sources may differ across outlets. Results update on refresh.
                  </div>
                </motion.div>

                {/* District Details Panel */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                >
                  {selectedDistrict ? (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{selectedDistrict}</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        {electionData.cities[selectedCity].districts[selectedDistrict]?.reporting}% reporting
                      </p>

                      {(() => {
                        const districtData = electionData.cities[selectedCity].districts[selectedDistrict];
                        if (!districtData) return null;

                        const candidates = [];
                        if (districtData.democrat) candidates.push({ ...districtData.democrat, party: 'Democrat', color: 'blue' });
                        if (districtData.republican) candidates.push({ ...districtData.republican, party: 'Republican', color: 'red' });
                        if (districtData.independent) candidates.push({ ...districtData.independent, party: 'Independent', color: 'purple' });

                        const total = candidates.reduce((sum, c) => sum + c.votes, 0);
                        candidates.forEach(c => c.percent = ((c.votes / total) * 100).toFixed(1));
                        candidates.sort((a, b) => b.votes - a.votes);

                        return (
                          <div className="space-y-4">
                            {candidates.map((candidate) => {
                              const isWinner = districtData.winner && (
                                (districtData.winner === 'democrat' && candidate.party === 'Democrat') ||
                                (districtData.winner === 'republican' && candidate.party === 'Republican') ||
                                (districtData.winner === 'independent' && candidate.party === 'Independent')
                              );
                              const colorTextClass = candidate.color === 'blue'
                                ? 'text-blue-400'
                                : candidate.color === 'red'
                                ? 'text-red-400'
                                : 'text-purple-400';
                              const barClass = candidate.color === 'blue'
                                ? 'bg-blue-600'
                                : candidate.color === 'red'
                                ? 'bg-red-600'
                                : 'bg-purple-600';

                              return (
                                <div key={candidate.candidate} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className={`${colorTextClass} font-medium`}>
                                        {candidate.candidate}
                                        {isWinner && ' ✓'}
                                      </span>
                                      <span className="text-gray-500 text-sm ml-2">({candidate.party})</span>
                                    </div>
                                    <span className="text-white font-bold">{candidate.percent}%</span>
                                  </div>
                                  <div className="bg-gray-700 rounded-full h-3">
                                    <div
                                      className={`h-3 rounded-full ${barClass}`}
                                      style={{ width: `${candidate.percent}%` }}
                                    />
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {candidate.votes.toLocaleString()} votes
                                  </div>
                                </div>
                              );
                            })}

                            {districtData.called && (
                              <div className="mt-6 pt-4 border-t border-gray-700">
                                <div className="px-3 py-2 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg text-center">
                                  ✓ District Called
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a district on the map to view detailed results</p>
                    </div>
                  )}
                </motion.div>

                {/* City Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-3 bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                >
                  <h3 className="text-lg font-bold text-white mb-4">
                    City-wide Summary for {selectedCity}
                  </h3>
                  {(() => {
                    const cityData = electionData.cities[selectedCity];
                    const districts = cityData.districts || {};
                    
                    // Calculate city-wide totals
                    const totals = { democrat: 0, republican: 0, independent: 0 };
                    Object.values(districts).forEach(district => {
                      if (district.democrat) totals.democrat += district.democrat.votes;
                      if (district.republican) totals.republican += district.republican.votes;
                      if (district.independent) totals.independent += district.independent.votes;
                    });

                    const grandTotal = totals.democrat + totals.republican + totals.independent;
                    const candidates = [];
                    if (totals.democrat > 0 && cityData.candidates?.democrat) {
                      candidates.push({
                        candidate: cityData.candidates.democrat,
                        party: 'Democrat',
                        votes: totals.democrat,
                        percent: ((totals.democrat / grandTotal) * 100).toFixed(1),
                        color: 'blue'
                      });
                    }
                    if (totals.republican > 0 && cityData.candidates?.republican) {
                      candidates.push({
                        candidate: cityData.candidates.republican,
                        party: 'Republican',
                        votes: totals.republican,
                        percent: ((totals.republican / grandTotal) * 100).toFixed(1),
                        color: 'red'
                      });
                    }
                    if (totals.independent > 0 && cityData.candidates?.independent) {
                      candidates.push({
                        candidate: cityData.candidates.independent,
                        party: 'Independent',
                        votes: totals.independent,
                        percent: ((totals.independent / grandTotal) * 100).toFixed(1),
                        color: 'purple'
                      });
                    }
                    candidates.sort((a, b) => b.votes - a.votes);

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {candidates.map((candidate) => {
                          const bgClass = candidate.color === 'blue'
                            ? 'from-blue-600/20 to-blue-800/20 border-blue-500/30'
                            : candidate.color === 'red'
                            ? 'from-red-600/20 to-red-800/20 border-red-500/30'
                            : 'from-purple-600/20 to-purple-800/20 border-purple-500/30';
                          const textClass = candidate.color === 'blue'
                            ? 'text-blue-400'
                            : candidate.color === 'red'
                            ? 'text-red-400'
                            : 'text-purple-400';

                          return (
                            <div
                              key={candidate.candidate}
                              className={`bg-gradient-to-br ${bgClass} border rounded-lg p-4`}
                            >
                              <div className={`text-sm font-medium ${textClass} mb-1`}>
                                {candidate.candidate}
                              </div>
                              <div className="text-xs text-gray-500 mb-2">{candidate.party}</div>
                              <div className="text-2xl font-bold text-white mb-1">
                                {candidate.percent}%
                              </div>
                              <div className="text-xs text-gray-400">
                                {candidate.votes.toLocaleString()} votes
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </motion.div>
              </div>
            )}

            {/* No city selected */}
            {!selectedCity && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800/50 rounded-xl p-12 border border-gray-700 text-center"
              >
                <Building2 className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg">
                  Select a city above to view district-level results
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div> {/* Close main content container */}
    </div>
  );
}

export default ElectionPage;