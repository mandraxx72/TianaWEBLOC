import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tag, Plus, Pencil, Trash2, CalendarIcon, Loader2, Percent, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_nights: number | null;
  min_total: number | null;
  valid_from: string;
  valid_until: string;
  max_uses: number | null;
  current_uses: number;
  room_types: string[] | null;
  is_active: boolean;
  created_at: string;
}

const ROOM_TYPES = [
  { id: "dunas", name: "Quarto Dunas" },
  { id: "baia", name: "Suite Baía Tranquila" },
  { id: "terraço", name: "Suite Terraço do Sol" },
  { id: "ventania", name: "Quarto Ventania" },
];

const promotionSchema = z.object({
  code: z.string().min(3, "Mínimo 3 caracteres").max(20, "Máximo 20 caracteres").toUpperCase(),
  name: z.string().min(3, "Mínimo 3 caracteres").max(50, "Máximo 50 caracteres"),
  description: z.string().max(200, "Máximo 200 caracteres").optional(),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().min(1, "Valor deve ser maior que 0"),
  min_nights: z.number().min(1).optional().nullable(),
  min_total: z.number().min(0).optional().nullable(),
  valid_from: z.date({ required_error: "Data de início obrigatória" }),
  valid_until: z.date({ required_error: "Data de fim obrigatória" }),
  max_uses: z.number().min(1).optional().nullable(),
  room_types: z.array(z.string()).optional().nullable(),
  is_active: z.boolean(),
}).refine(data => data.valid_until >= data.valid_from, {
  message: "Data de fim deve ser após a data de início",
  path: ["valid_until"],
}).refine(data => {
  if (data.discount_type === "percentage" && data.discount_value > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentagem não pode ser maior que 100%",
  path: ["discount_value"],
});

type PromotionFormData = z.infer<typeof promotionSchema>;

export function PromotionsManager() {
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: 10,
      min_nights: null,
      min_total: null,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      max_uses: null,
      room_types: null,
      is_active: true,
    },
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as promoções.",
        variant: "destructive",
      });
    } else {
      setPromotions((data as Promotion[]) || []);
    }
    setLoading(false);
  };

  const openCreateDialog = () => {
    setEditingPromotion(null);
    form.reset({
      code: "",
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: 10,
      min_nights: null,
      min_total: null,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      max_uses: null,
      room_types: null,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    form.reset({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description || "",
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      min_nights: promotion.min_nights,
      min_total: promotion.min_total,
      valid_from: new Date(promotion.valid_from),
      valid_until: new Date(promotion.valid_until),
      max_uses: promotion.max_uses,
      room_types: promotion.room_types,
      is_active: promotion.is_active,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: PromotionFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description || null,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_nights: data.min_nights || null,
        min_total: data.min_total || null,
        valid_from: format(data.valid_from, "yyyy-MM-dd"),
        valid_until: format(data.valid_until, "yyyy-MM-dd"),
        max_uses: data.max_uses || null,
        room_types: data.room_types?.length ? data.room_types : null,
        is_active: data.is_active,
      };

      if (editingPromotion) {
        const { error } = await supabase
          .from("promotions")
          .update(payload)
          .eq("id", editingPromotion.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Promoção atualizada." });
      } else {
        const { error } = await supabase
          .from("promotions")
          .insert(payload);

        if (error) {
          if (error.code === "23505") {
            toast({
              title: "Erro",
              description: "Já existe uma promoção com este código.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
          throw error;
        }
        toast({ title: "Sucesso", description: "Promoção criada." });
      }

      setIsDialogOpen(false);
      fetchPromotions();
    } catch (error) {
      console.error("Error saving promotion:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a promoção.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (promotion: Promotion) => {
    const { error } = await supabase
      .from("promotions")
      .update({ is_active: !promotion.is_active })
      .eq("id", promotion.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    } else {
      fetchPromotions();
    }
  };

  const deletePromotion = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta promoção?")) return;

    const { error } = await supabase
      .from("promotions")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a promoção.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Sucesso", description: "Promoção excluída." });
      fetchPromotions();
    }
  };

  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const validFrom = new Date(promotion.valid_from);
    const validUntil = new Date(promotion.valid_until);

    if (!promotion.is_active) {
      return <Badge variant="secondary">Inativa</Badge>;
    }
    if (now < validFrom) {
      return <Badge variant="outline">Agendada</Badge>;
    }
    if (now > validUntil) {
      return <Badge variant="destructive">Expirada</Badge>;
    }
    if (promotion.max_uses && promotion.current_uses >= promotion.max_uses) {
      return <Badge variant="destructive">Esgotada</Badge>;
    }
    return <Badge variant="default">Ativa</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Promoções e Descontos
            </CardTitle>
            <CardDescription>
              Gerencie códigos promocionais para reservas
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Promoção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPromotion ? "Editar Promoção" : "Nova Promoção"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input placeholder="VERAO2024" {...field} className="uppercase" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Promoção de Verão" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descrição opcional..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discount_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Desconto</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="percentage">
                                <span className="flex items-center gap-2">
                                  <Percent className="h-4 w-4" />
                                  Percentagem
                                </span>
                              </SelectItem>
                              <SelectItem value="fixed">
                                <span className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  Valor Fixo (CVE)
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discount_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor do Desconto</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={form.watch("discount_type") === "percentage" ? "10" : "1000"}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            {form.watch("discount_type") === "percentage" ? "%" : "CVE"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="valid_from"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Válido de</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? format(field.value, "dd/MM/yyyy", { locale: pt }) : "Selecionar"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="valid_until"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Válido até</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? format(field.value, "dd/MM/yyyy", { locale: pt }) : "Selecionar"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < form.watch("valid_from")}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="min_nights"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mínimo de Noites</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Opcional"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="max_uses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limite de Utilizações</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ilimitado"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="room_types"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quartos Elegíveis</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {ROOM_TYPES.map((room) => (
                            <Button
                              key={room.id}
                              type="button"
                              variant={field.value?.includes(room.id) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const current = field.value || [];
                                if (current.includes(room.id)) {
                                  field.onChange(current.filter((id) => id !== room.id));
                                } else {
                                  field.onChange([...current, room.id]);
                                }
                              }}
                            >
                              {room.name}
                            </Button>
                          ))}
                        </div>
                        <FormDescription>
                          Deixe vazio para aplicar a todos os quartos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel>Promoção Ativa</FormLabel>
                          <FormDescription>
                            Ativar ou desativar esta promoção
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : editingPromotion ? (
                        "Salvar Alterações"
                      ) : (
                        "Criar Promoção"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma promoção criada ainda</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Utilizações</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell className="font-mono font-semibold">
                        {promotion.code}
                      </TableCell>
                      <TableCell>{promotion.name}</TableCell>
                      <TableCell>
                        {promotion.discount_type === "percentage"
                          ? `${promotion.discount_value}%`
                          : `${promotion.discount_value.toLocaleString()} CVE`}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(promotion.valid_from), "dd/MM/yyyy", { locale: pt })} -{" "}
                        {format(new Date(promotion.valid_until), "dd/MM/yyyy", { locale: pt })}
                      </TableCell>
                      <TableCell>
                        {promotion.current_uses}
                        {promotion.max_uses && ` / ${promotion.max_uses}`}
                      </TableCell>
                      <TableCell>{getStatusBadge(promotion)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={promotion.is_active}
                            onCheckedChange={() => toggleActive(promotion)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(promotion)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePromotion(promotion.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
