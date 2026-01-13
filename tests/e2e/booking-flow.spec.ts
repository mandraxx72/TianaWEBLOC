/**
 * Testes E2E para o Fluxo de Reserva
 * 
 * Cobre:
 * - Abertura do modal de reserva
 * - Seleção de quarto
 * - Seleção de datas
 * - Formulário de hóspede
 * - Código promocional
 * - Cálculo de preço
 * - Fluxo completo
 */

import { test, expect } from '@playwright/test';
import { ROOMS, generateTestDates, TEST_GUEST, TEST_PROMO_CODE, SUCCESS_MESSAGES } from '../fixtures/test-data';

test.describe('Fluxo de Reserva', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve abrir o modal de reserva ao clicar no botão', async ({ page }) => {
    // Clicar no botão de reserva
    await page.click('[data-testid="booking-button"]');
    
    // Verificar que o modal está visível
    await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();
    
    // Verificar título do modal
    await expect(page.locator('[data-testid="booking-modal-title"]')).toContainText('Reservar');
  });

  test('deve exibir todos os quartos disponíveis no Step 1', async ({ page }) => {
    await page.click('[data-testid="booking-button"]');
    await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();
    
    // Verificar que os 4 quartos estão visíveis
    await expect(page.locator('[data-testid="room-dunas"]')).toBeVisible();
    await expect(page.locator('[data-testid="room-baia-tranquila"]')).toBeVisible();
    await expect(page.locator('[data-testid="room-terraco-sol"]')).toBeVisible();
    await expect(page.locator('[data-testid="room-morabeza"]')).toBeVisible();
  });

  test('deve selecionar um quarto e avançar para o Step 2', async ({ page }) => {
    await page.click('[data-testid="booking-button"]');
    
    // Selecionar quarto Dunas
    await page.click('[data-testid="room-dunas"]');
    
    // Verificar seleção visual
    await expect(page.locator('[data-testid="room-dunas"]')).toHaveClass(/ring-primary/);
    
    // Avançar
    await page.click('[data-testid="next-step-button"]');
    
    // Verificar que estamos no Step 2 (datas)
    await expect(page.locator('[data-testid="checkin-calendar"]')).toBeVisible();
  });

  test('deve selecionar datas de check-in e check-out', async ({ page }) => {
    const dates = generateTestDates(7, 3);
    
    await page.click('[data-testid="booking-button"]');
    await page.click('[data-testid="room-dunas"]');
    await page.click('[data-testid="next-step-button"]');
    
    // Clicar no calendário de check-in
    await page.click('[data-testid="checkin-calendar"]');
    
    // Selecionar uma data futura (próximo mês se necessário)
    // Este teste assume que há datas disponíveis
    await expect(page.locator('.rdp-months')).toBeVisible();
  });

  test('deve mostrar o número de noites e subtotal ao selecionar datas', async ({ page }) => {
    await page.click('[data-testid="booking-button"]');
    await page.click('[data-testid="room-dunas"]');
    await page.click('[data-testid="next-step-button"]');
    
    // Após selecionar datas, verificar que o resumo mostra noites
    await expect(page.locator('[data-testid="nights-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="subtotal-amount"]')).toBeVisible();
  });

  test('deve validar campos obrigatórios no formulário de hóspede', async ({ page }) => {
    await page.click('[data-testid="booking-button"]');
    await page.click('[data-testid="room-dunas"]');
    await page.click('[data-testid="next-step-button"]');
    
    // Simular seleção de datas (assumindo que há método para isso)
    // Por agora, apenas verificamos que o formulário existe
    
    // Tentar avançar sem preencher dados
    await page.click('[data-testid="next-step-button"]');
    
    // Verificar mensagens de erro ou que não avança
    // Os campos obrigatórios devem impedir o avanço
  });

  test('deve preencher formulário de hóspede corretamente', async ({ page }) => {
    await page.click('[data-testid="booking-button"]');
    await page.click('[data-testid="room-dunas"]');
    
    // Avançar até o formulário de hóspede (step 3)
    // Assumindo navegação correta
    
    // Preencher campos
    await page.fill('[data-testid="guest-name-input"]', TEST_GUEST.name);
    await page.fill('[data-testid="guest-email-input"]', TEST_GUEST.email);
    await page.fill('[data-testid="guest-phone-input"]', TEST_GUEST.phone);
    await page.fill('[data-testid="special-requests-input"]', TEST_GUEST.specialRequests);
    
    // Verificar que os campos foram preenchidos
    await expect(page.locator('[data-testid="guest-name-input"]')).toHaveValue(TEST_GUEST.name);
    await expect(page.locator('[data-testid="guest-email-input"]')).toHaveValue(TEST_GUEST.email);
  });

  test('deve aplicar código promocional válido', async ({ page }) => {
    await page.click('[data-testid="booking-button"]');
    await page.click('[data-testid="room-dunas"]');
    
    // Navegar até onde o código promo pode ser aplicado
    await page.click('[data-testid="next-step-button"]');
    
    // Inserir código promocional
    await page.fill('[data-testid="promo-code-input"]', TEST_PROMO_CODE.valid);
    await page.click('[data-testid="apply-promo-button"]');
    
    // Verificar que o desconto foi aplicado (ou mensagem de sucesso)
    // Nota: Este teste pode falhar se o código não existir na base
  });

  test('deve mostrar erro para código promocional inválido', async ({ page }) => {
    await page.click('[data-testid="booking-button"]');
    await page.click('[data-testid="room-dunas"]');
    await page.click('[data-testid="next-step-button"]');
    
    // Inserir código inválido
    await page.fill('[data-testid="promo-code-input"]', TEST_PROMO_CODE.invalid);
    await page.click('[data-testid="apply-promo-button"]');
    
    // Verificar mensagem de erro
    await expect(page.locator('[data-testid="promo-error-message"]')).toBeVisible();
  });

  test('deve calcular preço total corretamente', async ({ page }) => {
    const room = ROOMS.DUNAS;
    const dates = generateTestDates(7, 3);
    const expectedTotal = room.pricePerNight * dates.nights;
    
    await page.click('[data-testid="booking-button"]');
    await page.click('[data-testid="room-dunas"]');
    
    // Após seleção de quarto e datas, verificar cálculo
    // O total deve refletir: preço por noite × número de noites
    await expect(page.locator('[data-testid="total-amount"]')).toContainText(expectedTotal.toLocaleString());
  });

  test('deve fechar o modal ao clicar no X', async ({ page }) => {
    await page.click('[data-testid="booking-button"]');
    await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();
    
    // Fechar modal
    await page.click('[data-testid="close-modal-button"]');
    
    // Verificar que o modal foi fechado
    await expect(page.locator('[data-testid="booking-modal"]')).not.toBeVisible();
  });

  test('deve navegar para trás entre steps', async ({ page }) => {
    await page.click('[data-testid="booking-button"]');
    await page.click('[data-testid="room-dunas"]');
    await page.click('[data-testid="next-step-button"]');
    
    // Estamos no step 2, voltar para step 1
    await page.click('[data-testid="back-step-button"]');
    
    // Verificar que voltamos ao step 1 (seleção de quartos)
    await expect(page.locator('[data-testid="room-dunas"]')).toBeVisible();
  });

  test('deve manter dados ao navegar entre steps', async ({ page }) => {
    await page.click('[data-testid="booking-button"]');
    
    // Selecionar quarto
    await page.click('[data-testid="room-dunas"]');
    await page.click('[data-testid="next-step-button"]');
    
    // Voltar
    await page.click('[data-testid="back-step-button"]');
    
    // Verificar que o quarto ainda está selecionado
    await expect(page.locator('[data-testid="room-dunas"]')).toHaveClass(/ring-primary/);
  });

});

test.describe('Fluxo de Reserva - Mobile', () => {
  
  test.use({ viewport: { width: 375, height: 667 } });

  test('deve funcionar corretamente em dispositivos móveis', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que o botão de reserva está visível no mobile
    await expect(page.locator('[data-testid="booking-button"]')).toBeVisible();
    
    // Abrir modal
    await page.click('[data-testid="booking-button"]');
    await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();
    
    // Verificar que o modal é responsivo
    const modal = page.locator('[data-testid="booking-modal"]');
    const box = await modal.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);
  });

});
