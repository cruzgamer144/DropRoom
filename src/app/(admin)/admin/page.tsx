import { redirect } from "next/navigation";
import { getAdminData } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase-client";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminTable } from "@/components/admin/admin-table";
import { upsertDrop, generateInvites, updateReservationStatus, toggleUserStatus } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile.error || profile.data?.role !== "admin") {
    redirect("/dashboard");
  }

  const { drops, invites, reservations, users } = await getAdminData();

  return (
    <div className="space-y-12 px-6 pb-24 pt-16 sm:px-12">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-slate-900">Painel DropRoom</h1>
        <p className="text-sm text-slate-600">Gere drops, convites, reservas e membros.</p>
      </header>
      <div className="space-y-10">
        <AdminSection title="Drops" description="Cria, atualiza ou desativa drops.">
          <form action={upsertDrop} className="grid gap-6 rounded-premium border border-slate-100 bg-slate-50/60 p-6 md:grid-cols-2">
            <Input name="id" type="hidden" />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="name">
                Nome
              </label>
              <Input name="name" id="name" required placeholder="DropRoom x artista" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="slug">
                Slug
              </label>
              <Input name="slug" id="slug" required placeholder="droproom-x-artista" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="description">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                required
                className="h-32 w-full rounded-premium border border-slate-200 px-4 py-3 text-sm focus:border-champagne focus:ring-champagne"
              ></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="image_url">
                URL da Imagem
              </label>
              <Input id="image_url" name="image_url" required placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="price">
                Preço (€)
              </label>
              <Input id="price" name="price" type="number" min="0" step="0.01" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="drop_date">
                Data
              </label>
              <Input id="drop_date" name="drop_date" type="date" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="sizes">
                Tamanhos (separados por vírgula)
              </label>
              <Input id="sizes" name="sizes" required placeholder="EU 40, EU 41, EU 42" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700" htmlFor="active">
              <input id="active" name="active" type="checkbox" defaultChecked className="h-4 w-4" /> Ativo
            </label>
            <div className="md:col-span-2">
              <Button type="submit">Guardar Drop</Button>
            </div>
          </form>
          <AdminTable
            headers={["Nome", "Data", "Preço", "Estado"]}
            rows={drops.map((drop) => [
              drop.name,
              new Date(drop.drop_date).toLocaleDateString("pt-PT"),
              `€${drop.price.toFixed(2)}`,
              drop.active ? "Ativo" : "Inativo",
            ])}
          />
        </AdminSection>

        <AdminSection title="Convites" description="Gera códigos exclusivos.">
          <form action={generateInvites} className="flex flex-wrap items-end gap-4 rounded-premium border border-slate-100 bg-slate-50/60 p-6">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                Email alvo (opcional)
              </label>
              <Input id="email" name="email" placeholder="vip@droproom.com" />
            </div>
            <div className="w-32 space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="amount">
                Quantidade
              </label>
              <Input id="amount" name="amount" type="number" min="1" max="20" defaultValue="1" required />
            </div>
            <Button type="submit">Gerar Convites</Button>
          </form>
          <AdminTable
            headers={["Código", "Estado", "Utilizado por"]}
            rows={invites.map((invite) => [invite.code, invite.status, invite.used_by ?? "—"])}
          />
        </AdminSection>

        <AdminSection title="Reservas" description="Atualiza o estado das reservas.">
          <div className="space-y-4">
            {reservations.map((reservation: any) => (
              <form key={reservation.id} action={updateReservationStatus} className="flex flex-wrap items-center gap-4 rounded-premium border border-slate-100 bg-slate-50/60 p-4">
                <input type="hidden" name="reservationId" value={reservation.id} />
                <div className="flex-1 min-w-[160px] text-sm text-slate-700">
                  <p className="font-medium text-slate-900">{reservation.drops?.name ?? "Drop"}</p>
                  <p>{reservation.profiles?.email}</p>
                </div>
                <select
                  name="status"
                  defaultValue={reservation.status}
                  className="rounded-premium border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="reservado">Reservado</option>
                  <option value="pago">Pago</option>
                  <option value="enviado">Enviado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <Button type="submit">Atualizar</Button>
              </form>
            ))}
          </div>
        </AdminSection>

        <AdminSection title="Utilizadores" description="Controla o estado e limites.">
          <div className="space-y-4">
            {users.map((userRow) => (
              <form key={userRow.id} action={toggleUserStatus} className="flex flex-wrap items-center gap-4 rounded-premium border border-slate-100 bg-slate-50/60 p-4">
                <input type="hidden" name="userId" value={userRow.id} />
                <div className="flex-1 min-w-[200px] text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">{userRow.email}</p>
                  <p>
                    Limite: {userRow.monthly_limit} | Compras atuais: {userRow.monthly_count}
                  </p>
                </div>
                <select name="status" defaultValue={userRow.status} className="rounded-premium border border-slate-200 px-3 py-2 text-sm">
                  <option value="active">Ativo</option>
                  <option value="suspended">Suspenso</option>
                </select>
                <Button type="submit">Guardar</Button>
              </form>
            ))}
          </div>
        </AdminSection>
      </div>
    </div>
  );
}
