import { createRoot } from 'react-dom/client';
import MainApp from './MainApp';

// Assuming your root element is 'root'
const rootElement = document.getElementById('root');

// Your App component
const App = () => (
  <div>
    <MainApp/>
  </div>
);

// Create a root
const root = createRoot(rootElement);

// Render your App
root.render(<App />);