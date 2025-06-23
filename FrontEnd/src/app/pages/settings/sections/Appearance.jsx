// Import Dependencies
import { Label, Radio, RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { toast } from "sonner";

// Local Imports
import { useThemeContext } from "app/contexts/theme/context";
import { colors } from "constants/colors.constant";
import { Listbox } from "components/shared/form/Listbox";
import { useDidUpdate } from "hooks";
import { Button, Switch } from "components/ui";

// ----------------------------------------------------------------------

const primaryColors = ["indigo", "blue", "green", "amber", "purple", "rose"];
const lightColors = ["slate", "gray", "neutral"];
const darkColors = ["mint", "navy", "mirage", "cinder", "black"];

const cardSkins = [
  {
    value: "shadow-sm",
    label: "Sombras Suaves",
  },
  {
    value: "bordered",
    label: "Con Bordes",
  },
];

const notificationPos = [
  {
    value: "top-left",
    label: "Top Left",
  },
  {
    value: "top-center",
    label: "Top Center",
  },
  {
    value: "top-right",
    label: "Top Right",
  },
  {
    value: "bottom-left",
    label: "Bottom Left",
  },
  {
    value: "bottom-center",
    label: "Bottom Center",
  },
  {
    value: "bottom-right",
    label: "Bottom Right",
  },
];


export default function Appearance() {
  const theme = useThemeContext();

  useDidUpdate(() => {
    toast("Position updated", {
      description: `Notification position updated to ${
        notificationPos.find(
          (pos) => pos.value === theme.notification?.position,
        ).label
      }`,
      descriptionClassName: "text-gray-600 dark:text-dark-200 text-xs mt-0.5",
    });
  }, [theme.notification?.position]);

  useDidUpdate(() => {
    for (let i = 0; i < 3; i++) toast("This is a Toast");
  }, [theme.notification?.isExpanded]);

  return (
    <div className="w-full max-w-3xl 2xl:max-w-5xl">
      <h5 className="text-lg font-medium text-gray-800 dark:text-dark-50">
        Apariencia
      </h5>
      <p className="mt-0.5 text-balance text-sm text-gray-500 dark:text-dark-200">
        Personaliza la apariencia de la aplicación. Selecciona los colores y el modo del tema para cambiar la apariencia de la aplicación.
      </p>
      <div className="my-5 h-px bg-gray-200 dark:bg-dark-500" />

      <div className="space-y-8">
        <div>
          <div>
            <p className="text-base font-medium text-gray-800 dark:text-dark-100">
              Tema
            </p>
            <p className="mt-0.5">
              Puedes seleccionar un color de tema de la lista a continuación.
            </p>
          </div>
          <RadioGroup
            value={theme.themeMode}
            onChange={theme.setThemeMode}
            className="mt-4"
          >
            <Label className="sr-only">Modo de Tema (oscuro o claro)</Label>
            <div className="mt-2 flex flex-wrap gap-6">
              <Radio
                value="system"
                className="w-44 cursor-pointer outline-hidden"
              >
                {({ checked }) => (
                  <>
                    <div
                      className={clsx(
                        "relative overflow-hidden rounded-lg border-2 bg-dark-900 dark:border-transparent",
                        checked &&
                          "ring-2 ring-primary-600 ring-offset-2 ring-offset-white transition-all dark:ring-primary-500 dark:ring-offset-dark-700",
                      )}
                    >
                      <div
                        style={{
                          clipPath: "polygon(50% 50%, 100% 0, 0 0, 0% 100%)",
                        }}
                        className="w-full space-y-2 bg-gray-50 p-1.5 "
                      >
                        <div className="w-full space-y-2 rounded-sm bg-white p-2 shadow-xs">
                          <div className="h-2 w-9/12 rounded-lg bg-gray-150"></div>
                          <div className="h-2 w-11/12 rounded-lg bg-gray-150"></div>
                        </div>
                        <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs ">
                          <div className="size-4 shrink-0 rounded-full bg-gray-150"></div>
                          <div className="h-2 w-full rounded-lg bg-gray-150"></div>
                        </div>
                        <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs ">
                          <div className="size-4 shrink-0 rounded-full bg-gray-150"></div>
                          <div className="h-2 w-9/12 rounded-lg bg-gray-150"></div>
                        </div>
                      </div>
                      <div
                        style={{
                          clipPath:
                            "polygon(50% 50%, 100% 0, 100% 100%, 0% 100%)",
                        }}
                        className="absolute inset-0 space-y-2 p-1.5 "
                      >
                        <div className="w-full space-y-2 rounded-sm bg-dark-700 p-2 shadow-xs">
                          <div className="h-2 w-9/12 rounded-lg bg-dark-400"></div>
                          <div className="h-2 w-11/12 rounded-lg bg-dark-400"></div>
                        </div>
                        <div className="flex items-center space-x-2 rounded-sm bg-dark-700 p-2 shadow-xs ">
                          <div className="size-4 shrink-0 rounded-full bg-dark-400"></div>
                          <div className="h-2 w-full rounded-lg bg-dark-400"></div>
                        </div>
                        <div className="flex items-center space-x-2 rounded-sm bg-dark-700 p-2 shadow-xs ">
                          <div className="size-4 shrink-0 rounded-full bg-dark-400"></div>
                          <div className="h-2 w-9/12 rounded-lg bg-dark-400"></div>
                        </div>
                      </div>
                    </div>

                    <p className="mt-1.5 text-center">Sistema</p>
                  </>
                )}
              </Radio>
              <Radio value="light" className="w-44 cursor-pointer outline-hidden">
                {({ checked }) => (
                  <>
                    <div
                      className={clsx(
                        "relative overflow-hidden rounded-lg border-2 dark:border-transparent",
                        checked &&
                          "ring-2 ring-primary-600 ring-offset-2 ring-offset-white transition-all dark:ring-primary-500 dark:ring-offset-dark-700",
                      )}
                    >
                      <div className="w-full space-y-2 bg-gray-50 p-1.5 ">
                        <div className="w-full space-y-2 rounded-sm bg-white p-2 shadow-xs">
                          <div className="h-2 w-9/12 rounded-lg bg-gray-150"></div>
                          <div className="h-2 w-11/12 rounded-lg bg-gray-150"></div>
                        </div>
                        <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs ">
                          <div className="size-4 shrink-0 rounded-full bg-gray-150"></div>
                          <div className="h-2 w-full rounded-lg bg-gray-150"></div>
                        </div>
                        <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs ">
                          <div className="size-4 shrink-0 rounded-full bg-gray-150"></div>
                          <div className="h-2 w-9/12 rounded-lg bg-gray-150"></div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-1.5 text-center">Claro</p>
                  </>
                )}
              </Radio>
              <Radio value="dark" className="w-44 cursor-pointer outline-hidden">
                {({ checked }) => (
                  <>
                    <div
                      className={clsx(
                        "relative overflow-hidden rounded-lg border border-transparent bg-dark-900",
                        checked &&
                          "ring-2 ring-primary-600 ring-offset-2 ring-offset-white transition-all dark:ring-primary-500 dark:ring-offset-dark-700",
                      )}
                    >
                      <div className="w-full space-y-2 bg-dark-900 p-1.5 ">
                        <div className="w-full space-y-2 rounded-sm bg-dark-700 p-2 shadow-xs">
                          <div className="h-2 w-9/12 rounded-lg bg-dark-400"></div>
                          <div className="h-2 w-11/12 rounded-lg bg-dark-400"></div>
                        </div>
                        <div className="flex items-center space-x-2 rounded-sm bg-dark-700 p-2 shadow-xs ">
                          <div className="size-4 shrink-0 rounded-full bg-dark-400"></div>
                          <div className="h-2 w-full rounded-lg bg-dark-400"></div>
                        </div>
                        <div className="flex items-center space-x-2 rounded-sm bg-dark-700 p-2 shadow-xs ">
                          <div className="size-4 shrink-0 rounded-full bg-dark-400"></div>
                          <div className="h-2 w-9/12 rounded-lg bg-dark-400"></div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-1.5 text-center">Oscuro</p>
                  </>
                )}
              </Radio>
            </div>
          </RadioGroup>
        </div>
        <div>
          <div>
            <p className="text-base font-medium text-gray-800 dark:text-dark-100">
              Color Primario del Tema
            </p>
            <p className="mt-0.5">
              Elige un color que se utilizará como color primario para tu
              tema.
            </p>
          </div>
          <RadioGroup
            value={theme.primaryColorScheme.name}
            onChange={theme.setPrimaryColorScheme}
            className="mt-2"
          >
            <Label className="sr-only">Elige el Color Primario del Tema</Label>
            <div className="mt-2 flex w-fit flex-wrap gap-4 sm:gap-5">
              {primaryColors.map((color) => (
                <Radio
                  key={color}
                  value={color}
                  className={({ checked }) =>
                    clsx(
                      "flex h-14 w-16 cursor-pointer items-center justify-center rounded-lg border outline-hidden",
                      checked
                        ? "border-primary-500"
                        : "border-gray-200 dark:border-dark-500",
                    )
                  }
                >
                  {({ checked }) => (
                    <div
                      className={clsx(
                        "mask is-diamond size-6 transition-all",
                        checked && "rotate-45 scale-110",
                      )}
                      style={{
                        backgroundColor: colors[color][500],
                      }}
                    ></div>
                  )}
                </Radio>
              ))}
            </div>
          </RadioGroup>
        </div>
        <div>
          <div>
            <p className="text-base font-medium text-gray-800 dark:text-dark-100">
              Color de Tema Claro
            </p>
            <p className="mt-0.5">
              Selecciona el esquema de color claro que se utilizará para tu tema.
            </p>
          </div>
          <RadioGroup
            value={theme.lightColorScheme.name}
            onChange={theme.setLightColorScheme}
            className="mt-4"
          >
            <Label className="sr-only">Color de Tema Claros</Label>
            <div className="mt-2 flex flex-wrap gap-4">
              {lightColors.map((color) => (
                <Radio
                  key={color}
                  value={color}
                  className="w-32 cursor-pointer outline-hidden"
                >
                  {({ checked }) => (
                    <>
                      <div
                        className={clsx(
                          "relative overflow-hidden rounded-lg border-2 dark:border-transparent",
                          checked &&
                            "ring-2 ring-primary-600 ring-offset-2 ring-offset-white transition-all dark:ring-primary-500 dark:ring-offset-dark-700",
                        )}
                      >
                        <div
                          className="w-full space-y-2 p-1.5 "
                          style={{ backgroundColor: colors[color][200] }}
                        >
                          <div className="w-full space-y-2 rounded-sm bg-white p-2 shadow-xs">
                            <div
                              className="h-2 w-9/12 rounded-lg"
                              style={{ backgroundColor: colors[color][400] }}
                            ></div>
                            <div
                              className="h-2 w-11/12 rounded-lg"
                              style={{ backgroundColor: colors[color][400] }}
                            ></div>
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs ">
                            <div
                              className="size-4 shrink-0 rounded-full"
                              style={{ backgroundColor: colors[color][400] }}
                            ></div>
                            <div
                              className="h-2 w-full rounded-lg"
                              style={{ backgroundColor: colors[color][400] }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-1.5 text-center capitalize">{color}</p>
                    </>
                  )}
                </Radio>
              ))}
            </div>
          </RadioGroup>
        </div>
        <div>
          <div>
            <p className="text-base font-medium text-gray-800 dark:text-dark-100">
              Color de tema Oscuro
            </p>
            <p className="mt-0.5">
              Selecciona el esquema de color oscuro que se utilizará para tu tema.
            </p>
          </div>
          <RadioGroup
            value={theme.darkColorScheme.name}
            onChange={theme.setDarkColorScheme}
            className="mt-4"
          >
            <Label className="sr-only">Color de tema Oscuro</Label>
            <div className="mt-2 flex flex-wrap gap-4">
              {darkColors.map((color) => (
                <Radio
                  key={color}
                  value={color}
                  className="w-32 cursor-pointer outline-hidden"
                >
                  {({ checked }) => (
                    <>
                      <div
                        className={clsx(
                          "relative overflow-hidden rounded-lg",
                          checked &&
                            "ring-2 ring-primary-600 ring-offset-2 ring-offset-white transition-all dark:ring-primary-500 dark:ring-offset-dark-700",
                        )}
                      >
                        <div
                          className="w-full space-y-2 p-1.5 "
                          style={{ backgroundColor: colors[color][900] }}
                        >
                          <div
                            className="w-full space-y-2 rounded-sm p-2 shadow-xs"
                            style={{ backgroundColor: colors[color][700] }}
                          >
                            <div
                              className="h-2 w-9/12 rounded-lg"
                              style={{ backgroundColor: colors[color][400] }}
                            ></div>
                            <div
                              className="h-2 w-11/12 rounded-lg"
                              style={{ backgroundColor: colors[color][400] }}
                            ></div>
                          </div>
                          <div
                            className="flex items-center space-x-2 rounded-sm p-2 shadow-xs "
                            style={{ backgroundColor: colors[color][700] }}
                          >
                            <div
                              className="size-4 shrink-0 rounded-full"
                              style={{ backgroundColor: colors[color][400] }}
                            ></div>
                            <div
                              className="h-2 w-full rounded-lg"
                              style={{ backgroundColor: colors[color][400] }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-1.5 text-center capitalize">{color}</p>
                    </>
                  )}
                </Radio>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="my-6 h-px bg-gray-200 dark:bg-dark-500"></div>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <p className="my-auto">Color de Cards:</p>
          <Listbox
            classNames={{
              root: "mt-1.5 flex-1 md:col-span-2 md:mt-0",
            }}
            data={cardSkins}
            value={cardSkins.find((skin) => skin.value === theme.cardSkin)}
            onChange={({ value }) => theme.setCardSkin(value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <p className="my-auto">Tono:</p>
          <div className="mt-1.5 flex flex-1 items-center justify-between space-x-2 rounded-lg border border-gray-300 px-3 py-2 dark:border-dark-450 md:col-span-2 md:mt-0 ">
            <p className="text-gray-800 dark:text-dark-100">Modo Monocromatico</p>
            <Switch
              checked={theme.isMonochrome}
              onChange={(e) => theme.setMonochromeMode(e.target.checked)}
            />
          </div>
        </div>
      </div>
      <div className="mt-10">
        <Button color="primary" onClick={theme.resetTheme}>
          Guardar Tema
        </Button>
      </div>
    </div>
  );
}
