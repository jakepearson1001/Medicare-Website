import { NavLink } from 'react-router-dom';
import { IconToday, IconPlan, IconMeal, IconRecipe, IconLog } from './icons.jsx';

const TABS = [
  { to: '/', label: 'Today', Icon: IconToday, end: true },
  { to: '/plan', label: 'Plan', Icon: IconPlan },
  { to: '/meal-prep', label: 'Meal Prep', Icon: IconMeal },
  { to: '/recipes', label: 'Recipes', Icon: IconRecipe },
  { to: '/log', label: 'Log', Icon: IconLog },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
