import constructorReducer, {
  addIngredient,
  removeIngredient,
  clearConstructor,
  moveIngredient,
  orderBurger
} from '../constructorSlice';

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

const mockFilling = {
  _id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react-burger/images/meat-01.png',
  image_large: 'https://code.s3.yandex.net/react-burger/images/meat-01-large.png',
  image_mobile: 'https://code.s3.yandex.net/react-burger/images/meat-01-mobile.png'
};

const mockOrder = {
  _id: 'order123',
  status: 'done',
  name: 'Тестовый бургер',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  number: 12345,
  ingredients: ['643d69a5c3f7b9001cfa093c']
};

const initialState = {
  bun: null,
  ingredients: [],
  orderRequest: false,
  orderModalData: null
};

describe('constructorSlice', () => {
  it('должен вернуть начальное состояние при неизвестном экшене', () => {
    const result = constructorReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  it('addIngredient — булка должна добавиться в bun', () => {
    const result = constructorReducer(initialState, addIngredient(mockIngredient));
    expect(result.bun).not.toBeNull();
    expect(result.bun?._id).toBe(mockIngredient._id);
  });

  it('addIngredient — начинка должна добавиться в ingredients', () => {
    const result = constructorReducer(initialState, addIngredient(mockFilling));
    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0]._id).toBe(mockFilling._id);
  });

  it('removeIngredient — ингредиент должен удалиться', () => {
    const stateWithIngredient = constructorReducer(
      initialState,
      addIngredient(mockFilling)
    );
    const id = stateWithIngredient.ingredients[0].id;
    const result = constructorReducer(
      stateWithIngredient,
      removeIngredient(id)
    );
    expect(result.ingredients).toHaveLength(0);
  });

  it('moveIngredient — ингредиент должен переместиться вниз', () => {
    let state = constructorReducer(initialState, addIngredient(mockFilling));
    state = constructorReducer(state, addIngredient({ ...mockFilling, _id: 'id2' }));
    const result = constructorReducer(
      state,
      moveIngredient({ index: 0, direction: 'down' })
    );
    expect(result.ingredients[0]._id).toBe('id2');
    expect(result.ingredients[1]._id).toBe(mockFilling._id);
  });

  it('clearConstructor — должен очистить orderModalData', () => {
    const stateWithModal = { ...initialState, orderModalData: mockOrder };
    const result = constructorReducer(stateWithModal, clearConstructor());
    expect(result.orderModalData).toBeNull();
  });

  it('orderBurger.pending — orderRequest должен стать true', () => {
    const result = constructorReducer(initialState, orderBurger.pending('', []));
    expect(result.orderRequest).toBe(true);
  });

  it('orderBurger.fulfilled — должен сохранить заказ и очистить конструктор', () => {
    const result = constructorReducer(
      initialState,
      orderBurger.fulfilled(mockOrder, '', [])
    );
    expect(result.orderRequest).toBe(false);
    expect(result.orderModalData).toEqual(mockOrder);
    expect(result.bun).toBeNull();
    expect(result.ingredients).toHaveLength(0);
  });

  it('orderBurger.rejected — orderRequest должен стать false', () => {
    const result = constructorReducer(
      { ...initialState, orderRequest: true },
      orderBurger.rejected(null, '', [])
    );
    expect(result.orderRequest).toBe(false);
  });
});