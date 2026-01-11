import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, RefreshCw, Trash2, Plus, ExternalLink, Loader2, Copy, Download } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { getBookingRooms } from "@/components/rooms/roomsData";

interface ExternalCalendar {
  id: string;
  room_type: string;
  calendar_url: string;
  source: string;
  last_synced_at: string | null;
  created_at: string;
}

const SOURCES = [
  { value: "booking.com", label: "Booking.com" },
  { value: "airbnb", label: "Airbnb" },
  { value: "expedia", label: "Expedia" },
  { value: "other", label: "Outro" },
];

export function ExternalCalendarsManager() {
  const { t } = useLanguage();
  const { toast } = useToast();

  // Get room types dynamically from roomsData with translations
  const roomTypes = useMemo(() => {
    const rooms = getBookingRooms(t);
    return rooms.map(room => ({ value: room.id, label: room.name }));
  }, [t]);
  const [calendars, setCalendars] = useState<ExternalCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [adding, setAdding] = useState(false);

  // Form state
  const [newCalendarUrl, setNewCalendarUrl] = useState("");
  const [newRoomType, setNewRoomType] = useState("");
  const [newSource, setNewSource] = useState("booking.com");

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("external_calendars")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching calendars:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os calendários.",
        variant: "destructive",
      });
    } else {
      setCalendars(data || []);
    }
    setLoading(false);
  };

  const addCalendar = async () => {
    if (!newCalendarUrl || !newRoomType) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o URL e selecione o quarto.",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(newCalendarUrl);
    } catch {
      toast({
        title: "URL inválido",
        description: "Por favor, insira um URL válido.",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    const { error } = await supabase
      .from("external_calendars")
      .insert([{
        calendar_url: newCalendarUrl,
        room_type: newRoomType,
        source: newSource,
      }]);

    if (error) {
      console.error("Error adding calendar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o calendário.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Calendário adicionado. Iniciando sincronização...",
      });
      setNewCalendarUrl("");
      setNewRoomType("");
      setNewSource("booking.com");
      await fetchCalendars();
      // Auto-sync after adding
      await syncCalendars();
    }
    setAdding(false);
  };

  const deleteCalendar = async (id: string) => {
    const { error } = await supabase
      .from("external_calendars")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o calendário.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Calendário removido com sucesso.",
      });
      fetchCalendars();
    }
  };

  const syncCalendars = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-external-calendars");

      if (error) {
        throw error;
      }

      toast({
        title: "Sincronização concluída",
        description: `${data.synced} evento(s) sincronizado(s).`,
      });

      await fetchCalendars();
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os calendários.",
        variant: "destructive",
      });
    }
    setSyncing(false);
  };

  // Clear all blocked dates from external_blocked_dates table
  const [clearing, setClearing] = useState(false);

  const clearAllBlockedDates = async () => {
    if (!confirm("Tem certeza que deseja limpar TODOS os bloqueios externos? Isto não pode ser desfeito.")) {
      return;
    }

    setClearing(true);
    try {
      const { error } = await supabase
        .from("external_blocked_dates")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Deletes all rows

      if (error) {
        throw error;
      }

      toast({
        title: "Bloqueios limpos",
        description: "Todos os bloqueios externos foram removidos. Sincronize novamente para atualizar.",
      });
    } catch (error) {
      console.error("Error clearing blocked dates:", error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar os bloqueios.",
        variant: "destructive",
      });
    }
    setClearing(false);
  };

  const getRoomLabel = (roomType: string) => {
    return roomTypes.find(r => r.value === roomType)?.label || roomType;
  };

  return (
    <div className="space-y-6">
      {/* Add Calendar Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Calendário Externo
          </CardTitle>
          <CardDescription>
            Adicione URLs de calendários iCal do Booking.com, Airbnb, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calendar-url">URL do Calendário (iCal)</Label>
              <Input
                id="calendar-url"
                placeholder="https://admin.booking.com/..."
                value={newCalendarUrl}
                onChange={(e) => setNewCalendarUrl(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quarto</Label>
                <Select value={newRoomType} onValueChange={setNewRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((room) => (
                      <SelectItem key={room.value} value={room.value}>
                        {room.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fonte</Label>
                <Select value={newSource} onValueChange={setNewSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Button onClick={addCalendar} disabled={adding}>
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adicionando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Calendário
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Calendars List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendários Configurados
              </CardTitle>
              <CardDescription>
                Gerencie os calendários externos vinculados
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                onClick={clearAllBlockedDates}
                disabled={clearing || calendars.length === 0}
              >
                {clearing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Limpando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Bloqueios
                  </>
                )}
              </Button>
              <Button onClick={syncCalendars} disabled={syncing || calendars.length === 0}>
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sincronizar Todos
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : calendars.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum calendário externo configurado</p>
              <p className="text-sm mt-2">
                Adicione URLs de calendários iCal para sincronizar reservas externas
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quarto</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Última Sincronização</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calendars.map((calendar) => (
                    <TableRow key={calendar.id}>
                      <TableCell className="font-medium">
                        {getRoomLabel(calendar.room_type)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{calendar.source}</Badge>
                      </TableCell>
                      <TableCell>
                        {calendar.last_synced_at ? (
                          format(new Date(calendar.last_synced_at), "dd/MM/yyyy HH:mm", { locale: pt })
                        ) : (
                          <span className="text-muted-foreground">Nunca</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-xs">
                          <span className="truncate text-xs text-muted-foreground">
                            {calendar.calendar_url.substring(0, 40)}...
                          </span>
                          <a
                            href={calendar.calendar_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteCalendar(calendar.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Calendar URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Calendário
          </CardTitle>
          <CardDescription>
            URLs para importar no Booking.com, Airbnb, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use estes URLs para que o Booking.com e outras plataformas importem as suas reservas internas.
          </p>

          <div className="space-y-3">
            {roomTypes.map((room) => {
              // Get the Supabase project URL from environment variable
              const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
              const actualUrl = `${supabaseProjectUrl}/functions/v1/export-calendar?room=${room.value}`;

              return (
                <div key={room.value} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{room.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {actualUrl}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(actualUrl);
                      toast({
                        title: "URL copiado",
                        description: `URL do calendário ${room.label} copiado para a área de transferência.`,
                      });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={actualUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Como importar no Booking.com:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Aceda ao extranet do Booking.com</li>
              <li>Vá a "Rates & Availability" → "Sync calendars"</li>
              <li>Clique em "Add calendar connection"</li>
              <li>Cole o URL do quarto correspondente</li>
              <li>Dê um nome ao calendário e confirme</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como obter o URL iCal do Booking.com</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ol className="list-decimal list-inside space-y-1">
            <li>Aceda ao extranet do Booking.com</li>
            <li>Vá a "Rates & Availability" → "Sync calendars"</li>
            <li>Clique em "Add calendar connection" → "Skip this step"</li>
            <li>Dê um nome e clique "Export Calendar"</li>
            <li>Copie o URL gerado e cole acima</li>
          </ol>
          <p className="mt-4 text-amber-600 dark:text-amber-400">
            ⚠️ Nota: A sincronização do Booking.com pode demorar até 2 horas para refletir novas reservas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
