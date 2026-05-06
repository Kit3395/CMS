import React from 'react';
import { SampleDesignSystemPage } from './components/DesignSystem';
import { theme } from './theme';

export default function App() {
  console.log('Design theme loaded', theme);
  return <SampleDesignSystemPage />;
}
