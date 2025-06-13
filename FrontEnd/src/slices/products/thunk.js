import { createAsyncThunk } from "@reduxjs/toolkit";

import {
	addProduct,
	getProducts,
	editAllProducts,
	deleteProduct,
  skuCheckAvailability
} from "../../backend/connection.js";

// Create an async thunk for adding a product
export const addProductThunk = createAsyncThunk("products/add", async (data, { rejectWithValue }) => {
		try {
			const response = await addProduct(data);
			return response;
		} catch (error) {
			console.log("Error 500 al insertar el producto, thunk.js: ",error);
			return rejectWithValue({error});
		}
	}
);

export const getProductsThunk =
	createAsyncThunk("products/get", async (_, { rejectWithValue }) => {
		try {
			const response = await getProducts();
			return response;
		} catch (error) {
			console.log("Error 500 al obtener todos los productos, thunk.js: ", error);
			return rejectWithValue({ error });
		}
	}
);

export const editAllProductsThunk =
	createAsyncThunk("/products/update-product", async ({id,data}, { rejectWithValue }) => {
	try {
		const response = await editAllProducts(id, data);
		return response;
	}catch (error) {
		console.log("Error 500 al editar el producto, thunk.js: ", error);
		return rejectWithValue({ error });
	}
}
);

export const deleteProductThunk =
	createAsyncThunk("/products/delete-product", async (id, { rejectWithValue }) => {
		try {
			const response = await deleteProduct(id);
			return response;
		} catch (error) {
			console.log("Error 500 al eliminar el producto, thunk.js: ", error);
			return rejectWithValue({ error });
		}
	}
);

// Check SKU availability
export const skuCheckAvailabilityThunk =
  createAsyncThunk("products/checkSkuAvailable", async (sku, { rejectWithValue }) => {
    try {
      return await skuCheckAvailability(sku);
    } catch (error) {
      return rejectWithValue({ error });
    }
  }
);
