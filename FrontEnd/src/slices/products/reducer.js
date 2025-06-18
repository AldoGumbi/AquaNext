import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import {
  addProductThunk,
  getProductsThunk,
  editProductsThunk,
  deleteProductThunk,
  skuCheckAvailabilityThunk,
} from "./thunk.js";

const initialState = {
	products: [],
	loading: false,
	error: false,
	error_message: "",
}


const productsSlice = createSlice({
	name: "products",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
    // INSERT PRODUCT
    builder.addCase(addProductThunk.fulfilled, (state) => {
      state.loading = false;
      state.error = false;
    });
    builder.addCase(addProductThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload.error;
      state.error = true;
    });
    builder.addCase(addProductThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // GET PRODUCTS
    builder.addCase(getProductsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      state.products = action.payload.data;
    });
    builder.addCase(getProductsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload;
      state.error = true;
    });
    builder.addCase(getProductsThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // UPDATE PRODUCTS
    builder.addCase(editProductsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      // Update the products state with the new data
      const editedProduct = action.payload.data;

      const oldProducts = state.products;

      state.products  = oldProducts.map(item => {
        if (item.id === editedProduct.id) {
          return {
            nombre: editedProduct.name,
            descripcion: editedProduct.description,
            precio_venta : editedProduct.price,
            costo: editedProduct.cost,
            categoria : editedProduct.category,
            ...editedProduct,
          };
        }
        return item;
      });
      toast.success("Producto editado correctamente");
    });
    builder.addCase(editProductsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload;
      state.error = true;
      toast.error("Error al editar el producto" );
      console.log("Error editando el producto: ", action.payload.error);
    });
    builder.addCase(editProductsThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // DELETE PRODUCT
    builder.addCase(deleteProductThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = false;
      // Update the products state with the new data
      const deletedProduct = action.payload.data;

      state.products = state.products.filter(
        (item) => String(item.id) !== String(deletedProduct.id),
      );
    });
    builder.addCase(deleteProductThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload;
      state.error = true;
    });
    builder.addCase(deleteProductThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

    // SKU CHECK AVAILABILITY
    builder.addCase(skuCheckAvailabilityThunk.fulfilled, (state) => {
      state.loading = false;
      state.error = false;
    });
    builder.addCase(skuCheckAvailabilityThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload;
      state.error = true;
    });
    builder.addCase(skuCheckAvailabilityThunk.pending, (state) => {
      state.error = false;
      state.loading = true;
    });

  }
})

export default productsSlice.reducer;