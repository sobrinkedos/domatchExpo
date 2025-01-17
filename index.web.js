import { Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Deve ser exportado ou o Fast Refresh não atualizará o contexto
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

if (Platform.OS === 'web') {
  const rootTag = createRootTag();
  const root = ReactDOM.createRoot(rootTag);
  root.render(<App />);
}

function createRootTag() {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  if (rootTag) {
    return rootTag;
  }
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  return root;
}

registerRootComponent(App);
