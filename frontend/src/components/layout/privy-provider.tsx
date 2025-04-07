'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import { envNEXT_PUBLIC_PRIVY_APP_ID } from '@/lib/env';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId={envNEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
          logo: 'https://i.imgur.com/UWxTJWF.jpeg',
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}