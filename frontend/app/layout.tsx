import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'SantéConnect — Téléconsultation Médicale',
  description: 'Consultez un médecin en ligne depuis chez vous. Triage IA, prise de RDV, ordonnances numériques.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontFamily: 'DM Sans, sans-serif', borderRadius: '12px', fontSize: '14px' }, success: { style: { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' } }, error: { style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' } } }} />
        </AuthProvider>
      </body>
    </html>
  );
}
