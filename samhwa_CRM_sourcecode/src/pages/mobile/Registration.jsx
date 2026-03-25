import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { products } from '../../data/mockData';

export default function Registration() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [expandedConsent, setExpandedConsent] = useState(null);

  // Step 1: Consent
  const [consents, setConsents] = useState({
    privacy: false,
    marketing: false,
  });

  // Step 2: Info
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    product: '',
    interests: [],
  });

  const [phoneFormatError, setPhoneFormatError] = useState(false);

  // Consent handlers
  const handleMasterConsent = () => {
    const allChecked = consents.privacy && consents.marketing;
    setConsents({
      privacy: !allChecked,
      marketing: !allChecked,
    });
  };

  const handleConsentChange = (key) => {
    setConsents(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Phone format validation
  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    setPhoneFormatError(!/^010-\d{4}-\d{4}$/.test(formatted) && formatted.length > 0);
  };

  // Interest handlers
  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const canProceedStep1 = consents.privacy;
  const canSubmitForm = formData.name && /^010-\d{4}-\d{4}$/.test(formData.phone);

  // Submit form
  const handleSubmit = () => {
    if (canSubmitForm) {
      setCurrentStep(3);
    }
  };

  const handleReset = () => {
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
        <h1 className="text-lg font-bold text-center text-[#1B3A5C]">고객 정보 등록</h1>
        {currentStep < 3 && (
          <div className="mt-3 flex gap-1">
            {[1, 2, 3].map(step => (
              <div
                key={step}
                className={`flex-1 h-1 rounded-full transition ${
                  step <= currentStep ? 'bg-[#2E75B6]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-6">
        {/* Step 1: Consent */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1B3A5C] mb-6">약관 동의</h2>

            {/* Master Consent */}
            <div className="bg-[#F0F4F8] rounded-lg p-4 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.privacy && consents.marketing}
                  onChange={handleMasterConsent}
                  className="w-5 h-5 rounded accent-[#2E75B6]"
                />
                <span className="font-bold text-[#1B3A5C]">전체 동의</span>
              </label>
            </div>

            {/* Privacy Consent */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedConsent(expandedConsent === 'privacy' ? null : 'privacy')}
                className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 text-left">
                  <input
                    type="checkbox"
                    checked={consents.privacy}
                    onChange={() => handleConsentChange('privacy')}
                    className="w-5 h-5 rounded accent-[#2E75B6]"
                    onClick={e => e.stopPropagation()}
                  />
                  <div>
                    <div className="font-semibold text-[#1B3A5C]">
                      개인정보 처리 동의 <span className="text-[#E74C3C]">필수</span>
                    </div>
                  </div>
                </div>
                {expandedConsent === 'privacy' ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedConsent === 'privacy' && (
                <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600 max-h-40 overflow-y-auto">
                  <p className="mb-2 font-semibold">개인정보 처리 방침</p>
                  <p>
                    삼화메디칼은 귀하의 개인정보를 수집하여 다음의 목적으로 이용합니다:
                    - 이벤트 참여 및 사은품 제공
                    - 고객 서비스 제공
                    - 제품 정보 안내
                    - 마케팅 활동
                  </p>
                  <p className="mt-2">
                    본인은 상기 개인정보 처리 방침에 동의합니다.
                  </p>
                </div>
              )}
            </div>

            {/* Marketing Consent */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedConsent(expandedConsent === 'marketing' ? null : 'marketing')}
                className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 text-left">
                  <input
                    type="checkbox"
                    checked={consents.marketing}
                    onChange={() => handleConsentChange('marketing')}
                    className="w-5 h-5 rounded accent-[#2E75B6]"
                    onClick={e => e.stopPropagation()}
                  />
                  <div>
                    <div className="font-semibold text-[#1B3A5C]">
                      마케팅 수신 동의 <span className="text-gray-500 font-normal text-xs">(선택)</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">거부 시 이벤트 혜택 수신 불가</p>
                  </div>
                </div>
                {expandedConsent === 'marketing' ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedConsent === 'marketing' && (
                <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600 max-h-40 overflow-y-auto">
                  <p className="mb-2 font-semibold">마케팅 수신 안내</p>
                  <p>
                    삼화메디칼에서 제공하는 뉴스레터, 프로모션, 신제품 정보 등을 받으실 수 있습니다.
                  </p>
                </div>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedStep1}
              className={`w-full font-bold py-3 rounded-lg mt-6 transition ${
                canProceedStep1
                  ? 'bg-[#1B3A5C] text-white hover:bg-[#152a47]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              다음
            </button>
          </div>
        )}

        {/* Step 2: Form */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1B3A5C] mb-6">정보 입력</h2>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-[#1B3A5C] mb-2">
                성명 <span className="text-[#E74C3C]">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E75B6]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-[#1B3A5C] mb-2">
                연락처 <span className="text-[#E74C3C]">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="010-0000-0000"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                  phoneFormatError && formData.phone
                    ? 'border-[#E74C3C] focus:border-[#E74C3C]'
                    : 'border-gray-300 focus:border-[#2E75B6]'
                }`}
              />
              {phoneFormatError && formData.phone && (
                <p className="text-xs text-[#E74C3C] mt-1">올바른 휴대폰 번호 형식입니다: 010-0000-0000</p>
              )}
            </div>

            {/* Product Select */}
            <div>
              <label className="block text-sm font-semibold text-[#1B3A5C] mb-2">보유 제품</label>
              <select
                value={formData.product}
                onChange={e => setFormData(prev => ({ ...prev, product: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E75B6] appearance-none"
              >
                <option value="">선택하세요</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
                <option value="none">없음</option>
              </select>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-semibold text-[#1B3A5C] mb-3">관심 분야</label>
              <div className="grid grid-cols-2 gap-2">
                {['무릎', '발목', '허리', '전신'].map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      formData.interests.includes(interest)
                        ? 'bg-[#2E75B6] text-white'
                        : 'bg-gray-100 text-[#1B3A5C] hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmitForm}
              className={`w-full font-bold py-3 rounded-lg mt-6 transition ${
                canSubmitForm
                  ? 'bg-[#1B3A5C] text-white hover:bg-[#152a47]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              등록하기
            </button>
          </div>
        )}

        {/* Step 3: Completion */}
        {currentStep === 3 && (
          <div className="text-center py-12">
            {/* Success Checkmark */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#27AE60] flex items-center justify-center animate-pulse">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#1B3A5C] mb-4">
              등록이 완료되었습니다!
            </h2>

            <div className="space-y-3 text-sm text-gray-600 mb-8">
              <p>
                <span className="block font-semibold text-[#1B3A5C] mb-2">📱 카카오톡 채널 친구 추가</span>
                친구 추가를 확인해 주세요. 특별한 혜택 정보를 먼저 받아보실 수 있습니다.
              </p>
              <p>
                <span className="block font-semibold text-[#1B3A5C] mb-2">🎁 사은품 수령</span>
                사은품은 삼화메디칼 부스에서 수령해 주세요.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-[#1B3A5C] text-white font-bold py-3 rounded-lg hover:bg-[#152a47] transition"
            >
              처음으로
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
