import {
  UsersIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  ShoppingBagIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { Avatar, Card, Button } from "components/ui";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getDashboardStatsThunk,
  getIngresosDashboardThunk,
  getInscripcionesStatusThunk,
  getMensualidadesStatusThunk,
  getAlumnosEnAlbercaThunk,
  getVentasTiendaDashboardThunk,
} from "slices/dashboard/thunk";

export function Overview() {
  const dispatch = useDispatch();

  const {
    stats,
    ingresos,
    inscripciones,
    mensualidades,
    alumnosEnAlberca,
    ventasTienda,
  } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getDashboardStatsThunk());
    dispatch(getIngresosDashboardThunk());
    dispatch(getInscripcionesStatusThunk());
    dispatch(getMensualidadesStatusThunk());
    dispatch(getAlumnosEnAlbercaThunk());
    dispatch(getVentasTiendaDashboardThunk());
  }, [dispatch]);

  // ✅ Extraemos los primeros objetos de cada arreglo o dejamos objeto vacío
  const statsData = stats || {};
  const ingresosData = ingresos || {};
  const inscripcionesData = inscripciones?.[0] || {};
  const mensualidadesData = mensualidades?.[0] || {};
  const albercaData = alumnosEnAlberca?.[0] || {};
  const total= statsData.Total || 0;

  const cards = [
    {
      title: "Alumnos: "+ total,
      icon: UsersIcon,
      color: "info",
      buttons: [
        { label: `${statsData.Activos ?? 0} Activos`, color: "success" },
        { label: `${statsData.Inactivos ?? 0} Inactivos`, color: "error" },
      ],
    },
    {
      title: "Alumnos en alberca",
      value: `${albercaData.En_Alberca ?? 0}`,
      icon: UserGroupIcon,
      color: "info",
    },
    {
      title: "Inscripciones",
      icon: ClipboardDocumentCheckIcon,
      color: "success",
      buttons: [
        {
          label: `${inscripcionesData.Activas ?? 0} Activas`,
          color: "success",
        },
        {
          label: `${inscripcionesData.Inactivas ?? 0} Inactivas`,
          color: "error",
        },
      ],
    },
    {
      title: "Mensualidades",
      icon: CalendarDaysIcon,
      color: "success",
      buttons: [
        {
          label: `${mensualidadesData.Activas ?? 0} Activas`,
          color: "success",
        },
        {
          label: `${mensualidadesData.Inactivas ?? 0} Inactivas`,
          color: "error",
        },
      ],
    },
    {
      title: "Ingresos por Inscripciones",
      value: `$${ingresosData.Inscripciones ?? 0}`,
      icon: CurrencyDollarIcon,
      color: "warning",
    },
    {
      title: "Ingresos por Mensualidades",
      value: `$${ingresosData["Mensualidades y Clases"] ?? 0}`,
      icon: AcademicCapIcon,
      color: "warning",
    },
    {
      title: "Ingresos por Tienda",
      value: `$${ingresosData.Tienda ?? 0}`,
      icon: ShoppingBagIcon,
      color: "warning",
    },
    {
      title: "Ingreso Global",
      value: `$${ingresosData.Global ?? 0}`,
      icon: BanknotesIcon,
      color: "secondary",
    },
  ];

useEffect(() => {
  console.log("📊 Estado del dashboard completo:", {
    stats,
    ingresos,
    inscripciones,
    mensualidades,
    alumnosEnAlberca,
    ventasTienda
  });
}, [stats, ingresos, inscripciones, mensualidades, alumnosEnAlberca, ventasTienda]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <Card key={idx} className="flex flex-col justify-between p-5 gap-3">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold text-gray-800 dark:text-dark-100">
              {card.title}
            </div>
            <Avatar
              size={10}
              classNames={{ display: "mask is-squircle rounded-none" }}
              initialVariant="soft"
              initialColor={card.color}
            >
              <card.icon className="size-5" />
            </Avatar>
          </div>

          {card.buttons ? (
            <div className="flex gap-2 mt-2">
              {card.buttons.map((btn, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="soft"
                  color={btn.color}
                  className="rounded-full border border-this-darker/40 dark:border-this-lighter/30"
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="mt-2">
              <Button
                size="sm"
                variant="soft"
                color="neutral"
                className="rounded-full"
              >
                {card.value}
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
