import './globals.css';
import { Roboto } from 'next/font/google';
import Header from '@/components/header/header';
import AuthModal from '@/components/auth/authModal';
import Providers from './providers';

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500'],
  display: 'swap',
});

export const metadata = {
  title: 'SkyFitnessPro',
  description: 'Fitness tracking app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={roboto.className}>
        <Providers>
          <Header />
          {children}
          <AuthModal />
        </Providers>
      </body>
    </html>
  );
}
