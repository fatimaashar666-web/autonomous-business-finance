import { MainLayout } from './layouts';
import { Dashboard } from './pages';

/**
 * Root application component.
 * Wraps every page in the MainLayout shell.
 */
function App() {
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}

export default App;
