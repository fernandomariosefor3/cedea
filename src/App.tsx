import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { FirebaseProvider } from "./context/FirebaseContext";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <FirebaseProvider>
        <AuthProvider>
          <DataProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <AppRoutes />
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </FirebaseProvider>
    </I18nextProvider>
  );
}

export default App;
