import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { chatbotScenarios } from '../../data/mockData';

const ChatbotMgmt = () => {
  const colors = {
    primary: '#1B3A5C',
    secondary: '#2E75B6',
    success: '#27AE60',
    warning: '#E67E22',
    error: '#E74C3C',
    bg: '#F8F9FA',
    surface: '#FFFFFF',
    txt: '#333333',
    sub: '#666666',
    border: '#CCCCCC',
  };

  const [activeTab, setActiveTab] = useState(0);
  const [editedScenarios, setEditedScenarios] = useState(chatbotScenarios);
  const [saved, setSaved] = useState(false);

  const handleSolutionChange = (productIdx, symptomIdx, newValue) => {
    const newScenarios = [...editedScenarios];
    newScenarios[productIdx].symptoms[symptomIdx].solution = newValue;
    setEditedScenarios(newScenarios);
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    console.log('시나리오 저장:', editedScenarios);
  };

  const currentProduct = editedScenarios[activeTab];

  return (
    <div className="p-6" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.txt }}>
            챗봇 시나리오 관리
          </h1>
          <p style={{ color: colors.sub }} className="text-sm mt-1">
            제품별 증상 해결 솔루션 관리
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white"
          style={{ backgroundColor: colors.secondary }}
        >
          <Save size={18} />
          시나리오 저장
        </button>
      </div>

      {/* Product Tabs */}
      <div
        className="rounded-lg shadow-md mb-6 overflow-hidden"
        style={{ backgroundColor: colors.surface }}
      >
        <div
          className="flex border-b"
          style={{ borderBottomColor: colors.border, borderBottomWidth: '1px' }}
        >
          {editedScenarios.map((product, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className="flex-1 px-4 py-4 font-medium transition-all"
              style={{
                color: activeTab === idx ? colors.secondary : colors.sub,
                borderBottomColor: activeTab === idx ? colors.secondary : 'transparent',
                borderBottomWidth: '2px',
              }}
            >
              {product.productName}
            </button>
          ))}
        </div>
      </div>

      {/* Save Notification */}
      {saved && (
        <div
          className="rounded-lg shadow-md p-4 mb-6 text-center"
          style={{
            backgroundColor: colors.success,
            color: 'white',
          }}
        >
          ✓ 시나리오가 저장되었습니다.
        </div>
      )}

      {/* Symptoms Cards */}
      <div className="grid grid-cols-1 gap-6">
        {currentProduct.symptoms.map((symptom, idx) => (
          <div
            key={idx}
            className="rounded-lg shadow-md p-6"
            style={{ backgroundColor: colors.surface }}
          >
            {/* Symptom Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: colors.secondary }}
                  >
                    {symptom.code}
                  </span>
                </div>
                <h3 className="text-lg font-bold" style={{ color: colors.txt }}>
                  {symptom.name}
                </h3>
              </div>
            </div>

            {/* Solution Textarea */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.txt }}>
                해결 방법
              </label>
              <textarea
                value={editedScenarios[activeTab].symptoms[idx].solution}
                onChange={(e) =>
                  handleSolutionChange(activeTab, idx, e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  borderWidth: '1px',
                  color: colors.txt,
                }}
              />
            </div>

            {/* Video URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.txt }}>
                비디오 URL
              </label>
              <input
                type="text"
                value={symptom.videoUrl}
                disabled
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  borderWidth: '1px',
                  color: colors.sub,
                }}
              />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: colors.bg }}>
              <div>
                <p style={{ color: colors.sub }} className="text-xs mb-1">
                  사용 횟수
                </p>
                <p className="text-lg font-bold" style={{ color: colors.txt }}>
                  {symptom.usageCount}회
                </p>
              </div>
              <div>
                <p style={{ color: colors.sub }} className="text-xs mb-1">
                  해결율
                </p>
                <p className="text-lg font-bold" style={{ color: colors.success }}>
                  {symptom.resolveRate}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Save Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white text-lg"
          style={{ backgroundColor: colors.secondary }}
        >
          <Save size={20} />
          모든 변경사항 저장
        </button>
      </div>
    </div>
  );
};

export default ChatbotMgmt;
