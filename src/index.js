import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import logo from './logo.png';

// Set favicon
const link = document.querySelector("link[rel~='icon']");
if (link) {
  link.href = logo;
} else {
  const newLink = document.createElement('link');
  newLink.rel = 'icon';
  newLink.href = logo;
  document.getElementsByTagName('head')[0].appendChild(newLink);
}

// Set page title
document.title = 'ThyroCare';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
