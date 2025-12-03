import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import statesTopo from 'us-atlas/states-10m.json';

// FIPS to USPS code and name mapping (official codes)
const FIPS_TO_CODE = {
  1: 'AL', 2: 'AK', 4: 'AZ', 5: 'AR', 6: 'CA', 8: 'CO', 9: 'CT', 10: 'DE', 11: 'DC', 12: 'FL',
  13: 'GA', 15: 'HI', 16: 'ID', 17: 'IL', 18: 'IN', 19: 'IA', 20: 'KS', 21: 'KY', 22: 'LA', 23: 'ME',
  24: 'MD', 25: 'MA', 26: 'MI', 27: 'MN', 28: 'MS', 29: 'MO', 30: 'MT', 31: 'NE', 32: 'NV', 33: 'NH',
  34: 'NJ', 35: 'NM', 36: 'NY', 37: 'NC', 38: 'ND', 39: 'OH', 40: 'OK', 41: 'OR', 42: 'PA', 44: 'RI',
  45: 'SC', 46: 'SD', 47: 'TN', 48: 'TX', 49: 'UT', 50: 'VT', 51: 'VA', 53: 'WA', 54: 'WV', 55: 'WI', 56: 'WY'
};

const FIPS_TO_NAME = {
  1: 'Alabama', 2: 'Alaska', 4: 'Arizona', 5: 'Arkansas', 6: 'California', 8: 'Colorado', 9: 'Connecticut', 10: 'Delaware', 11: 'District of Columbia', 12: 'Florida',
  13: 'Georgia', 15: 'Hawaii', 16: 'Idaho', 17: 'Illinois', 18: 'Indiana', 19: 'Iowa', 20: 'Kansas', 21: 'Kentucky', 22: 'Louisiana', 23: 'Maine',
  24: 'Maryland', 25: 'Massachusetts', 26: 'Michigan', 27: 'Minnesota', 28: 'Mississippi', 29: 'Missouri', 30: 'Montana', 31: 'Nebraska', 32: 'Nevada', 33: 'New Hampshire',
  34: 'New Jersey', 35: 'New Mexico', 36: 'New York', 37: 'North Carolina', 38: 'North Dakota', 39: 'Ohio', 40: 'Oklahoma', 41: 'Oregon', 42: 'Pennsylvania', 44: 'Rhode Island',
  45: 'South Carolina', 46: 'South Dakota', 47: 'Tennessee', 48: 'Texas', 49: 'Utah', 50: 'Vermont', 51: 'Virginia', 53: 'Washington', 54: 'West Virginia', 55: 'Wisconsin', 56: 'Wyoming'
};

const ElectionMap = ({ electionData, onStateClick, selectedState }) => {
  const [hovered, setHovered] = useState(null);

  const projection = useMemo(() => geoAlbersUsa().scale(1000).translate([650 / 2, 480 / 2]), []);
  const path = useMemo(() => geoPath(projection), [projection]);
  const states = useMemo(() => feature(statesTopo, statesTopo.objects.states).features, []);

  const codeFor = (fips) => FIPS_TO_CODE[fips];
  const nameFor = (fips) => FIPS_TO_NAME[fips];

  const getStateColor = (code) => {
    const data = electionData?.[code];
    if (!data) return '#374151';
    const { democrat = 0, republican = 0, called = false } = data;
    const total = democrat + republican;
    if (total === 0) return '#374151';
    const demPercent = (democrat / total) * 100;
    const repPercent = (republican / total) * 100;
    if (called) return demPercent > repPercent ? '#2563eb' : '#dc2626';
    if (Math.abs(demPercent - repPercent) > 5) return demPercent > repPercent ? '#60a5fa' : '#f87171';
    return '#a855f7';
  };

  const getStats = (code, fips) => {
    const data = electionData?.[code];
    if (!data) return null;
    const { democrat = 0, republican = 0, called = false, reporting = 0 } = data;
    const total = democrat + republican;
    const demPercent = total > 0 ? ((democrat / total) * 100).toFixed(1) : 0;
    const repPercent = total > 0 ? ((republican / total) * 100).toFixed(1) : 0;
    return {
      name: nameFor(fips) || code,
      democrat,
      republican,
      demPercent,
      repPercent,
      called,
      reporting,
      total,
    };
  };

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 650 480" className="w-full h-full" style={{ maxHeight: '700px' }}>
        <rect x="0" y="0" width="650" height="480" fill="#0f172a" />
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="650" height="480" fill="url(#oceanGradient)" opacity="0.5" />

        {states.map((feat) => {
          const fips = +feat.id;
          const code = codeFor(fips);
          if (!code) return null;
          const d = path(feat);
          const isSelected = selectedState === code;
          const isHovered = hovered === code;
          return (
            <motion.path
              key={code}
              d={d || ''}
              fill={getStateColor(code)}
              stroke={isSelected ? '#fbbf24' : isHovered ? '#fff' : '#334155'}
              strokeWidth={isSelected ? 2.5 : isHovered ? 1.5 : 0.8}
              className="cursor-pointer transition-all"
              whileHover={{ scale: 1.01, filter: 'brightness(1.2)' }}
              onMouseEnter={() => setHovered(code)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onStateClick?.(code)}
            />
          );
        })}

        {/* Abbreviation labels at centroids */}
        {states.map((feat) => {
          const fips = +feat.id;
          const code = codeFor(fips);
          if (!code) return null;
          const [cx, cy] = path.centroid(feat);
          if (!isFinite(cx) || !isFinite(cy)) return null;
          const small = ['RI', 'DE', 'DC'];
          return (
            <text
              key={`label-${code}`}
              x={cx}
              y={cy}
              fill="white"
              fontSize={small.includes(code) ? '8' : '10'}
              fontWeight="600"
              textAnchor="middle"
              pointerEvents="none"
              opacity={0.95}
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
            >
              {code}
            </text>
          );
        })}
      </svg>

      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl z-10"
        >
          {(() => {
            const fips = Object.keys(FIPS_TO_CODE).find((k) => FIPS_TO_CODE[k] === hovered);
            const stats = getStats(hovered, Number(fips));
            if (!stats) return <div className="text-white">No data</div>;
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-white">{stats.name}</h3>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-8">
                    <span className="text-blue-400 font-medium">Democrat</span>
                    <span className="text-white font-bold">{stats.demPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-8">
                    <span className="text-red-400 font-medium">Republican</span>
                    <span className="text-white font-bold">{stats.repPercent}%</span>
                  </div>
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

export default ElectionMap;
