import { createSlice } from '@reduxjs/toolkit';
import {
	createBasketThunk,
	getBasketThunk,
	updateBasketThunk,
	deleteBasketThunk,
	allBasketsThunk,
	insertBasketItemsThunk,
	deleteBasketItemThunk,
  // updateBasketItemThunk
} from './thunk.js';
import { toast } from "sonner";

const initialState = {
	baskets: [],
	loading: false,
	error: false,
  
  // productos relacionados al carrito
	basket_items : null,
  // valor total de todos los productos relacionados al carrito
	basket_total : 0,
  // ID del carrito activo
	activeBasket : null
}

const basketSlice = createSlice({
	name: 'basket',
	initialState,
	reducers: {
		setActiveBasket(state, action) {
			state.activeBasket = action.payload;
		}
	},
	extraReducers: (builder) => {
		// CREATE BASKET
		builder.addCase(createBasketThunk.fulfilled, (state,action) => {
			state.loading = false;
			state.error = false;

			state.baskets.push({id: action.payload.data});
			state.activeBasket = action.payload.data;
		});
		builder.addCase(createBasketThunk.rejected, (state, action) => {
			state.loading = false;
			state.error = true;
			state.error_message = action.payload;
      const ans = action.payload;
      
      console.error("Error al crear un carrito: ", action.payload.error);
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al crear el carrito!");
      }
		});
		builder.addCase(createBasketThunk.pending, (state) => {
			state.loading = true;
			state.error = false;
		});

		// GET BASKET by ID
		builder.addCase(getBasketThunk.fulfilled, (state, action) => {
			state.loading = false;
			state.error = false;
			state.basket_items = action.payload.data
      console.log("Items: ", action.payload.data);
      
      // calculador del valor total de los items vinculados al carrito
      state.basket_total = action.payload.data.reduce((total, item) => {
        const precio = parseFloat(item.precio_venta) || 0;
        const cantidad = Number(item.cantidad) || 0;
        return total + (precio * cantidad);
      }, 0);
      
   
		});
		builder.addCase(getBasketThunk.rejected, (state, action) => {
			state.loading = false;
			state.error_message = action.payload;
			state.error = true;
      const ans = action.payload;
      
      console.error("Error al obtener el carrito por idenficador: ", action.payload.error);
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al obtener el carrito unico!");
      }
		});
		builder.addCase(getBasketThunk.pending, (state) => {
			state.loading = true;
			state.error = false;
		});

		// UPDATE BASKET
		builder.addCase(updateBasketThunk.fulfilled, (state) => {
			state.loading = false;
			state.error = false;
		});
		builder.addCase(updateBasketThunk.rejected, (state, action) => {
			state.loading = false;
			state.error_message = action.payload;
			state.error = true;
      const ans = action.payload;
      
      console.error("Error al actualizar el carrito: ", action.payload.error);
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al actualizar el carrito!");
      }
		});
		builder.addCase(updateBasketThunk.pending, (state) => {
			state.loading = true;
			state.error = false;
		});

		// DELETE BASKET
		builder.addCase(deleteBasketThunk.fulfilled, (state, action) => {
			// Remove the basket from the state
			const id = Number(action.payload.data);
			const newBaskets = state.baskets.filter(basket => basket.id !== id);

			state.activeBasket = newBaskets.length > 0 ? newBaskets[0].id : null;
			state.baskets = newBaskets;

      state.basket_items = null; // Clear basket items when basket is deleted

			state.loading = false;
			state.error = false;
		});
		builder.addCase(deleteBasketThunk.rejected, (state, action) => {
			state.loading = false;
			state.error_message = action.payload;
			state.error = true;
      const ans = action.payload;
      
      console.error("Error al borrar el carrito: ", action.payload.error);
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al borrar el carrito!");
      }
		});
		builder.addCase(deleteBasketThunk.pending, (state) => {
			state.loading = true;
			state.error = false;
		});

		// GET ALL BASKETS allBasketsThunk
		builder.addCase(allBasketsThunk.fulfilled, (state, action) => {
			state.loading = false;
			state.error = false;
			state.baskets = action.payload.data;
		});
		builder.addCase(allBasketsThunk.rejected, (state, action) => {
			state.loading = false;
			state.error_message = action.payload;
			state.error = true;
      const ans = action.payload;
      
      console.error("Error al obtener los carritos: ", action.payload.error);
      if (ans?.error?.API_message) {
        toast.error(`${ans?.error?.API_message}`);
      } else {
        toast.error("Error al obtener los carritos!");
      }
		});
		builder.addCase(allBasketsThunk.pending, (state) => {
			state.loading = true;
			state.error = false;
		});

		// INSERT BASKET ITEMS
		builder.addCase(insertBasketItemsThunk.fulfilled, (state, action) => {

			state.basket_items = [
				...(state.basket_items || []),
				action.payload.data

			];
      state.basket_total = state.basket_items.reduce((total, item) => {
        const precio = parseFloat(item.precio_venta) || 0;
        const cantidad = Number(item.cantidad) || 0;
        return total + (precio * cantidad);
      }, 0);
      
      state.loading = false;
			state.error = false;
		});
		builder.addCase(insertBasketItemsThunk.rejected, (state, action) => {
			state.loading = false;
			state.error_message = action.payload;
			state.error = true;
		});
		builder.addCase(insertBasketItemsThunk.pending, (state) => {
			state.loading = true;
			state.error = false;
		});

		// DELETE BASKET ITEM
		builder.addCase(deleteBasketItemThunk.fulfilled, (state,action) => {
      // basket items from the global state
			state.loading = false;
			state.error = false;
      // action.payload.data contains the ID of the item to delete
      const basketItems = state.basket_items || [];
      const itemIdToDelete = action.payload.data;

      // Filter out the item with the ID to delete
      const updatedBasketItems = basketItems.filter(item => item.id !== itemIdToDelete);
      // Update the state with the new basket items
      state.basket_items = updatedBasketItems;
      
      // recalculating the total between the items
      state.basket_total = updatedBasketItems.reduce((total, item) => {
        const precio = parseFloat(item.precio_venta) || 0;
        const cantidad = Number(item.cantidad) || 0;
        return total + (precio * cantidad);
      }, 0);
		});
		builder.addCase(deleteBasketItemThunk.rejected, (state, action) => {
			state.loading = false;
			state.error_message = action.payload;
			state.error = true;
		});
		builder.addCase(deleteBasketItemThunk.pending, (state) => {
			state.loading = true;
			state.error = false;
		});
  
  }
});

export const { setActiveBasket } = basketSlice.actions;

export default basketSlice.reducer;