import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BookingContextType {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
  setCheckIn: (date: Date | undefined) => void;
  setCheckOut: (date: Date | undefined) => void;
  setGuests: (guests: number) => void;
  clearDates: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState<number>(2);

  const clearDates = () => {
    setCheckIn(undefined);
    setCheckOut(undefined);
  };

  return (
    <BookingContext.Provider value={{
      checkIn,
      checkOut,
      guests,
      setCheckIn,
      setCheckOut,
      setGuests,
      clearDates
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
