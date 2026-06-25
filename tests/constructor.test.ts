import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('./tests/hars/api.har', {
      notFound: 'fallback',
      update: false
    });
    await page.goto('/');
    await page.waitForSelector('h3:has-text("Булки")');
  });

  test.describe('Добавление ингредиентов', () => {
    test('должен добавить булку в конструктор', async ({ page }) => {
      await page.locator('li').filter({ hasText: 'Добавить' }).first().locator('button').click();
      await expect(page.locator('text=Выберите булки')).not.toBeVisible();
    });

    test('должен добавить начинку в конструктор', async ({ page }) => {
      await page.locator('h3:has-text("Начинки")').waitFor();
      const fillingSection = page.locator('h3:has-text("Начинки") + ul');
      await fillingSection.locator('button').first().click();
      await expect(page.locator('text=Выберите начинку')).not.toBeVisible();
    });
  });

  test.describe('Модальное окно ингредиента', () => {
    test('должен открыться при клике на ингредиент', async ({ page }) => {
      await page.locator('li a').first().click();
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
      await expect(page.locator('h3:has-text("Детали ингредиента")')).toBeVisible();
      await page.locator('#modals button').click();
      await expect(page.locator('h3:has-text("Детали ингредиента")')).not.toBeVisible();
    });

    test('должен закрыться по клику на оверлей', async ({ page }) => {
      await page.locator('li a').first().click();
      await expect(page.locator('h3:has-text("Детали ингредиента")')).toBeVisible();
      await page.mouse.click(10, 400);
      await expect(page.locator('h3:has-text("Детали ингредиента")')).not.toBeVisible();
    });
  });

  test.describe('Создание заказа', () => {
    test.beforeEach(async ({ page, context }) => {
      await page.route('**/api/auth/user', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: { email: 'test@test.com', name: 'Test User' }
          })
        });
      });

      await page.route('**/api/orders', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            name: 'Тестовый бургер',
            order: {
              _id: 'test-order-id',
              status: 'done',
              name: 'Тестовый бургер',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
              number: 12345,
              ingredients: []
            }
          })
        });
      });

      await context.addCookies([
        {
          name: 'accessToken',
          value: 'Bearer test-token',
          domain: 'localhost',
          path: '/'
        }
      ]);
      await page.evaluate(() => {
        localStorage.setItem('refreshToken', 'test-refresh-token');
      });
      await page.reload();
      await page.waitForSelector('h3:has-text("Булки")');
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
      await page.locator('h3:has-text("Начинки") + ul li button').first().click();
      await page.locator('button:has-text("Оформить заказ")').click();
      await expect(page.locator('#modals')).not.toBeEmpty({ timeout: 15000 });
      await page.locator('#modals button').click();
      await expect(page.locator('text=Выберите булки').first()).toBeVisible();
    });
  });
});