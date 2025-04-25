import React from 'react';
import { Toaster, ToasterProps } from 'sonner';
import { themedToasterProps } from './index';

// Export a pre-configured Toaster component
export const ThemedToaster = (props: Partial<ToasterProps>) => (
  <Toaster
    position="top-right"
    {...themedToasterProps}
    {...props}
  />
); 