// Load polyfills first
import './src/polyfills'

// Import the main app
import { registerRootComponent } from 'expo'
import App from './App'

// Register the main component
registerRootComponent(App)