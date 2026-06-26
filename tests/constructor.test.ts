import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.routeFromHAR('./tests/hars/api.har', {
      notFound: 'abort',
      update: false,
      url: '**/api/ingredients'
    });

    await page.routeFromHAR('./tests/hars/user.har', {
      notFound: 'abort',
      update: false,
      url: '**/api/auth/user'
    });

    await context.addCookies([
      { name: 'accessToken', value: 'Bearer test-token', domain: 'localhost', path: '/' }
    ]);

    await page.goto('/');

    await page.evaluate(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await page.waitForSelector('h3:has-text("Булки")');
  });

  test.describe('Добавление ингредиентов', () => {
    test('должен добавить булку в конструктор', async ({ page }) => {
      const bunName = await page.locator('li a').first().locator('p').last().textContent();
      await page.locator('li').filter({ hasText: 'Добавить' }).first().locator('button').click();
      await expect(page.locator('section').last()).toContainText(bunName || '');
    });

    test('должен добавить начинку в конструктор', async ({ page }) => {
      await page.locator('h3:has-text("Начинки")').waitFor();
      const firstFilling = page.locator('h3:has-text("Начинки") + ul li').first();
      const fillingName = await firstFilling.locator('p').last().textContent();
      await firstFilling.locator('button').click();
      await expect(page.locator('section').last()).toContainText(fillingName || '');
    });
  });

  test.describe('Модальное окно ингредиента', () => {
    test('должен открыться при клике на ингредиент', async ({ page }) => {
      await page.locator('li a').first().click();
      await expect(page.locator('#modals')).not.toBeEmpty();
      await expect(page.locator('h3:has-text("Детали ингредиента")')).toBeVisible();
    });

    test('должен показать данные правильного ингредиента', async ({ page }) => {
      const firstIngredient = page.locator('li a').first();
      const ingredientName = await firstIngredient.locator('p').last().textContent();
      await firstIngredient.click();
      await expect(page.locator('#modals')).toContainText(ingredientName || '');
    });

    test('должен закрыться по клику на крестик', async ({ page }) => {
      await page.locator('li a').first().click();
      await expect(page.locator('#modals')).not.toBeEmpty();
      await page.locator('#modals button').click();
      await expect(page.locator('#modals')).toBeEmpty();
    });

    test('должен закрыться по клику на оверлей', async ({ page }) => {
      await page.locator('li a').first().click();
      await expect(page.locator('#modals')).not.toBeEmpty();
      await page.mouse.click(10, 400);
      await expect(page.locator('#modals')).toBeEmpty();
    });
  });

  test.describe('Создание заказа', () => {
    test.beforeEach(async ({ page }) => {
      await page.routeFromHAR('./tests/hars/order.har', {
        notFound: 'abort',
        update: false,
        url: '**/api/orders'
      });
    });

    test.afterEach(async ({ page, context }) => {
      await context.clearCookies();
      await page.evaluate(() => localStorage.clear());
    });

    test('должен создать заказ и показать номер', async ({ page }) => {
      await page.locator('li').filter({ hasText: 'Добавить' }).first().locator('button').click();
      await page.locator('h3:has-text("Начинки") + ul li button').first().click();
      await page.locator('button:has-text("Оформить заказ")').click();
      await expect(page.locator('#modals')).not.toBeEmpty({ timeout: 15000 });
      await expect(page.locator('#modals')).toContainText('12345');
    });

    test('должен очистить конструктор после заказа', async ({ page }) => {
      await page.locator('li').filter({ hasText: 'Добавить' }).first().locator('button').click();
      const fillingName = await page.locator('h3:has-text("Начинки") + ul li').first().locator('p').last().textContent();
      await page.locator('h3:has-text("Начинки") + ul li button').first().click();
      await page.locator('button:has-text("Оформить заказ")').click();
      await expect(page.locator('#modals')).not.toBeEmpty({ timeout: 15000 });
      await page.locator('#modals button').click();
      await expect(page.locator('text=Выберите булки').first()).toBeVisible();
      await expect(page.locator('text=Выберите начинку')).toBeVisible();
      await expect(page.locator('section').last()).not.toContainText(fillingName || '');
    });
  });
});