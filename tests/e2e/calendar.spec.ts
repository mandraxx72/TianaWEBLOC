/**
 * Testes E2E para o Calendário de Ocupação
 * 
 * Cobre:
 * - Navegação entre meses
 * - Estados visuais das células
 * - Tooltips com informações
 * - Bloqueios externos
 * - Criação de reserva via calendário
 */

import { test, expect } from '@playwright/test';
import { format, addMonths, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import { loginAsAdmin } from '../utils/auth-helpers';

test.describe('Calendário de Ocupação', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    
    // Ir para aba de Quartos onde o calendário está
    await page.click('[data-testid="rooms-tab"]');
  });

  test('deve exibir o calendário de ocupação', async ({ page }) => {
    await expect(page.locator('[data-testid="occupancy-calendar"]')).toBeVisible();
  });

  test('deve exibir o mês atual por defeito', async ({ page }) => {
    const currentMonth = format(new Date(), 'MMMM yyyy', { locale: pt });
    
    await expect(page.locator('[data-testid="calendar-month-title"]')).toContainText(currentMonth);
  });

  test('deve navegar para o mês seguinte', async ({ page }) => {
    const nextMonth = format(addMonths(new Date(), 1), 'MMMM yyyy', { locale: pt });
    
    await page.click('[data-testid="next-month-button"]');
    
    await expect(page.locator('[data-testid="calendar-month-title"]')).toContainText(nextMonth);
  });

  test('deve navegar para o mês anterior', async ({ page }) => {
    const prevMonth = format(subMonths(new Date(), 1), 'MMMM yyyy', { locale: pt });
    
    await page.click('[data-testid="prev-month-button"]');
    
    await expect(page.locator('[data-testid="calendar-month-title"]')).toContainText(prevMonth);
  });

  test('deve exibir todos os quartos no calendário', async ({ page }) => {
    // Verificar que os 4 quartos estão listados
    await expect(page.locator('[data-testid="calendar-room-dunas"]')).toBeVisible();
    await expect(page.locator('[data-testid="calendar-room-baia-tranquila"]')).toBeVisible();
    await expect(page.locator('[data-testid="calendar-room-terraco-sol"]')).toBeVisible();
    await expect(page.locator('[data-testid="calendar-room-morabeza"]')).toBeVisible();
  });

  test('deve exibir legenda de estados', async ({ page }) => {
    await expect(page.locator('text=Disponível')).toBeVisible();
    await expect(page.locator('text=Check-in')).toBeVisible();
    await expect(page.locator('text=Ocupado')).toBeVisible();
    await expect(page.locator('text=Check-out')).toBeVisible();
    await expect(page.locator('text=Booking Externo')).toBeVisible();
  });

  test('deve mostrar tooltip ao passar o rato numa célula', async ({ page }) => {
    // Encontrar uma célula do calendário
    const cell = page.locator('[data-testid="calendar-cell"]').first();
    
    // Hover sobre a célula
    await cell.hover();
    
    // Verificar que o tooltip aparece
    await expect(page.locator('[role="tooltip"]')).toBeVisible();
  });

  test('deve destacar o dia atual', async ({ page }) => {
    const today = format(new Date(), 'd');
    
    // Procurar célula com o dia atual que tem destaque
    const todayCell = page.locator(`[data-testid="calendar-day-${today}"]`);
    
    // Verificar que tem a classe de destaque
    await expect(todayCell).toHaveClass(/ring-primary/);
  });

  test('deve abrir dialog ao clicar numa célula disponível', async ({ page }) => {
    // Encontrar uma célula disponível (verde)
    const availableCell = page.locator('[data-testid="calendar-cell-available"]').first();
    
    if (await availableCell.isVisible()) {
      await availableCell.click();
      
      // Verificar que o dialog abre
      await expect(page.locator('[data-testid="calendar-cell-dialog"]')).toBeVisible();
      
      // Verificar que tem opção de criar reserva
      await expect(page.locator('[data-testid="create-reservation-button"]')).toBeVisible();
    }
  });

  test('deve abrir dialog com detalhes da reserva ao clicar numa célula ocupada', async ({ page }) => {
    // Encontrar uma célula ocupada (vermelha)
    const occupiedCell = page.locator('[data-testid="calendar-cell-occupied"]').first();
    
    if (await occupiedCell.isVisible()) {
      await occupiedCell.click();
      
      // Verificar que o dialog abre
      await expect(page.locator('[data-testid="calendar-cell-dialog"]')).toBeVisible();
      
      // Verificar que mostra detalhes da reserva
      await expect(page.locator('[data-testid="reservation-details"]')).toBeVisible();
      await expect(page.locator('text=Número da Reserva')).toBeVisible();
    }
  });

  test('deve iniciar criação de reserva a partir do calendário', async ({ page }) => {
    // Encontrar célula disponível
    const availableCell = page.locator('[data-testid="calendar-cell-available"]').first();
    
    if (await availableCell.isVisible()) {
      await availableCell.click();
      
      // Clicar em criar reserva
      await page.click('[data-testid="create-reservation-button"]');
      
      // Verificar que o modal de criação de reserva abre
      await expect(page.locator('[data-testid="admin-create-reservation-modal"]')).toBeVisible();
    }
  });

  test('deve sincronizar calendários externos', async ({ page }) => {
    // Clicar no botão de sincronizar
    await page.click('[data-testid="sync-ical-button"]');
    
    // Verificar que mostra estado de sincronização
    await expect(page.locator('text=A sincronizar')).toBeVisible();
    
    // Aguardar conclusão (timeout maior para operação de rede)
    await expect(page.locator('text=Sincronizar iCal')).toBeVisible({ timeout: 10000 });
  });

  test('deve mostrar bloqueios externos em roxo', async ({ page }) => {
    // Se existirem bloqueios externos, devem aparecer em roxo
    const externalCell = page.locator('[data-testid="calendar-cell-external"]').first();
    
    if (await externalCell.isVisible()) {
      // Verificar cor roxa
      await expect(externalCell).toHaveClass(/bg-purple/);
      
      // Hover para ver fonte
      await externalCell.hover();
      await expect(page.locator('text=Fonte:')).toBeVisible();
    }
  });

});

test.describe('Calendário de Ocupação - Cores e Estados', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await page.click('[data-testid="rooms-tab"]');
  });

  test('deve usar cores corretas para cada estado', async ({ page }) => {
    // Verde para disponível
    const availableCell = page.locator('[data-testid="calendar-cell-available"]').first();
    if (await availableCell.isVisible()) {
      await expect(availableCell).toHaveClass(/bg-green/);
    }
    
    // Âmbar para check-in
    const checkinCell = page.locator('[data-testid="calendar-cell-checkin"]').first();
    if (await checkinCell.isVisible()) {
      await expect(checkinCell).toHaveClass(/bg-amber/);
    }
    
    // Vermelho para ocupado
    const occupiedCell = page.locator('[data-testid="calendar-cell-occupied"]').first();
    if (await occupiedCell.isVisible()) {
      await expect(occupiedCell).toHaveClass(/bg-red/);
    }
    
    // Azul para check-out
    const checkoutCell = page.locator('[data-testid="calendar-cell-checkout"]').first();
    if (await checkoutCell.isVisible()) {
      await expect(checkoutCell).toHaveClass(/bg-blue/);
    }
  });

});

test.describe('Calendário de Ocupação - Responsividade', () => {

  test.use({ viewport: { width: 768, height: 1024 } });

  test('deve mostrar nomes curtos dos quartos em tablet', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await page.click('[data-testid="rooms-tab"]');
    
    // Em ecrãs menores, deve mostrar abreviações
    await expect(page.locator('text=DUN')).toBeVisible();
    await expect(page.locator('text=BTQ')).toBeVisible();
  });

});

test.describe('Calendário de Ocupação - Interações', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await page.click('[data-testid="rooms-tab"]');
  });

  test('deve fechar dialog ao clicar fora', async ({ page }) => {
    const cell = page.locator('[data-testid="calendar-cell"]').first();
    await cell.click();
    
    // Verificar que dialog está aberto
    await expect(page.locator('[data-testid="calendar-cell-dialog"]')).toBeVisible();
    
    // Clicar fora (no overlay)
    await page.click('[data-testid="dialog-overlay"]');
    
    // Verificar que dialog fechou
    await expect(page.locator('[data-testid="calendar-cell-dialog"]')).not.toBeVisible();
  });

  test('deve manter navegação ao trocar de mês', async ({ page }) => {
    // Ir para próximo mês
    await page.click('[data-testid="next-month-button"]');
    
    // Voltar
    await page.click('[data-testid="prev-month-button"]');
    
    // Verificar que estamos no mês atual novamente
    const currentMonth = format(new Date(), 'MMMM yyyy', { locale: pt });
    await expect(page.locator('[data-testid="calendar-month-title"]')).toContainText(currentMonth);
  });

});
