import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jamystrology - 다차원 점술 인사이트",
  description: "사주팔자, 자미두수, 기문둔갑, 주역, 호라리 점성술, 바빌로니아 점성술을 통합한 다차원 인사이트 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
