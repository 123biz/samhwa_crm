import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!supabase) { setError('Supabase 연결 오류: 환경 변수를 확인해주세요.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(`로그인 실패: ${error.message}`);
      else navigate('/admin', { replace: true });
    } catch (e) {
      setError(`오류: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) { setError('이메일을 먼저 입력해주세요.'); return; }
    await supabase.auth.resetPasswordForEmail(email);
    setResetSent(true);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🏥</span>
          <h1 className="text-xl font-bold mt-2" style={{ color: '#1B3A5C' }}>삼화메디칼 CRM</h1>
          <p className="text-sm mt-1" style={{ color: '#888888' }}>관리자 로그인</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg outline-none text-sm"
              style={{ border: '1px solid #CCCCCC', color: '#333333' }}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg outline-none text-sm"
              style={{ border: '1px solid #CCCCCC', color: '#333333' }}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs" style={{ color: '#E74C3C' }}>{error}</p>}
          {resetSent && <p className="text-xs" style={{ color: '#27AE60' }}>비밀번호 재설정 메일을 발송했습니다.</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-semibold text-white text-sm cursor-pointer"
            style={{ backgroundColor: '#2E75B6', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <button
          onClick={handleReset}
          className="w-full mt-3 text-xs bg-transparent border-0 cursor-pointer"
          style={{ color: '#888888' }}
        >
          비밀번호를 잊으셨나요?
        </button>
      </div>
    </div>
  );
}
