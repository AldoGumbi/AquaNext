// Import Dependencies
import { useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import clsx from "clsx";

// Local Imports
import { Card } from "components/ui";
import { DisponibilidadMensual } from "./DisponibilidadMensual";
import { DisponibilidadRango } from "./DisponibilidadRango";

// Icons
import { CalendarDaysIcon, CalendarIcon } from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

const tabs = [
  {
    id: 'mensual',
    name: 'Vista Mensual',
    icon: CalendarDaysIcon,
    description: 'Consulta disponibilidad por mes específico'
  },
  {
    id: 'rango',
    name: 'Vista por Rango',
    icon: CalendarIcon,
    description: 'Consulta disponibilidad en un rango de fechas'
  }
];

export function DisponibilidadView() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Card className="p-0 overflow-hidden">
      <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-800">
          <TabList className="flex space-x-8 px-6 py-4">
            {tabs.map((tab/**, index**/) => (
              <Tab
                key={tab.id}
                className={({ selected }) =>
                  clsx(
                    'flex items-center space-x-3 py-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none',
                    selected
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-dark-400 dark:hover:text-dark-200'
                  )
                }
              >
                <tab.icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{tab.name}</div>
                  <div className="text-xs opacity-75 hidden sm:block">
                    {tab.description}
                  </div>
                </div>
              </Tab>
            ))}
          </TabList>
        </div>

        {/* Tab Panels */}
        <TabPanels>
          <TabPanel className="p-6 focus:outline-none">
            <DisponibilidadMensual />
          </TabPanel>
          <TabPanel className="p-6 focus:outline-none">
            <DisponibilidadRango />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </Card>
  );
}