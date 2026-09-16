import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { image, mediaType, mood, brands } = await req.json();

    let base64Data = image;
    let mimeType = mediaType || 'image/jpeg';

    if (image && image.includes(',')) {
      const parts = image.split(',');
      mimeType = parts[0].match(/:(.*?);/)?.[1] || mimeType;
      base64Data = parts[1];
    }

    const brandInstruction = brands
      ? `ユーザーが希望するブランド: ${brands}。このブランドを優先して番号を出してください。該当ブランドの型番のみでよいです。`
      : `DMC、コスモ(COSMO)、オリンパス(OLYMPUS)の3ブランドすべての型番を提案してください。`;

    const systemPrompt = `あなたはぬいぐるみ服・刺繍の配色デザインアドバイザーです。
アップロードされた線画/未着色のぬいまたは服のデザイン画像（手描きスケッチ含む）を見て、配色案を3パターン提案してください。
各パターンについて、画像内の主要なパーツ(例: 頭、耳、髪、目、服の各部位など)ごとに配色と、その色に近い刺繍糸の型番を提案してください。
${brandInstruction}
${mood ? `ユーザー希望のイメージ: ${mood}` : ''}

必ず以下のJSON形式のみで出力してください。説明文やMarkdown記法(\`\`\`など)は一切含めないでください。

{
  "palettes": [
    {
      "name": "パレット名(短く)",
      "mood": "雰囲気の説明(1文)",
      "parts": [
        {
          "part": "パーツ名",
          "hex": "#RRGGBB",
          "threads": "ブランド名 番号(色名), ブランド名 番号(色名) の形式でカンマ区切り"
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        { text: systemPrompt },
        { inlineData: { data: base64Data, mimeType: mimeType } },
      ],
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: '配色案の生成に失敗しました。' }, { status: 500 });
  }
}
