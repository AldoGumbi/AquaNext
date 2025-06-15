// Import Dependencies
import { useRef } from "react";
import { register } from "swiper/element/bundle";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import invariant from "tiny-invariant";

// Local Imports
import { useLocaleContext } from "app/contexts/locale/context";
import { Button, Card } from "components/ui";
import { useIsomorphicEffect } from "hooks";


// ----------------------------------------------------------------------

const items = [
  {
    uid: "1",
    name: "Cafeteria",
    image: "/src/assets/POS/cafeteria.svg",
  },
  {
    uid: "2",
    name: "Articulos Deportivos",
    image: "/src/assets/POS/articulos_deportivos.svg",
  },
  {
    uid: "3",
    name: "Accesorios",
    image: "/src/assets/POS/accesorios.svg",
  },
  {
    uid: "4",
    name: "Otros",
    image: "/src/assets/POS/others.svg",
  },
];

register();

export function Categories() {
  const { direction } = useLocaleContext();
  const carouselRef = useRef(null);

  useIsomorphicEffect(() => {
    invariant(carouselRef.current, "carouselRef is null");
    const params = {
      navigation: {
        nextEl: ".next-btn",
        prevEl: ".prev-btn",
      },
    };

    Object.assign(carouselRef.current, params);

    setTimeout(() => {
      carouselRef.current.initialize();
    });
  }, []);

  return (
    <swiper-container
      ref={carouselRef}
      init="false"
      slides-per-view="auto"
      dir={direction}
      space-between="16"
    >
      <span slot="container-start">
        <div className="flex min-w-0 items-center justify-between pb-3">
          <p className="truncate text-base font-medium text-gray-800 dark:text-dark-100">
            Categorias
          </p>
          <div className="flex">
            <Button
              isIcon
              className="prev-btn size-7 rounded-full"
              variant="flat"
            >
              <ChevronLeftIcon className="size-5 rtl:rotate-180" />
            </Button>
            <Button
              isIcon
              className="next-btn size-7 rounded-full"
              variant="flat"
            >
              <ChevronRightIcon className="size-5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </span>

      {items.map(({ uid, name, image }) => (
        <swiper-slide key={uid} class="w-24">
          <Card className="w-[100px] h-[130px]  shrink-0 cursor-pointer px-2 py-4 text-center text-gray-800 dark:text-dark-100">
            <img
              alt={name}
              src={image}
              loading="lazy"
              className="mx-auto w-12"
            />
            <p className="truncate pt-2 text-pretty w-auto  font-medium tracking-wide">{name}</p>
          </Card>
        </swiper-slide>
      ))}
    </swiper-container>
  );
}
