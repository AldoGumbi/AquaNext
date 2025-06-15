import { createSlice } from '@reduxjs/toolkit';
import {
	createBasketThunk,
	getBasketThunk,
	updateBasketThunk,
	deleteBasketThunk,
	allBasketsThunk,
	insertBasketItemsThunk,
	deleteBasketItemThunk,
  updateBasketItemThunk
} from './thunk.js';

const initialState = {
	baskets: [],
	loading: false,
	error: false,

	basket_items : null,
	basket_total : 0,
	activeBasket : null
}

const basketSlice = createSlice({
	name: 'basket',
	initialState,
	reducers: {
		setActiveBasket(state, action) {
			state.activeBasket = action.payload;

			if(state.basket_items) {
				state.basket_total = state.basket_items.reduce((total, item) => {
					return total + (item.price * item.quantity);
				}, 0);
			}
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
		});
		builder.addCase(getBasketThunk.rejected, (state, action) => {
			state.loading = false;
			state.error_message = action.payload;
			state.error = true;
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

			state.loading = false;
			state.error = false;
		});
		builder.addCase(deleteBasketThunk.rejected, (state, action) => {
			state.loading = false;
			state.error_message = action.payload;
			state.error = true;
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
		builder.addCase(deleteBasketItemThunk.fulfilled, (state) => {
			state.loading = false;
			state.error = false;
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

    // UPDATE BASKET ITEM //updateBasketItemThunk
    builder.addCase(updateBasketItemThunk.fulfilled, (state, action) => {

      const id = action.payload.data.id;
      console.log("AHORA TENGO QUE ACTUALIZAR EL ESTADO DEL ITEMS QUE CONATENIA EL ID: ", id);
      state.loading = false;
      state.error = false;
    });
    builder.addCase(updateBasketItemThunk.rejected, (state, action) => {
      state.loading = false;
      state.error_message = action.payload;
      state.error = true;
    });
    builder.addCase(updateBasketItemThunk.pending, (state) => {
      state.loading = true;
      state.error = false;
    });


	}
});

export const { setActiveBasket } = basketSlice.actions;

export default basketSlice.reducer;