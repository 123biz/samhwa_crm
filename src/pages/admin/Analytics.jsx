import React from 'react';
import { BarChart3 } from 'lucide-react';

const ConstructionCone = () => (
  <svg width="110" height="130" viewBox="0 0 110 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Base */}
    <rect x="10" y="112" width="90" height="14" rx="5" fill="#888888" />
    {/* Cone body */}
    <polygon points="55,8 18,112 92,112" fill="#FF6B35" />
    {/* White stripe 1 */}
    <polygon points="43,52 67,52 72,68 38,68" fill="white" opacity="0.85" />
    {/* White stripe 2 */}
    <polygon points="30,85 80,85 85,101 25,101" fill="white" opacity="0.85" />
    {/* Top knob */}
    <circle cx="55" cy="8" r="5" fill="#E85A1E" />
  </svg>
);

const Analytics = () => (
  <div
    className="flex flex-col items-center pt-44"
    style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}
  >
    {/* Under Construction badge */}
    <div
      className="flex items-center gap-3 px-6 py-3 rounded-full mb-8 text-xl font-bold"
      style={{ backgroundColor: '#FFF3CD', border: '2px solid #FFC107', color: '#856404' }}
    >
      <span className="text-2xl">🚧</span>
      <span>Under Construction...</span>
    </div>

    {/* Construction cone illustration */}
    <ConstructionCone />

    {/* Page icon + title */}
    <div className="flex items-center gap-2 mt-6 mb-2">
      <BarChart3 size={22} color="#AAAAAA" />
      <h1 className="text-2xl font-bold" style={{ color: '#333333' }}>
        발신 효과 분석
      </h1>
    </div>

    <p className="text-sm" style={{ color: '#888888' }}>
      고객 DB가 충분히 쌓이면 활성화시킬 예정입니다.
    </p>
  </div>
);

export default Analytics;
