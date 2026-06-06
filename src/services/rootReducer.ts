import { combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer from './slices/ingredientsSlice';
import userReducer from './slices/userSlice';
import constructorReducer from './slices/constructorSlice';
import feedReducer from './slices/feedSlice';
import ordersReducer from './slices/ordersSlice';

export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  user: userReducer,
  burgerConstructor: constructorReducer,
  feed: feedReducer,
  orders: ordersReducer
});
