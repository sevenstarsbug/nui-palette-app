import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { image, mediaType, mood, brands } = await req.json();

    // Base64文字列から純粋なデータ部分とMIMEタイプを抽出
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

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([systemPrompt, imagePart]);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: '配色案の生成に失敗しました。' }, { status: 500 });
  }
}
