'use client';

import { useState } from 'react';

export default function Home() {
  const [image, setImage] = useState(null);
  const [mood, setMood] = useState('');
  const [brands, setBrands] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);

  // 画像選択時に自動でリサイズ・圧縮する処理
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG形式で圧縮
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setImage(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!image) return;
    setLoading(true);
    setError(false);
    setResult(null);

    try {
      const res = await fetch('/api/palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          mediaType: 'image/jpeg',
          mood,
          brands,
        }),
      });

      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', color: '#333' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>ぬい配色プランナー</h1>
      <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
        線画・未着色のぬいデザインから配色案と刺繍糸の番号候補を提案します
      </p>

      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>デザイン画像</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%' }} />
          {image && (
            <img src={image} alt="Preview" style={{ width: '100%', marginTop: '10px', borderRadius: '8px', maxHeight: '300px', objectFit: 'contain' }} />
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>イメージ・雰囲気(任意)</label>
          <input
            type="text"
            placeholder="例: パステル, レトロ, ゆめかわ"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>使いたい糸ブランド(任意・複数可)</label>
          <input
            type="text"
            placeholder="例: DMC, コスモ, オリンパス (空欄なら3社とも)"
            value={brands}
            onChange={(e) => setBrands(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!image || loading}
          style={{
            padding: '12px',
            background: !image || loading ? '#ccc' : '#d87093',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: image && !loading ? 'pointer' : 'default',
          }}
        >
          {loading ? '提案を作成中...' : '配色を提案してもらう'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#fff0f0', border: '1px solid #ffccd5', borderRadius: '8px', color: '#c00', fontSize: '14px' }}>
          提案の取得に失敗しました。もう一度お試しいただくか、環境変数(APIキー)の設定をご確認ください。
        </div>
      )}

      {result && result.palettes && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {result.palettes.map((palette, idx) => (
            <div key={idx} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '12px', padding: '16px' }}>
              <h2 style={{ fontSize: '16px', margin: '0 0 4px 0', color: '#d87093' }}>{palette.name}</h2>
              <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px 0' }}>{palette.mood}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {palette.parts.map((p, pIdx) => (
                  <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f9f9f9', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: p.hex, border: '1px solid #ccc', flexShrink: 0 }} />
                    <div style={{ flexGrow: 1, fontSize: '13px' }}>
                      <span style={{ fontWeight: 'bold' }}>{p.part}</span>
                      <div style={{ fontSize: '11px', color: '#555' }}>糸: {p.threads}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
