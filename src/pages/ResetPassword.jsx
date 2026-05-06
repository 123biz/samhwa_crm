import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 이미 세션이 있으면 바로 활성화
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError('변경에 실패했습니다. 다시 시도해 주세요.'); return; }
    setDone(true);
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🏥</span>
          <h1 className="text-xl font-bold mt-2" style={{ color: '#1B3A5C' }}>비밀번호 재설정</h1>
        </div>

        {done ? (
          <p className="text-center text-sm" style={{ color: '#27AE60' }}>
            비밀번호가 변경되었습니다. 로그인 화면으로 이동합니다...
          </p>
        ) : !ready ? (
          <p className="text-center text-sm" style={{ color: '#888888' }}>인증 링크를 확인하는 중...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>새 비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg outline-none text-sm"
                style={{ border: '1px solid #CCCCCC' }}
                placeholder="6자 이상"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#333333' }}>비밀번호 확인</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg outline-none text-sm"
                style={{ border: '1px solid #CCCCCC' }}
                placeholder="동일하게 입력"
              />
            </div>
            {error && <p className="text-xs" style={{ color: '#E74C3C' }}>{error}</p>}
            <button
              type="submit"
              className="w-full py-2 rounded-lg font-semibold text-white text-sm cursor-pointer"
              style={{ backgroundColor: '#2E75B6' }}
            >
              변경하기
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
