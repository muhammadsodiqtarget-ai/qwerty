import './globals.css';

export const metadata = {
  title: "Mo'ljal — agentlik boshqaruvi",
  description: 'Doska, kalendar, Meta Ads hisobotlari — bitta joyda',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  );
}
