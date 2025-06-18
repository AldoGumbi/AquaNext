import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createBasket,
  getBasket,
  updateBasket,
  deleteBasket,
  allBaskets,
  insertBasketItems,
  deleteBasketItem,
  updateBasketItem
} from "../../backend/connection.js";

// import { setActiveBasket} from "./reducer.js";

// Create an async thunk for creating a basket
export const createBasketThunk = createAsyncThunk("basket/create", async (data, { rejectWithValue }) => {
	try {
		const response = await createBasket(data);
		return response;
	} catch (error) {
		console.log("Error 500 al crear la cesta, thunk.js: ", error);
		return rejectWithValue({ error });
	}
});
// Create an async thunk for getting a basket by ID
export const getBasketThunk = createAsyncThunk("basket/get", async (id, { rejectWithValue }) => {
	try {
		const response = await getBasket(id);
		return response;
	} catch (error) {
		console.log("Error 500 al obtener la cesta, thunk.js: ", error);
		return rejectWithValue({ error });
	}
});
// Create an async thunk for updating a basket by ID
export const updateBasketThunk = createAsyncThunk("basket/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await updateBasket(id, data);
		return response;
	} catch (error) {
		console.log("Error 500 al actualizar la cesta, thunk.js: ", error);
		return rejectWithValue({ error });
	}
});
// Create an async thunk for deleting a basket by ID
export const deleteBasketThunk = createAsyncThunk("basket/delete", async (id, { rejectWithValue }) => {
	try {
		const response = await deleteBasket(id);
		return response;
	} catch (error) {
		console.log("Error 500 al eliminar la cesta, thunk.js: ", error);
		return rejectWithValue({ error });
	}
});
// Create an async thunk for getting all baskets
export const allBasketsThunk = createAsyncThunk("basket/all", async (_, { rejectWithValue }) => {
	try {
		return await allBaskets();
	} catch (error) {
		console.log("Error 500 al obtener todas las cestas, thunk.js: ", error);
		return rejectWithValue({ error });
	}
});
// Create an async thunk for inserting items into a basket
export const insertBasketItemsThunk = createAsyncThunk("basket/insertItems", async (data, { rejectWithValue }) => {
  try {
    return await insertBasketItems(data);
  } catch (error) {
    console.log("Error 500 al insertar items en la cesta, thunk.js: ", error);
    return rejectWithValue({ error });
  }
});
// Create an async thunk for deleting an item from a basket
export const deleteBasketItemThunk = createAsyncThunk("basket/deleteItem", async (id, { rejectWithValue }) => {
  try {
    return await deleteBasketItem(id);
  } catch (error) {
    console.log("Error 500 al eliminar un item de la cesta, thunk.js: ", error);
    return rejectWithValue({ error });
  }
});
// Create an async thunk for updating an item in a basket
export const updateBasketItemThunk = createAsyncThunk("basket/updateItem", async (data, { rejectWithValue }) => {
  try {
    return await updateBasketItem(Number(data.id) , data);
  } catch (error) {
    console.log("Error 500 al actualizar un item de la cesta, thunk.js: ", error);
    return rejectWithValue({ error });
  }
});

