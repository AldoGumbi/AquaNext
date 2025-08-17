// Local Imports
import { Page } from "components/shared/Page";
import { DisponibilidadView } from "./components";
export { AlumnosModal } from './components/AlumnosModal';

// ----------------------------------------------------------------------

export default function DisponibilidadCuposPage() {
  return (
    <Page title="Disponibilidad de Cupos">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <div className="flex items-center space-x-4 py-5 lg:py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg 
                className="w-6 h-6 text-blue-600 dark:text-blue-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50 lg:text-2xl">
                Disponibilidad de Cupos
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
                Consulta la ocupación y disponibilidad de espacios en cada grupo
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
          <DisponibilidadView />
        </div>
      </div>
    </Page>
  );
}