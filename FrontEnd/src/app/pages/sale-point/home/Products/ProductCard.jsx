// Local Imports
import PropTypes  from "prop-types";

// Import Dependencies
import { Card } from "components/ui";
import { ProductModal } from "./ProductModal.jsx";
import { useState } from "react";



// ----------------------------------------------------------------------

export function ProductCard({ imagen, nombre, categoria, precio_venta, id }) {

  let img_composted = imagen || "/images/800x600.png";

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card
        onClick={() => setIsModalOpen(true)}
        className="group p-2 transition-transform hover:scale-105"
      >
        <img className="rounded-lg" src={img_composted} alt={nombre} />
        <div className="pt-2">
          <p className="dark:text-dark-100 truncate font-medium text-gray-800">
            {nombre}
          </p>
          <p className="dark:text-dark-300 truncate text-xs text-gray-400">
            {categoria}
          </p>
          <p className="text-primary-600 dark:text-primary-400 text-end font-medium">
            ${precio_venta}
          </p>
        </div>
        <div className="absolute inset-0 cursor-pointer rounded-lg bg-black/10 opacity-0 transition-colors group-hover:opacity-100" />
      </Card>
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rowData={{
          img : img_composted,
          name : nombre,
          category : categoria,
          price : precio_venta,
          id
      }}
      />
    </>
  );
}

ProductCard.propTypes = {
  imagen: PropTypes.string,
  nombre: PropTypes.string,
  categoria: PropTypes.string,
  precio_venta: PropTypes.string,
};

