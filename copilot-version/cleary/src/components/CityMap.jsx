import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import countiesTopo from 'us-atlas/counties-10m.json';
import cityDistrictsData from '../data/cityDistricts.json';

const CityMap = ({ cityName, districtResults, onDistrictClick, selectedDistrict }) => {
  const [hovered, setHovered] = useState(null);

  const cityData = cityDistrictsData[cityName];

  // For NYC, use official county (borough) shapes from us-atlas
  const nycBoroughFeatures = useMemo(() => {
    if (cityName !== 'New York') return null;
    try {
      const allCounties = feature(countiesTopo, countiesTopo.objects.counties).features;
      const FIPS_TO_BOROUGH = {
        36061: 'Manhattan',      // New York County
        36047: 'Brooklyn',       // Kings County
        36081: 'Queens',         // Queens County
        36005: 'Bronx',          // Bronx County
        36085: 'Staten Island',  // Richmond County
      };
      const selected = allCounties
        .filter(f => FIPS_TO_BOROUGH[f.id])
        .map(f => ({
          type: 'Feature',
          properties: { district: FIPS_TO_BOROUGH[f.id], name: FIPS_TO_BOROUGH[f.id] },
          geometry: f.geometry,
        }));
      return { type: 'FeatureCollection', features: selected };
    } catch {
      return null;
    }
  }, [cityName]);
  
  const workingFeatureCollection = useMemo(() => {
    if (nycBoroughFeatures) return nycBoroughFeatures;
    if (!cityData || !cityData.features || cityData.features.length === 0) return null;
    return { type: 'FeatureCollection', features: cityData.features };
  }, [nycBoroughFeatures, cityData]);

  const { projection, path } = useMemo(() => {
    if (!workingFeatureCollection || !workingFeatureCollection.features?.length) {
      return { projection: null, path: null };
    }
    // Fit projection to the city FeatureCollection within the SVG viewBox (800x600)
    const proj = geoMercator();
    // Use a small padding by fitting to slightly smaller size
    proj.fitSize([760, 560], workingFeatureCollection).translate([400, 300]);

    return { projection: proj, path: geoPath(proj) };
  }, [workingFeatureCollection]);

  if (!projection || !path) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <p>Map data not available for {cityName}</p>
      </div>
    );
  }

  const getDistrictColor = (districtName) => {
    const result = districtResults?.[districtName];
    if (!result) return '#374151';

    const parties = ['democrat', 'republican', 'independent'].filter(p => result[p]);
    if (parties.length === 0) return '#374151';

    // Find winner
    let winner = parties[0];
    let maxVotes = result[winner].votes;
    parties.forEach(p => {
      if (result[p].votes > maxVotes) {
        maxVotes = result[p].votes;
        winner = p;
      }
    });

    const total = parties.reduce((sum, p) => sum + result[p].votes, 0);
    const winnerPercent = (result[winner].votes / total) * 100;
    const margin = winnerPercent - (100 / parties.length);

    // Color based on winner and margin
    if (result.called) {
      if (winner === 'democrat') return '#2563eb';
      if (winner === 'republican') return '#dc2626';
      if (winner === 'independent') return '#9333ea';
    }

    // Leading but not called
    if (margin > 5) {
      if (winner === 'democrat') return '#60a5fa';
      if (winner === 'republican') return '#f87171';
      if (winner === 'independent') return '#c084fc';
    }

    // Toss-up
    return '#a855f7';
  };

  const getDistrictStats = (districtName) => {
    const result = districtResults?.[districtName];
    if (!result) return null;

    const parties = ['democrat', 'republican', 'independent']
      .filter(p => result[p])
      .map(p => ({
        party: p,
        ...result[p],
        percent: 0
      }));

    const total = parties.reduce((sum, p) => sum + p.votes, 0);
    parties.forEach(p => {
      p.percent = total > 0 ? ((p.votes / total) * 100).toFixed(1) : 0;
    });

    parties.sort((a, b) => b.votes - a.votes);

    return {
      name: districtName,
      parties,
      called: result.called,
      reporting: result.reporting,
      total
    };
  };

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 800 600" className="w-full" style={{ height: '520px' }}>
        <rect x="0" y="0" width="800" height="600" fill="#0f172a" />
        
        <defs>
          <linearGradient id="cityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="800" height="600" fill="url(#cityGradient)" opacity="0.5" />

        {/* Districts */}
        {(workingFeatureCollection?.features || []).map((feature) => {
          const districtName = feature.properties.district;
          const d = path(feature);
          const isSelected = selectedDistrict === districtName;
          const isHovered = hovered === districtName;
          
          return (
            <motion.path
              key={districtName}
              d={d || ''}
              fill={getDistrictColor(districtName)}
              stroke={isSelected ? '#fbbf24' : isHovered ? '#fff' : '#334155'}
              strokeWidth={isSelected ? 2.5 : isHovered ? 1.5 : 0.8}
              className="cursor-pointer transition-all"
              whileHover={{ scale: 1.01, filter: 'brightness(1.2)' }}
              onMouseEnter={() => setHovered(districtName)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onDistrictClick?.(districtName)}
            />
          );
        })}

        {/* District labels */}
        {(workingFeatureCollection?.features || []).map((feature) => {
          const districtName = feature.properties.district;
          const [cx, cy] = path.centroid(feature);
          if (!isFinite(cx) || !isFinite(cy)) return null;

          return (
            <text
              key={`label-${districtName}`}
              x={cx}
              y={cy}
              fill="white"
              fontSize="9"
              fontWeight="600"
              textAnchor="middle"
              pointerEvents="none"
              opacity={0.95}
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
            >
              {districtName}
            </text>
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl z-10 max-w-xs"
        >
          {(() => {
            const stats = getDistrictStats(hovered);
            if (!stats) return <div className="text-white">No data</div>;

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-bold text-white">{stats.name}</h3>
                </div>

                <div className="space-y-1">
                  {stats.parties.map((p) => (
                    <div key={p.party} className="flex items-center justify-between gap-6">
                      <span className={`font-medium capitalize ${
                        p.party === 'democrat' ? 'text-blue-400' :
                        p.party === 'republican' ? 'text-red-400' :
                        'text-purple-400'
                      }`}>
                        {p.candidate}
                      </span>
                      <span className="text-white font-bold">{p.percent}%</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-gray-400 mt-2">
                  {stats.called ? (
                    <span className="text-yellow-400 font-medium">✓ Called</span>
                  ) : (
                    <span>{stats.reporting}% reporting</span>
                  )}
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
};

export default CityMap;
