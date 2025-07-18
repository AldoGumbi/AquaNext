// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";

// ----------------------------------------------------------------------

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          path: "dashboards",
          element: <Navigate to="/dashboards/home" />, // 👈 este hace el redirect
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/sales")).default,
              }),
            },
          ],
        },
      ],
    },

    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="app/pages/sale-point/pos" />,
        },
        {
          path: "sale-point",
          children: [
            // POS VIEW
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/sale-point/pos")).default,
              }),
            },
            // SALES TABLE
            {
              path: "sales",
              lazy: async () => ({
                Component: (await import("app/pages/sale-point/sales-table")).default,
              }),
            },
            // PRODUCTS - This is a collapse item
            {
              path: "products",
              children: [
                //ADD NEW PRODUCT
                {
                  path: "add-new",
                  lazy: async () => ({
                    Component: (await import("app/pages/sale-point/Products/new-product")).default,
                  }),
                },
                // ALL PRODUCTS
                {
                  path: "inventory",
                  lazy: async () => ({
                    Component: (await import("app/pages/sale-point/Products/all-products")).default,
                  }),
                },

              ],
            },
            // CASH REGISTER
            {
              path: "cash-register",
              children: [
                //HOME cash-register
                {
                  path: "home",
                  lazy: async () => ({
                    Component: (await import("app/pages/sale-point/cash-register/home")).default,
                  }),
                },
<<<<<<< Updated upstream
                // CASH REGISTER - operation same user
                {
                  path: "operations",
                  lazy: async () => ({
                    Component: (await import("app/pages/sale-point/cash-register/caja-status")).default,
                  }),
                },

=======
                // CASH REGISTER - OPEN
                {
                  path: "control-caja",
                  lazy: async () => ({
                    Component: (await import("app/pages/sale-point/cash-register/open")).default,
                  }),
                },
>>>>>>> Stashed changes

              ],
            },
            // DISCOUNT COUPONS
            {
              path: "discount-coupons",
              children: [
                {
                  path: "all-coupons",
                  lazy: async () => ({
                    Component: (await import("app/pages/sale-point/discount-coupons/all-coupons")).default,
                  }),
                },
                // CASH REGISTER - ADD NEW
                {
                  path: "add-coupon",
                  lazy: async () => ({
                    Component: (await import("app/pages/sale-point/discount-coupons/add-coupons")).default,
                  }),
                },

              ],
            }
          ],
        },
      ],
    },
    // students routes
    {
      Component: DynamicLayout,
      children: [
        {
          path: "students",
          children: [
            {
              index: true,
              element: <Navigate to="/students/register" />,
            },
            {
              path: "register",
              lazy: async () => ({
                Component: (await import("app/pages/students/register")).default,
              }),
            },
            {
              path: "all-students",
              lazy: async () => ({
                Component: (await import("app/pages/students/all-students")).default,
              }),
            },
            {
              path: "new-insc-mens",
              lazy: async () => ({
                Component: (await import("app/pages/students/new-insc-mens")).default,
              }),
            },
            {
              path: "transaction",
              lazy: async () => ({
                Component: (await import("app/pages/schoolTransactions/crearInscripcionMensualidad")).default,
              }),
            },
          ],
        },
      ],
    },

   
    // school transactions routes
    {
      Component: DynamicLayout,
      children: [
        {
          path: "school-transactions",
          children: [
            {
              index: true,
              element: <Navigate to="/school-transactions/register" />,
            },
            {
              path: "register",
              lazy: async () => ({
                Component: (await import("app/pages/schoolTransactions/crearInscripcionMensualidad")).default,
              }),
            },
            // {
            //   path: "all-transactions",
            //   lazy: async () => ({
            //     Component: (await import("app/pages/teachers/all-teachers")).default,
            //   }),
            // },
          ],
        },
      ],
    },

// Este bloque ya cubre tanto grupos como profesores:
    {
      Component: DynamicLayout,
      children: [
        {
          path: "control-clases",
          children: [
            {
              index: true,
              element: <Navigate to="/control-clases/register-group" />,
            },
            {
              path: "register-group",
              lazy: async () => ({
                Component: (await import("app/pages/groups/register")).default,
              }),
            },
            {
              path: "all-groups",
              lazy: async () => ({
                Component: (await import("app/pages/groups/all-groups/index_1")).default,
              }),
            },
            
            {
              path: "register-teacher",
              lazy: async () => ({
                Component: (await import("app/pages/teachers/register")).default,
              }),
            },
            {
              path: "all-teachers",
              lazy: async () => ({
                Component: (await import("app/pages/teachers/all-teachers")).default,
              }),
            },
          ],
        },
      ],
    },



    // The app layout supports only the main layout. Avoid using it for other layouts.
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/General"))
                  .default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
