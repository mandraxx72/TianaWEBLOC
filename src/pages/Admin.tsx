import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Users, CalendarDays, Shield, Search, CalendarSync, BarChart3, Tag, Trash2, Archive, Filter, Download, BedDouble } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { ExternalCalendarsManager } from "@/components/admin/ExternalCalendarsManager";
import { ReservationStats } from "@/components/admin/ReservationStats";
import { PromotionsManager } from "@/components/admin/PromotionsManager";
import { RoomStatusPanel } from "@/components/admin/RoomStatusPanel";
import { cveToEur, formatEUR } from "@/utils/currency";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Reservation {
  id: string;
  reservation_number: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  room_name: string;
  room_type: string;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  total_price: number;
  status: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "staff" | "user";
  created_at: string;
  email?: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formatAmountWithSecondary } = useCurrency();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "staff">("staff");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const hasAdminAccess = roles?.some(r => r.role === "admin" || r.role === "staff");
    
    if (!hasAdminAccess) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(roles?.some(r => r.role === "admin") || false);
    setLoading(false);
    fetchReservations();
    if (roles?.some(r => r.role === "admin")) {
      fetchUserRoles();
    }
  };

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as reservas.",
        variant: "destructive",
      });
      return;
    }

    setReservations(data || []);
  };

  const fetchUserRoles = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching roles:", error);
      return;
    }

    setUserRoles(data || []);
  };

  const updateReservationStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Status atualizado com sucesso.",
    });
    fetchReservations();
  };

  const addUserRole = async () => {
    if (!newUserEmail) {
      toast({
        title: "Erro",
        description: "Por favor, insira o UUID do usuário.",
        variant: "destructive",
      });
      return;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(newUserEmail)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um UUID válido.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: newUserEmail, role: newUserRole }]);

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Erro",
          description: "Este usuário já possui este role.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o role.",
          variant: "destructive",
        });
      }
      return;
    }

    toast({
      title: "Sucesso",
      description: `Role ${newUserRole} atribuído com sucesso.`,
    });
    setNewUserEmail("");
    fetchUserRoles();
  };

  const removeUserRole = async (id: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o role.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Role removido com sucesso.",
    });
    fetchUserRoles();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      confirmed: "default",
      pending: "secondary",
      cancelled: "destructive",
      completed: "outline",
      archived: "outline",
    };
    const labels: Record<string, string> = {
      confirmed: "Confirmada",
      pending: "Pendente",
      cancelled: "Cancelada",
      completed: "Concluída",
      archived: "Arquivada",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  // Delete a single reservation
  const deleteReservation = async (id: string) => {
    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível eliminar a reserva.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Reserva eliminada com sucesso.",
    });
    setSelectedReservations(prev => prev.filter(r => r !== id));
    fetchReservations();
  };

  // Delete multiple selected reservations
  const deleteSelectedReservations = async () => {
    if (selectedReservations.length === 0) return;

    const { error } = await supabase
      .from("reservations")
      .delete()
      .in("id", selectedReservations);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível eliminar as reservas selecionadas.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: `${selectedReservations.length} reserva(s) eliminada(s) com sucesso.`,
    });
    setSelectedReservations([]);
    fetchReservations();
  };

  // Archive (mark as completed) selected reservations
  const archiveSelectedReservations = async () => {
    if (selectedReservations.length === 0) return;

    const { error } = await supabase
      .from("reservations")
      .update({ status: "archived" })
      .in("id", selectedReservations);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível arquivar as reservas selecionadas.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: `${selectedReservations.length} reserva(s) arquivada(s) com sucesso.`,
    });
    setSelectedReservations([]);
    fetchReservations();
  };

  // Export reservations to CSV
  const exportToCSV = (reservationsToExport: Reservation[]) => {
    if (reservationsToExport.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há reservas para exportar.",
        variant: "destructive",
      });
      return;
    }

    // CSV headers
    const headers = [
      "Número Reserva",
      "Hóspede",
      "Email",
      "Telefone",
      "Quarto",
      "Tipo Quarto",
      "Check-in",
      "Check-out",
      "Hóspedes",
      "Noites",
      "Total (CVE)",
      "Total (EUR)",
      "Status",
      "Data Criação"
    ];

    // Convert reservations to CSV rows
    const rows = reservationsToExport.map(r => [
      r.reservation_number,
      r.guest_name,
      r.guest_email,
      r.guest_phone,
      r.room_name,
      r.room_type,
      format(new Date(r.check_in), "dd/MM/yyyy"),
      format(new Date(r.check_out), "dd/MM/yyyy"),
      r.guests.toString(),
      r.nights.toString(),
      r.total_price.toString(),
      cveToEur(r.total_price).toFixed(2),
      r.status,
      format(new Date(r.created_at), "dd/MM/yyyy HH:mm")
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    // Create and download file
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reservas_${format(new Date(), "yyyy-MM-dd_HH-mm")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Sucesso",
      description: `${reservationsToExport.length} reserva(s) exportada(s) para CSV.`,
    });
  };

  // Toggle selection of a reservation
  const toggleReservationSelection = (id: string) => {
    setSelectedReservations(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  // Select all visible reservations
  const toggleSelectAll = () => {
    if (selectedReservations.length === filteredReservations.length) {
      setSelectedReservations([]);
    } else {
      setSelectedReservations(filteredReservations.map(r => r.id));
    }
  };

  // Get count of archivable reservations (cancelled or completed)
  const archivableCount = reservations.filter(r => 
    r.status === "cancelled" || r.status === "completed"
  ).length;

  // Filter reservations based on search, status filter, and archived visibility
  const filteredReservations = reservations.filter((r) => {
    const matchesSearch = 
      r.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reservation_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    
    // Hide archived by default unless showArchived is true
    const isVisible = showArchived ? true : r.status !== "archived";
    
    return matchesSearch && matchesStatus && isVisible;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie reservas e usuários</p>
          </div>
        </div>

        <Tabs defaultValue="reservations" className="space-y-6">
          <TabsList className={`grid w-full max-w-4xl ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'}`}>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Reservas
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <BedDouble className="h-4 w-4" />
              Quartos
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Promoções
            </TabsTrigger>
            <TabsTrigger value="calendars" className="flex items-center gap-2">
              <CalendarSync className="h-4 w-4" />
              Calendários
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="reservations" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Todas as Reservas
                  </CardTitle>
                  <CardDescription>
                    Visualize e gerencie todas as reservas do hotel
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportToCSV(filteredReservations)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters and Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email ou número..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrar status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                        <SelectItem value="archived">Arquivada</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="showArchived" 
                        checked={showArchived}
                        onCheckedChange={(checked) => setShowArchived(checked === true)}
                      />
                      <label htmlFor="showArchived" className="text-sm text-muted-foreground cursor-pointer">
                        Mostrar arquivadas
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedReservations.length > 0 && (
                  <div className="flex items-center gap-4 mb-4 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                      {selectedReservations.length} reserva(s) selecionada(s)
                    </span>
                    
                    <div className="flex gap-2 ml-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={archiveSelectedReservations}
                        className="gap-2"
                      >
                        <Archive className="h-4 w-4" />
                        Arquivar
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar reservas selecionadas?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Serão eliminadas {selectedReservations.length} reserva(s) permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={deleteSelectedReservations}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}

                {/* Quick Archive Info */}
                {archivableCount > 0 && selectedReservations.length === 0 && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 rounded-lg text-sm">
                    <Archive className="h-4 w-4" />
                    <span>
                      Tem {archivableCount} reserva(s) concluída(s) ou cancelada(s) que podem ser arquivadas.
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setStatusFilter("cancelled")}
                      className="ml-auto"
                    >
                      Ver canceladas
                    </Button>
                  </div>
                )}

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={filteredReservations.length > 0 && selectedReservations.length === filteredReservations.length}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Reserva</TableHead>
                        <TableHead>Hóspede</TableHead>
                        <TableHead>Quarto</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReservations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            Nenhuma reserva encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReservations.map((reservation) => (
                          <TableRow 
                            key={reservation.id}
                            className={selectedReservations.includes(reservation.id) ? "bg-muted/50" : ""}
                          >
                            <TableCell>
                              <Checkbox 
                                checked={selectedReservations.includes(reservation.id)}
                                onCheckedChange={() => toggleReservationSelection(reservation.id)}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {reservation.reservation_number}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{reservation.guest_name}</p>
                                <p className="text-sm text-muted-foreground">{reservation.guest_email}</p>
                              </div>
                            </TableCell>
                            <TableCell>{reservation.room_name}</TableCell>
                            <TableCell>
                              {format(new Date(reservation.check_in), "dd/MM/yyyy", { locale: pt })}
                            </TableCell>
                            <TableCell>
                              {format(new Date(reservation.check_out), "dd/MM/yyyy", { locale: pt })}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{formatAmountWithSecondary(reservation.total_price).primary}</div>
                                <div className="text-muted-foreground text-xs">{formatAmountWithSecondary(reservation.total_price).secondary}</div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={reservation.status}
                                  onValueChange={(value) => updateReservationStatus(reservation.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="confirmed">Confirmada</SelectItem>
                                    <SelectItem value="completed">Concluída</SelectItem>
                                    <SelectItem value="cancelled">Cancelada</SelectItem>
                                    <SelectItem value="archived">Arquivada</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Eliminar reserva?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. A reserva #{reservation.reservation_number} será eliminada permanentemente.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteReservation(reservation.id)}>
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-4">
            <RoomStatusPanel reservations={reservations} onReservationsChanged={fetchReservations} />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <ReservationStats reservations={reservations} />
          </TabsContent>

          <TabsContent value="promotions" className="space-y-4">
            <PromotionsManager />
          </TabsContent>

          <TabsContent value="calendars" className="space-y-4">
            <ExternalCalendarsManager />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Adicionar Role
                  </CardTitle>
                  <CardDescription>
                    Atribua roles de admin ou staff a usuários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      placeholder="UUID do usuário"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={newUserRole} onValueChange={(v: "admin" | "staff") => setNewUserRole(v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addUserRole}>Adicionar</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Roles Atribuídos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User ID</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userRoles.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              Nenhum role atribuído
                            </TableCell>
                          </TableRow>
                        ) : (
                          userRoles.map((role) => (
                            <TableRow key={role.id}>
                              <TableCell className="font-mono text-xs">{role.user_id}</TableCell>
                              <TableCell>
                                <Badge variant={role.role === "admin" ? "default" : "secondary"}>
                                  {role.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {format(new Date(role.created_at), "dd/MM/yyyy", { locale: pt })}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeUserRole(role.id)}
                                >
                                  Remover
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
