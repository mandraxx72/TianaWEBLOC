import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBooking } from "@/contexts/BookingContext";
import RoomCard from "./rooms/RoomCard";
import RoomDetailModal from "./rooms/RoomDetailModal";
import AdditionalInfo from "./rooms/AdditionalInfo";
import { getRoomsData } from "./rooms/roomsData";

interface RoomsProps {
  onBookingClick: () => void;
}

const Rooms = ({ onBookingClick }: RoomsProps) => {
  const { t } = useLanguage();
  const { guests } = useBooking();
  const rooms = getRoomsData(t);
  const sectionRef = useRef<HTMLElement>(null);

  const [selectedRoom, setSelectedRoom] = useState<typeof rooms[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDetailsClick = (room: typeof rooms[0]) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  // Filter rooms by guest capacity if guests selected
  const filteredRooms = guests > 0
    ? rooms.filter(room => (room.capacityValue || 2) >= guests)
    : rooms;

  return (
    <>
      <section id="quartos" ref={sectionRef} className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gold-start to-gold-end bg-clip-text text-transparent mb-6 font-playfair">
                {t('rooms.title')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('rooms.subtitle')}
              </p>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {filteredRooms.map((room, index) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  index={index}
                  onDetailsClick={() => handleDetailsClick(room)}
                />
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t('rooms.noRoomsForGuests') || 'Nenhum quarto disponível para o número de hóspedes selecionado.'}
                </p>
              </div>
            )}

            <AdditionalInfo />
          </div>
        </div>
      </section>

      <RoomDetailModal
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default Rooms;
