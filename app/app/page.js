'use client';

import { useState } from 'react';

export default function Home() {
  const [base64Image, setBase64Image] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mood, setMood] = useState('');
  const [brands, setBrands] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      setBase64Image(res.split(',')[1]);
      setPreviewUrl(res);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRun = async () => {
    if (!base64Image) return;
    setLoading(true);
    setStatus('配色を考えています…');
    setResults([]);
    setError(null);

    try {
      const res = await fetch('/api/palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          mediaType: mediaType,
          mood: mood.trim(),
          brands: brands.trim(),
        }),
      });

      if (!res.ok) throw new Error('エラーが発生しました');
      const data = await res.json();

      if (data.palettes && data.palettes.length > 0) {
        setResults(data.palettes);
        setStatus('');
      } else {
        throw new Error('配色案が取得できませんでした');
      }
    } catch (err) {
      console.error(err);
      setStatus('');
      setError('提案の取得に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.wrap}>
        <h1 style={styles.h1}>ぬい配色プランナー</h1>
        <p style={styles.sub}>線画・未着色のぬいデザインから配色案と刺繍糸の番号候補を提案します</p>

        <div style={styles.card}>
          <label style={styles.label}>デザイン画像</label>
          <div
            style={{ ...styles.drop, ...(previewUrl ? styles.dropHasImg : {}) }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="preview" style={styles.dropImg} />
            ) : (
              <span>タップして画像を選択</span>
            )}
          </div>
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <label style={{ ...styles.label, marginTop: '14px' }}>イメージ・雰囲気(任意)</label>
          <input
            type="text"
            style={styles.inputText}
            placeholder="例: レトロ、パステル、和風、モノトーンなど"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          />

          <label style={styles.label}>使いたい糸ブランド(任意・複数可)</label>
          <input
            type="text"
            style={styles.inputText}
            placeholder="例: DMC, コスモ, オリンパス（空欄なら3社とも提案）"
            value={brands}
            onChange={(e) => setBrands(e.target.value)}
          />

          <button
            style={{
              ...styles.button,
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
