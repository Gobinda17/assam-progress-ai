import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "./context/AuthContext.jsx";
import { RouterProvider } from "react-router-dom";
import router from "./router";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <RouterProvider router={router}>
          {/* routes come from src/router/config.jsx and can include loaders/actions */}
        </RouterProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
