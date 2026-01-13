/**
 * Dados de teste reutilizáveis para os testes E2E
 */

import { format, addDays } from 'date-fns';

// Quartos disponíveis
export const ROOMS = {
  DUNAS: {
    id: 'dunas',
    name: 'Dunas',
    pricePerNight: 10500,
  },
  BAIA_TRANQUILA: {
    id: 'baia-tranquila',
    name: 'Baía Tranquila',
    pricePerNight: 14500,
  },
  TERRACO_SOL: {
    id: 'terraco-sol',
    name: 'Terraço Sol',
    pricePerNight: 13500,
  },
  MORABEZA: {
    id: 'morabeza',
    name: 'Morabeza',
    pricePerNight: 15500,
  },
} as const;

// Gerar datas de teste dinâmicas (para evitar datas passadas)
export const generateTestDates = (daysFromNow: number = 7, nights: number = 3) => {
  const checkIn = addDays(new Date(), daysFromNow);
  const checkOut = addDays(checkIn, nights);
  
  return {
    checkIn,
    checkOut,
    checkInFormatted: format(checkIn, 'yyyy-MM-dd'),
    checkOutFormatted: format(checkOut, 'yyyy-MM-dd'),
    nights,
  };
};

// Dados de hóspede para teste
export const TEST_GUEST = {
  name: 'João Teste Silva',
  email: 'joao.teste@example.com',
  phone: '+238 999 00 00',
  specialRequests: 'Quarto com vista para o mar, se possível.',
};

// Dados de hóspede inválidos para teste de validação
export const INVALID_GUEST = {
  name: '',
  email: 'email-invalido',
  phone: '',
};

// Código promocional de teste
export const TEST_PROMO_CODE = {
  valid: 'TESTE10',
  invalid: 'CODIGOINVALIDO',
  expired: 'EXPIRADO2024',
};

// Credenciais de admin para teste
export const TEST_ADMIN = {
  email: 'admin@casatiana.test',
  password: 'TestAdmin123!',
};

// Credenciais de staff para teste
export const TEST_STAFF = {
  email: 'staff@casatiana.test',
  password: 'TestStaff123!',
};

// Credenciais de utilizador normal para teste
export const TEST_USER = {
  email: 'user@casatiana.test',
  password: 'TestUser123!',
};

// Mock de reserva para testes
export const mockReservation = (overrides = {}) => {
  const dates = generateTestDates();
  const room = ROOMS.DUNAS;
  
  return {
    id: 'test-reservation-id',
    reservation_number: 'CT-TEST-001',
    guest_name: TEST_GUEST.name,
    guest_email: TEST_GUEST.email,
    guest_phone: TEST_GUEST.phone,
    room_type: room.id,
    room_name: room.name,
    check_in: dates.checkInFormatted,
    check_out: dates.checkOutFormatted,
    guests: 2,
    nights: dates.nights,
    total_price: room.pricePerNight * dates.nights,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    ...overrides,
  };
};

// Status de reserva possíveis
export const RESERVATION_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

// Mensagens de erro esperadas
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo é obrigatório',
  INVALID_EMAIL: 'Email inválido',
  INVALID_PHONE: 'Telefone inválido',
  PROMO_INVALID: 'Código promocional inválido ou expirado',
  ACCESS_DENIED: 'Acesso negado',
  BOOKING_ERROR: 'Erro ao criar reserva',
};

// Mensagens de sucesso esperadas
export const SUCCESS_MESSAGES = {
  BOOKING_CREATED: 'Reserva Criada',
  PROMO_APPLIED: 'Código aplicado!',
  PAYMENT_WINDOW: 'Janela de Pagamento Aberta',
};
