import "./globals.css";
import "./chat.css";
import "./quizz.css";
import localFont from "next/font/local";

const myFont = localFont({
  src: '../public/fonts/LINESeedSansTH_W_Rg.woff',
  variable: '--font-myfont',
  display: 'swap',
});

export const metadata = {
  title: "Genesis-School",
  description: "Genesis-School for better learning experience",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       <head>
              <link rel="favicon" href="/vercel.svg" />
       </head>
      <body
        className={`${myFont.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
