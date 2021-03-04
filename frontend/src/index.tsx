import ReactDOM from 'react-dom';
import './index.css';
import AuthProvider from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from "react-intl";
import Routes from './routes';

ReactDOM.render(
  <IntlProvider
    locale="en"
    defaultLocale="en"
  >
    <AuthProvider>
      <BrowserRouter basename="/">
        <Routes />
      </BrowserRouter>
    </AuthProvider>
  </IntlProvider>,
  document.getElementById('root')
);
