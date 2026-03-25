import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { products } from '../../data/mockData';

const INITIAL_MESSAGES = [
  {
    type: 'bot',
    text: '안녕하세요! 삼화메디칼 AS 챗봇입니다. 어떤 제품에 대해 문의하시나요?',
  },
];

export default function Chatbot() {
  const { productId: _productId } = useParams();
  const [step, setStep] = useState('welcome');
  const [messages, setMessages] = useState(() => INITIAL_MESSAGES);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setMessages(prev => [
      ...prev,
      { type: 'user', text: product.name },
      {
        type: 'bot',
        text: `${product.name} 선택됨. 어떤 증상이 있으신가요?`,
      },
    ]);
    setStep('selectSymptom');
  };

  const handleSymptomSelect = (symptom) => {
    setMessages(prev => [
      ...prev,
      { type: 'user', text: symptom.name },
      {
        type: 'bot',
        text: symptom.solution,
        showResolutionButtons: true,
      },
    ]);
    setStep('solution');
  };

  const handleResolved = () => {
    setMessages(prev => [
      ...prev,
      {
        type: 'bot',
        text: '감사합니다! 도움이 되셨다니 기쁩니다. 😊',
        showHomeButton: true,
      },
    ]);
    setStep('resolved');
  };

  const handleNotResolved = () => {
    setMessages(prev => [
      ...prev,
      {
        type: 'bot',
        text: '고객센터로 연결해 드리겠습니다.',
        showEscalate: true,
      },
    ]);
    setStep('escalate');
  };

  const handleReset = () => {
    setMessages([...INITIAL_MESSAGES]);
    setStep('welcome');
    setSelectedProduct(null);
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 text-center font-bold text-gray-800">
        삼화메디칼 AS 챗봇
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx}>
            {msg.type === 'bot' ? (
              <div className="flex justify-start">
                <div className="bg-[#F0F4F8] text-gray-800 px-4 py-3 rounded-b-lg rounded-tr-lg max-w-xs">
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="bg-[#2E75B6] text-white px-4 py-3 rounded-b-lg rounded-tl-lg max-w-xs">
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            )}

            {/* Resolution Buttons */}
            {msg.showResolutionButtons && (
              <div className="flex justify-start mt-3 gap-2">
                <button
                  onClick={handleResolved}
                  className="flex-1 bg-white border-2 border-[#2E75B6] text-[#2E75B6] font-semibold py-3 rounded-lg hover:bg-blue-50 transition"
                >
                  해결됨
                </button>
                <button
                  onClick={handleNotResolved}
                  className="flex-1 bg-white border-2 border-[#E74C3C] text-[#E74C3C] font-semibold py-3 rounded-lg hover:bg-red-50 transition"
                >
                  미해결
                </button>
              </div>
            )}

            {/* Escalate Info */}
            {msg.showEscalate && (
              <div className="flex justify-start mt-3 space-y-2">
                <div className="w-full">
                  <a
                    href="tel:1551-1346"
                    className="block w-full bg-white border-2 border-[#2E75B6] text-[#2E75B6] font-semibold py-3 rounded-lg text-center hover:bg-blue-50 transition"
                  >
                    📞 고객센터 1551-1346
                  </a>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    평일 09:00~18:00 | 점심 12:00~13:00
                  </p>
                </div>
              </div>
            )}

            {/* Home Button */}
            {msg.showHomeButton && (
              <div className="flex justify-start mt-3">
                <button
                  onClick={handleReset}
                  className="w-full bg-white border-2 border-[#2E75B6] text-[#2E75B6] font-semibold py-3 rounded-lg hover:bg-blue-50 transition"
                >
                  처음으로
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        {step === 'welcome' && (
          <div className="space-y-2">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className="w-full bg-white border-2 border-[#2E75B6] text-[#2E75B6] font-semibold py-3 rounded-lg hover:bg-blue-50 transition"
              >
                {product.name}
              </button>
            ))}
          </div>
        )}

        {step === 'selectSymptom' && selectedProduct && (
          <div className="space-y-2">
            {selectedProduct.symptoms.map(symptom => (
              <button
                key={symptom.code}
                onClick={() => handleSymptomSelect(symptom)}
                className="w-full bg-white border-2 border-[#2E75B6] text-[#2E75B6] font-semibold py-3 rounded-lg hover:bg-blue-50 transition text-sm"
              >
                {symptom.name}
              </button>
            ))}
          </div>
        )}

        {(step === 'resolved' || step === 'escalate') && (
          <button
            onClick={handleReset}
            className="w-full bg-white border-2 border-[#2E75B6] text-[#2E75B6] font-semibold py-3 rounded-lg hover:bg-blue-50 transition"
          >
            처음으로
          </button>
        )}
      </div>
    </div>
  );
}
