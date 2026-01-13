/**
 * Helpers de autenticação para testes E2E
 */

import { Page } from '@playwright/test';
import { TEST_ADMIN, TEST_STAFF, TEST_USER } from '../fixtures/test-data';

/**
 * Fazer login com credenciais específicas
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/auth');
  
  // Preencher formulário de login
  await page.fill('[data-testid="auth-email-input"]', email);
  await page.fill('[data-testid="auth-password-input"]', password);
  
  // Clicar em entrar
  await page.click('[data-testid="auth-submit-button"]');
  
  // Aguardar navegação
  await page.waitForURL('/');
}

/**
 * Login como admin
 */
export async function loginAsAdmin(page: Page) {
  await login(page, TEST_ADMIN.email, TEST_ADMIN.password);
}

/**
 * Login como staff
 */
export async function loginAsStaff(page: Page) {
  await login(page, TEST_STAFF.email, TEST_STAFF.password);
}

/**
 * Login como utilizador normal
 */
export async function loginAsUser(page: Page) {
  await login(page, TEST_USER.email, TEST_USER.password);
}

/**
 * Fazer logout
 */
export async function logout(page: Page) {
  // Clicar no menu de utilizador e logout
  await page.click('[data-testid="user-menu-button"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL('/');
}

/**
 * Verificar se o utilizador está autenticado
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('[data-testid="user-menu-button"]', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verificar se o utilizador tem acesso admin
 */
export async function hasAdminAccess(page: Page): Promise<boolean> {
  try {
    await page.goto('/admin');
    await page.waitForSelector('[data-testid="admin-dashboard"]', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Limpar sessão (cookies e localStorage)
 */
export async function clearSession(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
