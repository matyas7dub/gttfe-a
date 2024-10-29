import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from './theme';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { publicUrl } from './config/config';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <>
  <ColorModeScript />
  <ChakraProvider theme={theme}>
      <BrowserRouter basename={publicUrl}>
      <div style={{ minHeight: "80vh"}}>
        <Navbar />
        <App />
      </div>
      <Footer />
    </BrowserRouter>
  </ChakraProvider>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
