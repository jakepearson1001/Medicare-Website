import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav.jsx';
import { ToastProvider } from './components/ui.jsx';
import Today from './screens/Today.jsx';
import Plan from './screens/Plan.jsx';
import Library from './screens/Library.jsx';
import MealPrep from './screens/MealPrep.jsx';
import Recipes from './screens/Recipes.jsx';
import Log from './screens/Log.jsx';
import Settings from './screens/Settings.jsx';

export default function App() {
  return (
    <ToastProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/library" element={<Library />} />
          <Route path="/meal-prep" element={<MealPrep />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/log" element={<Log />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
