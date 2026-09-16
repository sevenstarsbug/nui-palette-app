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
              ...(loading || !base64Image ? styles.buttonDisabled : {}),
            }}
            disabled={loading || !base64Image}
            onClick={handleRun}
          >
            配色を提案してもらう
          </button>
          <div style={styles.status}>{status}</div>
        </div>

        {error && <div style={{ ...styles.card, ...styles.error }}>{error}</div>}

        {results.map((p, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.palette}>
              <h3 style={styles.paletteH3}>{p.name}</h3>
              <div style={styles.paletteMood}>{p.mood}</div>
              {(p.parts || []).map((part, pIdx) => (
                <div key={pIdx} style={styles.swatchrow}>
                  <div style={{ ...styles.swatch, background: part.hex || '#ccc' }} />
                  <div style={styles.partname}>{part.part}</div>
                  <div style={styles.codes}>{part.threads}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p style={styles.note}>
          ※ 提案される糸番号はAIによる近似的な候補です。実際の色味は光源やモニターの発色で変わるため、最終決定の前にお手持ちの色見本帳での確認をおすすめします。
        </p>
      </div>
    </div>
  );
}

const styles = {
  body: {
    minHeight: '100vh',
    background: '#fdf6f0',
    color: '#3d2c2a',
    padding: '20px',
    fontFamily: '"Hiragino Sans", "Yu Gothic", sans-serif',
  },
  wrap: { maxWidth: '640px', margin: '0 auto' },
  h1: { fontSize: '1.3rem', margin: '0 0 4px' },
  sub: { color: '#8a6f6a', fontSize: '0.85rem', margin: '0 0 20px' },
  card: {
    background: '#ffffff',
    border: '1px solid #efe0da',
    borderRadius: '16px',
    padding: '18px',
    marginBottom: '16px',
    boxShadow: '0 2px 10px rgba(60,30,30,0.08)',
  },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px', color: '#8a6f6a' },
  inputText: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #efe0da',
    fontSize: '0.95rem',
    marginBottom: '12px',
    background: '#fffaf8',
    boxSizing: 'border-box',
  },
  drop: {
    border: '2px dashed #efe0da',
    borderRadius: '14px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    color: '#8a6f6a',
    fontSize: '0.9rem',
    position: 'relative',
    overflow: 'hidden',
  },
  dropHasImg: { borderStyle: 'solid', padding: '0' },
  dropImg: { maxWidth: '100%', maxHeight: '280px', display: 'block', margin: '0 auto', borderRadius: '12px' },
  button: {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '12px',
    background: '#d98a9c',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '6px',
  },
  buttonDisabled: { background: '#e3c6cd', cursor: 'default' },
  status: { textAlign: 'center', color: '#8a6f6a', fontSize: '0.85rem', marginTop: '10px', minHeight: '1.2em' },
  palette: { paddingBottom: '4px' },
  paletteH3: { margin: '0 0 4px', fontSize: '1rem' },
  paletteMood: { color: '#8a6f6a', fontSize: '0.82rem', marginBottom: '10px' },
  swatchrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.85rem' },
  swatch: { width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' },
  partname: { width: '78px', flexShrink: 0, color: '#8a6f6a' },
  codes: { flex: 1, lineHeight: 1.5 },
  note: { fontSize: '0.75rem', color: '#8a6f6a', marginTop: '16px', lineHeight: 1.6 },
  error: { color: '#b3413a', fontSize: '0.85rem', textAlign: 'center' },
};
