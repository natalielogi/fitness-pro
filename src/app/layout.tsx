import './globals.css';
import { Roboto } from 'next/font/google';
import Header from '@/components/header/header';
import { AuthModalProvider } from '@/context/auth-modal';
import AuthModal from '@/components/auth/authModal';

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
    <html lang="en">
      <body className={roboto.className}>
        <AuthModalProvider>
          <Header />
          {children}
          <AuthModal />
        </AuthModalProvider>
      </body>
    </html>
  );
}
