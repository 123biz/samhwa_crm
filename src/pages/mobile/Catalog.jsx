import { useSearchParams } from 'react-router-dom';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || 'UNKNOWN';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA]">
      <div className="bg-gradient-to-br from-[#1B3A5C] to-[#2E75B6] px-4 py-10 text-center text-white">
        <h1 className="text-3xl font-bold mb-2">카탈로그 페이지</h1>
        <p className="text-sm text-blue-100">배너 QR 테스트용 랜딩</p>
      </div>

      <div className="px-4 py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500 mb-2">유입 source</p>
          <p className="text-base font-bold text-[#1B3A5C] break-all">{source}</p>
        </div>
      </div>
    </div>
  );
}
