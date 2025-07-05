// Local Imports
import { Page } from "components/shared/Page";
import { TeachersTable } from "./components";

// ----------------------------------------------------------------------

export default function TeachersPage() {
  return (
    <Page title="Profesores Registrados">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <div className="flex items-center space-x-4 py-5 lg:py-6">
          <h2 className="text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50 lg:text-2xl">
            Registro de Profesores
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
          <TeachersTable />
        </div>
      </div>
    </Page>
  );
}