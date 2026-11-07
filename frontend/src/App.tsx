import { MainLayout } from './layouts';
import { Dashboard } from './pages';
import { ThemeProvider } from './utils';

/**
 * Root application component.
 * Wraps every page in ThemeProvider and MainLayout shell.
 */
function App() {
  return (
    <ThemeProvider>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
