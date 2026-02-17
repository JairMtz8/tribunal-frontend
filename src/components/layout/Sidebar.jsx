// src/components/layout/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Folder,
  Calendar,
  FileText,
  Scale,
  BarChart3,
  Settings,
  BookOpen,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['Administrador', 'Juzgado', 'CEMCI', 'CEMS']
    },
    {
      name: 'Adolescentes',
      icon: Users,
      path: '/adolescentes',
      roles: ['Administrador', 'Juzgado', 'CEMCI', 'CEMS']
    },
    {
      name: 'Procesos',
      icon: Folder,
      path: '/procesos',
      roles: ['Administrador', 'Juzgado', 'CEMCI', 'CEMS']
    },
    {
      name: 'Audiencias',
      icon: Calendar,
      path: '/audiencias',
      roles: ['Administrador', 'Juzgado']
    },
    {
      name: 'Carpetas',
      icon: FileText,
      path: '/carpetas',
      roles: ['Administrador', 'Juzgado', 'CEMCI', 'CEMS'],
      subItems: [
        { name: 'CJ', path: '/carpetas/cj' },
        { name: 'CJO', path: '/carpetas/cjo' },
        { name: 'CEMCI', path: '/carpetas/cemci' },
        { name: 'CEMS', path: '/carpetas/cems' }
      ]
    },
    {
      name: 'Medidas',
      icon: Scale,
      path: '/medidas',
      roles: ['Administrador', 'Juzgado'],
      subItems: [
        { name: 'Cautelares', path: '/medidas/cautelares' },
        { name: 'Sancionadoras', path: '/medidas/sancionadoras' }
      ]
    },
    {
      name: 'Catálogos',
      icon: BookOpen,
      path: '/catalogos',
      roles: ['Administrador'],
      subItems: [
        { name: 'Conductas (Delitos)', path: '/catalogos/conductas' },
        { name: 'Calificativas Delito', path: '/catalogos/calificativas' },
        { name: 'Estados Procesales', path: '/catalogos/estados-procesales' },
        { name: 'Estados Procesales', path: '/catalogos/estados-procesales' },
        { name: 'Tipos Med. Cautelares', path: '/catalogos/tipos-medidas-cautelares' },
        { name: 'Tipos Med. Sancionadoras', path: '/catalogos/tipos-medidas-sancionadoras' },
        { name: 'Tipos de Reparación', path: '/catalogos/tipos-reparacion' },
        { name: 'Roles', path: '/catalogos/roles' }
      ]
    },
    {
      name: 'Reportes',
      icon: BarChart3,
      path: '/reportes',
      roles: ['Administrador', 'Juzgado']
    },
    {
      name: 'Configuración',
      icon: Settings,
      path: '/configuracion',
      roles: ['Administrador']
    }
  ];

  // Filtrar menú por rol
  const filteredMenu = menuItems.filter(item =>
    item.roles.includes(user?.rol_nombre)
  );

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] transition-transform
          lg:translate-x-0
          bg-white border-r border-gray-200
        `}
      >
        {/* Menu */}
        <div className="h-full px-3 pb-4 overflow-y-auto relative pt-4">
          <ul className="space-y-2 font-medium">
            {filteredMenu.map((item) => (
              <li key={item.name}>
                {!item.subItems ? (
                  // Menu item simple
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center p-2 rounded-lg group transition ${isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-900 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="ml-3">{item.name}</span>
                  </NavLink>
                ) : (
                  // Menu item con subitems expandibles
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className="flex items-center w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 ml-3 text-left whitespace-nowrap">
                        {item.name}
                      </span>
                      {expandedMenus[item.name] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {/* Submenú expandible */}
                    {expandedMenus[item.name] && (
                      <ul className="pl-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.name}>
                            <NavLink
                              to={subItem.path}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `flex items-center p-2 rounded-lg transition text-sm ${isActive
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-gray-700 hover:bg-gray-100'
                                }`
                              }
                            >
                              {subItem.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Footer info */}
          <div className="mt-8 pt-4 border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
            Sistema Tribunal Adolescentes
            <br />
            v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
