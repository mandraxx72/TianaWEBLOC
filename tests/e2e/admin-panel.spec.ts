/**
 * Testes E2E para o Painel Administrativo
 * 
 * Cobre:
 * - Acesso negado para não-admin
 * - Login admin
 * - Lista de reservas
 * - Filtros e pesquisa
 * - Ações em massa
 * - Gestão de utilizadores (só admin)
 */

import { test, expect } from '@playwright/test';
import { TEST_ADMIN, TEST_STAFF, TEST_USER, RESERVATION_STATUSES } from '../fixtures/test-data';
import { loginAsAdmin, loginAsStaff, loginAsUser, clearSession } from '../utils/auth-helpers';

test.describe('Painel Administrativo - Acesso', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('deve redirecionar utilizador não autenticado para login', async ({ page }) => {
    await page.goto('/admin');
    
    // Deve redirecionar para a página de autenticação
    await expect(page).toHaveURL(/\/auth/);
  });

  test('deve negar acesso a utilizador sem role admin/staff', async ({ page }) => {
    // Fazer login como utilizador normal
    await loginAsUser(page);
    
    // Tentar acessar admin
    await page.goto('/admin');
    
    // Deve mostrar toast de acesso negado e redirecionar
    await expect(page.locator('text=Acesso negado')).toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('deve permitir acesso a utilizador staff', async ({ page }) => {
    await loginAsStaff(page);
    
    await page.goto('/admin');
    
    // Deve ver o dashboard admin
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
  });

  test('deve permitir acesso completo a utilizador admin', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin');
    
    // Deve ver o dashboard admin
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
    
    // Deve ver aba de gestão de utilizadores (só admin)
    await expect(page.locator('[data-testid="users-tab"]')).toBeVisible();
  });

});

test.describe('Painel Administrativo - Reservas', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
  });

  test('deve exibir lista de reservas', async ({ page }) => {
    // Verificar que a tabela de reservas está visível
    await expect(page.locator('[data-testid="reservations-table"]')).toBeVisible();
    
    // Verificar cabeçalhos da tabela
    await expect(page.locator('text=Número Reserva')).toBeVisible();
    await expect(page.locator('text=Hóspede')).toBeVisible();
    await expect(page.locator('text=Quarto')).toBeVisible();
  });

  test('deve filtrar reservas por pesquisa de nome', async ({ page }) => {
    const searchTerm = 'João';
    
    // Inserir termo de pesquisa
    await page.fill('[data-testid="search-input"]', searchTerm);
    
    // Aguardar filtragem
    await page.waitForTimeout(500);
    
    // Verificar que os resultados contêm o termo
    const rows = page.locator('[data-testid="reservation-row"]');
    const count = await rows.count();
    
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      await expect(row).toContainText(searchTerm);
    }
  });

  test('deve filtrar reservas por status', async ({ page }) => {
    // Selecionar filtro de status
    await page.click('[data-testid="status-filter"]');
    await page.click(`[data-testid="status-option-confirmed"]`);
    
    // Verificar que só reservas confirmadas são exibidas
    const statusBadges = page.locator('[data-testid="reservation-status"]');
    const count = await statusBadges.count();
    
    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toContainText('Confirmada');
    }
  });

  test('deve alterar status de uma reserva', async ({ page }) => {
    // Encontrar a primeira reserva
    const firstRow = page.locator('[data-testid="reservation-row"]').first();
    
    // Abrir dropdown de status
    await firstRow.locator('[data-testid="status-dropdown"]').click();
    
    // Selecionar novo status
    await page.click('[data-testid="status-cancelled"]');
    
    // Verificar toast de sucesso
    await expect(page.locator('text=Status atualizado')).toBeVisible();
  });

  test('deve selecionar múltiplas reservas', async ({ page }) => {
    // Clicar no checkbox "selecionar todos"
    await page.click('[data-testid="select-all-checkbox"]');
    
    // Verificar que todas as checkboxes estão selecionadas
    const checkboxes = page.locator('[data-testid="reservation-checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('deve arquivar reservas selecionadas', async ({ page }) => {
    // Selecionar primeira reserva
    await page.locator('[data-testid="reservation-checkbox"]').first().click();
    
    // Clicar em arquivar
    await page.click('[data-testid="archive-selected-button"]');
    
    // Confirmar ação
    await page.click('[data-testid="confirm-archive-button"]');
    
    // Verificar toast de sucesso
    await expect(page.locator('text=arquivada')).toBeVisible();
  });

  test('deve exportar reservas para CSV', async ({ page }) => {
    // Clicar em exportar
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-csv-button"]'),
    ]);
    
    // Verificar que o ficheiro foi baixado
    expect(download.suggestedFilename()).toContain('reservas');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('deve eliminar reserva com confirmação', async ({ page }) => {
    // Encontrar botão de eliminar na primeira reserva
    const deleteButton = page.locator('[data-testid="delete-reservation-button"]').first();
    await deleteButton.click();
    
    // Modal de confirmação deve aparecer
    await expect(page.locator('[data-testid="confirm-delete-dialog"]')).toBeVisible();
    
    // Confirmar eliminação
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verificar toast de sucesso
    await expect(page.locator('text=eliminada')).toBeVisible();
  });

});

test.describe('Painel Administrativo - Gestão de Utilizadores', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    
    // Ir para aba de utilizadores
    await page.click('[data-testid="users-tab"]');
  });

  test('deve exibir lista de roles de utilizadores', async ({ page }) => {
    await expect(page.locator('[data-testid="user-roles-table"]')).toBeVisible();
  });

  test('deve adicionar novo role de utilizador', async ({ page }) => {
    const testUUID = '12345678-1234-1234-1234-123456789012';
    
    // Preencher UUID do utilizador
    await page.fill('[data-testid="new-user-uuid-input"]', testUUID);
    
    // Selecionar role
    await page.click('[data-testid="new-user-role-select"]');
    await page.click('[data-testid="role-option-staff"]');
    
    // Adicionar
    await page.click('[data-testid="add-role-button"]');
    
    // Verificar feedback (sucesso ou erro de duplicado)
  });

  test('deve remover role de utilizador', async ({ page }) => {
    // Encontrar botão de remover no primeiro role
    const removeButton = page.locator('[data-testid="remove-role-button"]').first();
    
    if (await removeButton.isVisible()) {
      await removeButton.click();
      
      // Verificar toast
      await expect(page.locator('text=removido')).toBeVisible();
    }
  });

});

test.describe('Painel Administrativo - Navegação', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
  });

  test('deve navegar entre abas', async ({ page }) => {
    // Ir para Quartos
    await page.click('[data-testid="rooms-tab"]');
    await expect(page.locator('[data-testid="rooms-panel"]')).toBeVisible();
    
    // Ir para Estatísticas
    await page.click('[data-testid="stats-tab"]');
    await expect(page.locator('[data-testid="stats-panel"]')).toBeVisible();
    
    // Ir para Promoções
    await page.click('[data-testid="promotions-tab"]');
    await expect(page.locator('[data-testid="promotions-panel"]')).toBeVisible();
    
    // Ir para Calendários
    await page.click('[data-testid="calendars-tab"]');
    await expect(page.locator('[data-testid="calendars-panel"]')).toBeVisible();
  });

  test('deve voltar para a página inicial', async ({ page }) => {
    await page.click('[data-testid="back-home-button"]');
    
    await expect(page).toHaveURL('/');
  });

});
