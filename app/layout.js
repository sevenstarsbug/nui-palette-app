export const metadata = {
  title: 'ぬい配色プランナー',
  description: '線画・未着色のぬいデザインから配色案と刺繍糸の番号候補を提案します',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
