import ingredientsReducer, {
  fetchIngredients
} from '../ingredientsSlice';

const mockIngredient = {
  _id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react-burger/images/bun-02.png',
  image_large: 'https://code.s3.yandex.net/react-burger/images/bun-02-large.png',
  image_mobile: 'https://code.s3.yandex.net/react-burger/images/bun-02-mobile.png'
};

const initialState = {
  ingredients: [],
  isLoading: false,
  error: null
};

describe('ingredientsSlice', () => {
  it('должен вернуть начальное состояние при неизвестном экшене', () => {
    const result = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  it('fetchIngredients.pending — isLoading должен стать true', () => {
    const result = ingredientsReducer(initialState, fetchIngredients.pending(''));
    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('fetchIngredients.fulfilled — ingredients должны сохраниться', () => {
    const result = ingredientsReducer(
      initialState,
      fetchIngredients.fulfilled([mockIngredient], '')
    );
    expect(result.isLoading).toBe(false);
    expect(result.ingredients).toEqual([mockIngredient]);
  });

  it('fetchIngredients.rejected — error должен сохраниться', () => {
    const action = {
      type: fetchIngredients.rejected.type,
      error: { message: 'Ошибка загрузки' }
    };
    const result = ingredientsReducer(initialState, action);
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe('Ошибка загрузки');
  });
});