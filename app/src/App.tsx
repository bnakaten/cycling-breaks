/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { Datenschutz } from './pages/Datenschutz';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="datenschutz" element={<Datenschutz />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
