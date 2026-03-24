import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Auth0Provider } from '@auth0/auth0-react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-f0lrnyg4uigdvae1.us.auth0.com"
      clientId="edp3GnoatCBItXXQiu6jsxjL0Tc3CTIM"
      authorizationParams={{
        audience: "https://knowyourole.com/api",
        redirect_uri: window.location.origin
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
)
