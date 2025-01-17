// index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Pour React 18
import App from './App';
import { Provider } from 'react-redux';
import store, { persistor } from './store/store'; // Mise à jour ici
import { PersistGate } from 'redux-persist/integration/react';
import './styles/global.css'

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);
