import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, ColorModeScript, HStack } from '@chakra-ui/react';
import theme from './theme';
import ColorModeButton from './components/ColorModeButton/ColorModeButton';
import Login from './components/Login/Login';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <>
  <ColorModeScript />
  <ChakraProvider theme={theme}>
    <BrowserRouter>
      <HStack position="fixed" top="5vh" right="5vw" zIndex="10">
          <Login />
          <ColorModeButton />
      </HStack>
      <App />
    </BrowserRouter>
  </ChakraProvider>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
