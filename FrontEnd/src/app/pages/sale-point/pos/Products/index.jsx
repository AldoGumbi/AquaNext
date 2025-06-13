// Local Imports
import { ProductCard } from "./ProductCard";
import {  useDispatch, useSelector } from "react-redux";
import { getProductsThunk} from "slices/thunk.js";
import {useEffect} from "react";


// ----------------------------------------------------------------------



export function Products() {
  const dispatch = useDispatch();

  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getProductsThunk());
  }, [dispatch]);


  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:mt-5 sm:gap-5 lg:mt-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
