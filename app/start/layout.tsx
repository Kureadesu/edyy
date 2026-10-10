import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'Hello, Edyy',
  description: 'Ultimate date planner',
};

export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
}