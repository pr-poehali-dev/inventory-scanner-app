import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const AUTH_URL = 'https://functions.poehali.dev/dd012b60-b637-4820-a0f3-0c9bcad131c1';

type User = { id: number; name: string; email: string; role: 'admin' | 'employee' };


function api(action: string, method: 'GET' | 'POST', body?: object) {
  const token = localStorage.getItem('wh_token') || '';
  return fetch(`${AUTH_URL}?action=${action}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Session-Token': token },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());
}

function LoginScreen({ onLogin }: { onLogin: (user: User, token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await api('login', 'POST', { email, password });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    localStorage.setItem('wh_token', res.token);
    onLogin(res.user, res.token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-green text-background glow-green">
            <Icon name="Warehouse" size={22} />
          </span>
          <div>
            <p className="font-display text-xl font-bold leading-none tracking-wide">СКЛАД·СИСТЕМА</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Адресное хранение · Сканер · Накладные</p>
          </div>
        </div>
        <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
          <p className="font-display text-lg font-semibold text-center">Вход в систему</p>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@company.ru" type="email" className="bg-background/60" autoFocus />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Пароль</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" className="bg-background/60" />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm px-3 py-2">
              <Icon name="CircleAlert" size={15} /> {error}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-neon-green text-background hover:bg-neon-green/90 font-semibold">
            {loading ? <Icon name="LoaderCircle" size={16} className="animate-spin mr-2" /> : <Icon name="LogIn" size={16} className="mr-2" />}
            Войти
          </Button>
        </form>
      </div>
    </div>
  );
}

function UsersScreen() {
  const [users, setUsers] = useState<{ id: number; name: string; email: string; role: string; created_at: string }[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'employee' | 'admin'>('employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [delConfirm, setDelConfirm] = useState<number | null>(null);

  const load = () => api('users', 'GET').then((r) => { if (r.users) setUsers(r.users); });
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const res = await api('register', 'POST', { name, email, password, role });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setSuccess('Сотрудник добавлен'); setName(''); setEmail(''); setPassword(''); setRole('employee');
    load();
  };

  const deleteUser = async (id: number) => {
    await api('delete_user', 'POST', { id });
    setDelConfirm(null);
    load();
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.5fr] gap-5">
      <div className="glass rounded-2xl p-5 animate-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorMap['neon-purple']}`}>
            <Icon name="UserPlus" size={18} />
          </span>
          <div>
            <p className="font-display font-semibold leading-none">Новый сотрудник</p>
            <p className="text-xs text-muted-foreground mt-1">Добавить доступ в систему</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя Фамилия" className="bg-background/60" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="bg-background/60" />
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" type="password" className="bg-background/60" />
          <div className="flex gap-2">
            {(['employee', 'admin'] as const).map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${role === r ? colorMap['neon-purple'] + ' border' : 'border-border text-muted-foreground hover:bg-secondary'}`}>
                {r === 'admin' ? 'Администратор' : 'Сотрудник'}
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-destructive flex gap-1 items-center"><Icon name="CircleAlert" size={13} />{error}</p>}
          {success && <p className="text-sm text-neon-green flex gap-1 items-center"><Icon name="CircleCheck" size={13} />{success}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-neon-purple text-white hover:bg-neon-purple/90 font-semibold">
            {loading ? <Icon name="LoaderCircle" size={16} className="animate-spin mr-1" /> : <Icon name="UserPlus" size={16} className="mr-1" />}
            Добавить
          </Button>
        </form>
      </div>
      <div className="glass rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: '0.08s' }}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <p className="font-display font-semibold">Сотрудники</p>
          <Badge className={`border ${colorMap['neon-purple']}`}>{users.length} чел.</Badge>
        </div>
        <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
          {users.map((u) => (
            <div key={u.id} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-background/40 transition-colors">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/20 font-semibold text-sm">
                {u.name.charAt(0)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <Badge className={`shrink-0 border ${u.role === 'admin' ? colorMap['neon-orange'] : colorMap['neon-blue']}`}>
                {u.role === 'admin' ? 'Админ' : 'Сотрудник'}
              </Badge>
              {u.role !== 'admin' && (
                delConfirm === u.id
                  ? <div className="flex gap-1">
                      <button onClick={() => deleteUser(u.id)} className="h-7 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive px-2 text-xs hover:bg-destructive/30 transition-colors">Да</button>
                      <button onClick={() => setDelConfirm(null)} className="h-7 rounded-lg bg-secondary px-2 text-xs text-muted-foreground">Нет</button>
                    </div>
                  : <button onClick={() => setDelConfirm(u.id)} className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                      <Icon name="Trash2" size={14} />
                    </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type TabId = 'income' | 'outcome' | 'stock' | 'catalog' | 'cells' | 'inventory' | 'log' | 'users';

const ALL_TABS: { id: TabId; label: string; icon: string; color: string; adminOnly?: boolean }[] = [
  { id: 'income', label: 'Приход', icon: 'ArrowDownToLine', color: 'neon-green' },
  { id: 'outcome', label: 'Расход', icon: 'ArrowUpFromLine', color: 'neon-orange' },
  { id: 'stock', label: 'Остаток', icon: 'Boxes', color: 'neon-blue' },
  { id: 'catalog', label: 'База товаров', icon: 'Tags', color: 'neon-green', adminOnly: true },
  { id: 'cells', label: 'Ячейки', icon: 'Grid3x3', color: 'neon-blue', adminOnly: true },
  { id: 'inventory', label: 'Инвентаризация', icon: 'ClipboardCheck', color: 'neon-purple', adminOnly: true },
  { id: 'log', label: 'Журнал', icon: 'ScrollText', color: 'neon-green', adminOnly: true },
  { id: 'users', label: 'Сотрудники', icon: 'Users', color: 'neon-purple', adminOnly: true },
];

type StockItem = { id: string; sku: string; name: string; cell: string; qty: number; min: number };
type InvoiceItem = { id: string; sku: string; name: string; cell: string; qty: number };
type Invoice = { id: string; date: string; num: string; items: InvoiceItem[] };
type CatalogItem = { id: string; sku: string; name: string; unit: string };
type Cell = { id: string; code: string; zone: string; capacity: number };
type LogEntry = { id: string; time: string; user: string; action: string; target: string; color: string };
type Zone = { id: string; name: string; done: number; total: number; status: string; color: string };

const colorMap: Record<string, string> = {
  'neon-green': 'text-neon-green border-neon-green/40 bg-neon-green/10',
  'neon-orange': 'text-neon-orange border-neon-orange/40 bg-neon-orange/10',
  'neon-blue': 'text-neon-blue border-neon-blue/40 bg-neon-blue/10',
  'neon-purple': 'text-neon-purple border-neon-purple/40 bg-neon-purple/10',
};
const textMap: Record<string, string> = {
  'neon-green': 'text-neon-green', 'neon-orange': 'text-neon-orange',
  'neon-blue': 'text-neon-blue', 'neon-purple': 'text-neon-purple',
};
const barMap: Record<string, string> = {
  'neon-green': 'bg-neon-green', 'neon-orange': 'bg-neon-orange',
  'neon-blue': 'bg-neon-blue', 'neon-purple': 'bg-neon-purple',
};
const dotMap: Record<string, string> = {
  'neon-green': 'border-neon-green', 'neon-orange': 'border-neon-orange',
  'neon-blue': 'border-neon-blue', 'neon-purple': 'border-neon-purple',
};

let _id = 0;
const uid = () => String(++_id);

function DeleteBtn({ onDelete }: { onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) {
    return (
      <div className="flex items-center gap-1 animate-fade-up">
        <button
          onClick={onDelete}
          className="flex h-7 items-center gap-1 rounded-lg bg-destructive/20 border border-destructive/40 text-destructive px-2 text-xs font-medium hover:bg-destructive/30 transition-colors"
        >
          <Icon name="Trash2" size={12} /> Да
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="flex h-7 items-center rounded-lg bg-secondary px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Нет
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
    >
      <Icon name="Trash2" size={14} />
    </button>
  );
}

function Scanner({ accent }: { accent: string }) {
  return (
    <div className="glass rounded-2xl p-5 animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorMap[accent]} animate-pulse-ring`}>
          <Icon name="ScanLine" size={18} />
        </span>
        <div>
          <p className="font-display font-semibold leading-none">Сканер штрихкода</p>
          <p className="text-xs text-muted-foreground mt-1">Поднесите товар к сканеру или введите код</p>
        </div>
      </div>
      <div className="relative h-28 rounded-xl border border-border bg-background/60 overflow-hidden mb-4">
        <div className="absolute left-0 right-0 h-px bg-neon-green shadow-[0_0_12px_2px_hsl(var(--neon-green))] animate-scan" />
        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-30">
          {Array.from({ length: 32 }).map((_, i) => (
            <span key={i} className="bg-foreground" style={{ width: (i % 4) + 1, height: 56 }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Input placeholder="Код товара / EAN-13" className="bg-background/60" />
        <Button className="bg-neon-green text-background hover:bg-neon-green/90 font-semibold shrink-0">
          <Icon name="Plus" size={16} className="mr-1" /> Добавить
        </Button>
      </div>
    </div>
  );
}

function OpScreen({
  tab, invoices, onDelete,
}: {
  tab: typeof TABS[number];
  invoices: Invoice[];
  onDelete: (id: string) => void;
}) {
  const isIncome = tab.id === 'income';
  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
      <Scanner accent={tab.color} />
      <div className="glass rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '0.08s' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-display font-semibold">{isIncome ? 'Накладные прихода' : 'Накладные расхода'}</p>
          <Button variant="outline" size="sm" className="border-neon-blue/40 text-neon-blue hover:bg-neon-blue/10">
            <Icon name="FilePlus" size={15} className="mr-1.5" /> Новая накладная
          </Button>
        </div>
        <div className="space-y-2">
          {invoices.map((inv, i) => (
            <div key={inv.id} className="group rounded-xl border border-border bg-background/40 px-4 py-3 animate-fade-up" style={{ animationDelay: `${0.05 + i * 0.04}s` }}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium font-mono text-sm">{inv.num}</p>
                    <Badge className={`border text-[11px] ${colorMap[tab.color]}`}>
                      {inv.items.length} поз.
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{inv.date}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-neon-blue hover:bg-neon-blue/10">
                    <Icon name="FileText" size={13} className="mr-1" /> PDF
                  </Button>
                  <DeleteBtn onDelete={() => onDelete(inv.id)} />
                </div>
              </div>
              <div className="mt-2 space-y-1">
                {inv.items.slice(0, 2).map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{it.name}</span>
                    <span className="ml-2 shrink-0 font-mono">{isIncome ? '+' : '−'}{it.qty} шт</span>
                  </div>
                ))}
                {inv.items.length > 2 && (
                  <p className="text-[11px] text-muted-foreground/60">+ещё {inv.items.length - 2} позиций</p>
                )}
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <Icon name="FileX" size={32} />
              <p className="text-sm">Накладных пока нет</p>
            </div>
          )}
        </div>
        {invoices.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <Button className={`w-full font-semibold ${isIncome ? 'bg-neon-green text-background hover:bg-neon-green/90' : 'bg-neon-orange text-background hover:bg-neon-orange/90'}`}>
              <Icon name="Check" size={16} className="mr-1.5" /> Провести все
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StockScreen({ items, onDelete }: { items: StockItem[]; onDelete: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const filtered = items.filter(
    (it) => it.name.toLowerCase().includes(search.toLowerCase()) || it.cell.includes(search) || it.sku.includes(search)
  );
  return (
    <div className="glass rounded-2xl overflow-hidden animate-fade-up">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <p className="font-display font-semibold">Остатки по адресам хранения</p>
        <div className="relative w-64 max-w-[50vw]">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию / ячейке" className="pl-9 bg-background/60" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {filtered.map((item, i) => {
          const low = item.qty <= item.min;
          return (
            <div key={item.id} className="group flex items-center gap-4 px-5 py-4 hover:bg-background/40 transition-colors animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-blue/10 text-neon-blue border border-neon-blue/30 font-mono text-xs">
                {item.cell.split('-')[0]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{item.sku} · {item.cell}</p>
              </div>
              <div className="text-right">
                <p className={`font-display text-xl font-bold ${low ? 'text-destructive' : 'text-foreground'}`}>{item.qty}</p>
                <p className="text-[11px] text-muted-foreground">мин. {item.min}</p>
              </div>
              {low && <Badge variant="destructive" className="ml-1">{item.qty === 0 ? 'Нет' : 'Мало'}</Badge>}
              <DeleteBtn onDelete={() => onDelete(item.id)} />
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <Icon name="PackageSearch" size={32} />
            <p className="text-sm">Ничего не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryScreen({ zones, onDelete }: { zones: Zone[]; onDelete: (id: string) => void }) {
  return (
    <div className="grid md:grid-cols-3 gap-5">
      {zones.map((z, i) => {
        const pct = Math.round((z.done / z.total) * 100);
        return (
          <div key={z.id} className="group glass rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="flex items-center justify-between mb-4">
              <Icon name="ClipboardCheck" size={20} className={textMap[z.color]} />
              <div className="flex items-center gap-2">
                <Badge className={`border ${colorMap[z.color]}`}>{z.status}</Badge>
                <DeleteBtn onDelete={() => onDelete(z.id)} />
              </div>
            </div>
            <p className="font-display font-semibold mb-1">{z.name}</p>
            <p className="text-xs text-muted-foreground mb-4">{z.done} из {z.total} позиций сверено</p>
            <div className="h-2 rounded-full bg-background/60 overflow-hidden mb-4">
              <div className={`h-full ${barMap[z.color]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <Button variant="outline" className="w-full border-border hover:bg-background/40">
              <Icon name="ScanLine" size={15} className="mr-1.5" /> Сканировать зону
            </Button>
          </div>
        );
      })}
      {zones.length === 0 && (
        <div className="col-span-3 glass rounded-2xl flex flex-col items-center gap-2 py-14 text-muted-foreground">
          <Icon name="ClipboardX" size={36} />
          <p className="text-sm">Зон инвентаризации нет</p>
        </div>
      )}
    </div>
  );
}

function LogScreen({ entries, onDelete }: { entries: LogEntry[]; onDelete: (id: string) => void }) {
  return (
    <div className="glass rounded-2xl p-5 animate-fade-up">
      <p className="font-display font-semibold mb-4">Журнал операций и изменений</p>
      {entries.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
          <Icon name="ScrollText" size={32} />
          <p className="text-sm">Журнал пуст</p>
        </div>
      )}
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
        {entries.map((l, i) => (
          <div key={l.id} className="group relative pb-5 last:pb-0 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <span className={`absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-background ${dotMap[l.color]}`} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{l.time}</span>
              <Badge className={`border ${colorMap[l.color]}`}>{l.action}</Badge>
              <span className="text-sm">{l.target}</span>
              <DeleteBtn onDelete={() => onDelete(l.id)} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Icon name="User" size={12} /> {l.user}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CatalogScreen({
  items, onAdd, onBulkAdd, onDelete,
}: {
  items: CatalogItem[];
  onAdd: (item: CatalogItem) => void;
  onBulkAdd: (items: CatalogItem[]) => void;
  onDelete: (id: string) => void;
}) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('шт');
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number; skipped: number } | null>(null);
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!sku.trim() || !name.trim()) return;
    onAdd({ id: uid(), sku: sku.trim(), name: name.trim(), unit: unit.trim() || 'шт' });
    setSku(''); setName(''); setUnit('шт');
  };

  const parseFile = (file: File) => {
    setImporting(true);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const parsed: CatalogItem[] = [];
        let skipped = 0;
        rows.forEach((row) => {
          const vals = Object.values(row).map((v) => String(v).trim());
          const skuVal = vals.find((v) => /^\d{8,14}$/.test(v)) ?? '';
          const nameVal = vals.filter((v) => v && !/^\d+$/.test(v) && v !== skuVal).sort((a, b) => b.length - a.length)[0] ?? '';
          if (skuVal && nameVal) parsed.push({ id: uid(), sku: skuVal, name: nameVal, unit: 'шт' });
          else skipped++;
        });
        onBulkAdd(parsed);
        setImportResult({ count: parsed.length, skipped });
      } catch {
        setImportResult({ count: 0, skipped: -1 });
      }
      setImporting(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const filtered = items.filter(
    (it) => it.name.toLowerCase().includes(search.toLowerCase()) || it.sku.includes(search)
  );

  return (
    <div className="grid lg:grid-cols-[1fr_1.5fr] gap-5">
      <div className="space-y-4">
        <div
          className={`glass rounded-2xl p-5 animate-fade-up border-2 border-dashed transition-colors cursor-pointer ${dragging ? 'border-neon-green bg-neon-green/5' : 'border-border hover:border-neon-green/40'}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) parseFile(e.target.files[0]); e.target.value = ''; }} />
          <div className="flex flex-col items-center text-center gap-2 py-2">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-1 ${dragging ? colorMap['neon-green'] : 'bg-secondary'}`}>
              {importing
                ? <Icon name="LoaderCircle" size={24} className="animate-spin text-neon-green" />
                : <Icon name="FileSpreadsheet" size={24} className={dragging ? 'text-neon-green' : 'text-muted-foreground'} />}
            </span>
            <p className="font-display font-semibold">{dragging ? 'Отпустите файл' : 'Загрузить из Excel'}</p>
            <p className="text-xs text-muted-foreground">Перетащите .xlsx / .xls файл сюда или нажмите</p>
            <p className="text-[11px] text-muted-foreground/60">Колонки: Наименование + Штрихкод — в любом порядке</p>
          </div>
          {importResult && (
            <div className={`mt-3 rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 ${importResult.skipped === -1 ? 'bg-destructive/10 text-destructive' : 'bg-neon-green/10 text-neon-green border border-neon-green/30'}`}>
              {importResult.skipped === -1
                ? <><Icon name="CircleX" size={15} /> Ошибка чтения файла</>
                : <><Icon name="CircleCheck" size={15} /> Загружено {importResult.count} товаров{importResult.skipped > 0 ? `, пропущено ${importResult.skipped}` : ''}</>}
            </div>
          )}
        </div>
        <div className="glass rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '0.06s' }}>
          <p className="font-display font-semibold mb-3 text-sm">Добавить вручную</p>
          <div className="space-y-2.5">
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Штрихкод" className="bg-background/60 font-mono" />
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Наименование" className="bg-background/60" />
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Ед. изм. (шт)" className="bg-background/60" />
            <Button onClick={submit} className="w-full bg-neon-green text-background hover:bg-neon-green/90 font-semibold">
              <Icon name="Plus" size={16} className="mr-1" /> Добавить
            </Button>
          </div>
        </div>
      </div>
      <div className="glass rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию или коду…" className="pl-9 bg-background/60 h-8 text-sm" />
          </div>
          <Badge className={`border ${colorMap['neon-green']} shrink-0`}>{items.length} позиций</Badge>
        </div>
        <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Icon name="PackageSearch" size={32} />
              <p className="text-sm">{items.length === 0 ? 'База пуста — загрузите Excel или добавьте вручную' : 'Ничего не найдено'}</p>
            </div>
          )}
          {filtered.map((item, i) => (
            <div key={item.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-background/40 transition-colors">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20">
                <Icon name="Tag" size={13} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-[11px] text-muted-foreground font-mono">{item.sku}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{item.unit}</span>
              <DeleteBtn onDelete={() => onDelete(item.id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CellsScreen({
  cells, onAdd, onDelete,
}: {
  cells: Cell[];
  onAdd: (cell: Cell) => void;
  onDelete: (id: string) => void;
}) {
  const [code, setCode] = useState('');
  const [zone, setZone] = useState('A');
  const [capacity, setCapacity] = useState('100');

  const submit = () => {
    if (!code.trim()) return;
    onAdd({ id: uid(), code: code.trim().toUpperCase(), zone: zone.trim().toUpperCase() || 'A', capacity: Number(capacity) || 0 });
    setCode(''); setCapacity('100');
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
      <div className="glass rounded-2xl p-5 animate-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorMap['neon-blue']}`}>
            <Icon name="Grid3x3" size={18} />
          </span>
          <div>
            <p className="font-display font-semibold leading-none">Новая ячейка</p>
            <p className="text-xs text-muted-foreground mt-1">Адрес хранения товара на складе</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Код ячейки</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="A-01-04" className="bg-background/60 font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Зона</label>
            <Input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="A" className="bg-background/60" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Вместимость, ед.</label>
            <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} type="number" placeholder="100" className="bg-background/60" />
          </div>
          <Button onClick={submit} className="w-full bg-neon-blue text-background hover:bg-neon-blue/90 font-semibold">
            <Icon name="Plus" size={16} className="mr-1" /> Создать ячейку
          </Button>
        </div>
      </div>
      <div className="glass rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '0.08s' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-display font-semibold">Адреса хранения</p>
          <Badge className={`border ${colorMap['neon-blue']}`}>{cells.length} ячеек</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[440px] overflow-y-auto pr-1">
          {cells.map((c) => (
            <div key={c.id} className="group rounded-xl border border-border bg-background/40 p-3 hover:bg-background/60 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-semibold text-neon-blue">{c.code}</span>
                <div className="flex items-center gap-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neon-blue/10 text-neon-blue text-[11px] font-bold">{c.zone}</span>
                  <DeleteBtn onDelete={() => onDelete(c.id)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Вместимость: {c.capacity}</p>
            </div>
          ))}
          {cells.length === 0 && (
            <div className="col-span-3 flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <Icon name="Grid3x3" size={32} />
              <p className="text-sm">Ячеек пока нет</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [active, setActive] = useState<TabId>('income');

  // Проверяем сохранённую сессию при загрузке
  useEffect(() => {
    const token = localStorage.getItem('wh_token');
    if (!token) { setAuthLoading(false); return; }
    api('me', 'GET').then((res) => {
      if (res.user) setUser(res.user);
      else localStorage.removeItem('wh_token');
      setAuthLoading(false);
    });
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setActive('income');
  };

  const handleLogout = async () => {
    await api('logout', 'POST');
    localStorage.removeItem('wh_token');
    setUser(null);
  };

  const [incomes, setIncomes] = useState<Invoice[]>([
    { id: uid(), date: '24.06.2026, 14:30', num: '№ПР-0001', items: [{ id: uid(), sku: '4607012340012', name: 'Кабель UTP cat.6', cell: 'A-01-04', qty: 10 }, { id: uid(), sku: '4601546021304', name: 'Коннектор RJ-45', cell: 'A-02-11', qty: 100 }] },
    { id: uid(), date: '23.06.2026, 09:30', num: '№ПР-0002', items: [{ id: uid(), sku: '4810231025109', name: 'Роутер Wi-Fi AX1800', cell: 'B-03-07', qty: 6 }] },
  ]);
  const [outcomes, setOutcomes] = useState<Invoice[]>([
    { id: uid(), date: '24.06.2026, 13:05', num: '№РС-0001', items: [{ id: uid(), sku: '4607890123456', name: 'Патч-корд 2м синий', cell: 'B-01-02', qty: 24 }] },
  ]);
  const [stock, setStock] = useState<StockItem[]>([
    { id: uid(), sku: '4607012340012', name: 'Кабель UTP cat.6, 305м', cell: 'A-01-04', qty: 14, min: 5 },
    { id: uid(), sku: '4601546021304', name: 'Коннектор RJ-45 (100шт)', cell: 'A-02-11', qty: 48, min: 20 },
    { id: uid(), sku: '4810231025109', name: 'Роутер Wi-Fi AX1800', cell: 'B-03-07', qty: 6, min: 10 },
    { id: uid(), sku: '4607890123456', name: 'Патч-корд 2м синий', cell: 'B-01-02', qty: 132, min: 50 },
    { id: uid(), sku: '4602324110987', name: 'Источник питания 12В 5А', cell: 'C-05-03', qty: 0, min: 8 },
  ]);
  const [catalog, setCatalog] = useState<CatalogItem[]>(
    stock.map((s) => ({ id: uid(), sku: s.sku, name: s.name, unit: 'шт' }))
  );
  const [cells, setCells] = useState<Cell[]>([
    { id: uid(), code: 'A-01-04', zone: 'A', capacity: 200 },
    { id: uid(), code: 'A-02-11', zone: 'A', capacity: 150 },
    { id: uid(), code: 'B-03-07', zone: 'B', capacity: 80 },
    { id: uid(), code: 'B-01-02', zone: 'B', capacity: 300 },
    { id: uid(), code: 'C-05-03', zone: 'C', capacity: 120 },
  ]);
  const [zones, setZones] = useState<Zone[]>([
    { id: uid(), name: 'Зона A — Кабельная', done: 24, total: 24, status: 'Завершено', color: 'neon-green' },
    { id: uid(), name: 'Зона B — Активное обор.', done: 12, total: 30, status: 'В процессе', color: 'neon-purple' },
    { id: uid(), name: 'Зона C — Питание', done: 0, total: 18, status: 'Ожидает', color: 'neon-orange' },
  ]);
  const [log, setLog] = useState<LogEntry[]>([
    { id: uid(), time: '14:32', user: 'Иванов А.', action: 'Приход', target: 'Кабель UTP cat.6 +10', color: 'neon-green' },
    { id: uid(), time: '13:05', user: 'Петрова М.', action: 'Расход', target: 'Патч-корд 2м −24', color: 'neon-orange' },
    { id: uid(), time: '11:48', user: 'Система', action: 'Перемещение', target: 'A-01-04 → A-01-06', color: 'neon-blue' },
    { id: uid(), time: '10:12', user: 'Иванов А.', action: 'Инвентаризация', target: 'Зона B завершена', color: 'neon-purple' },
    { id: uid(), time: '09:30', user: 'Сидоров К.', action: 'Приход', target: 'Роутер AX1800 +6', color: 'neon-green' },
  ]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="LoaderCircle" size={32} className="animate-spin text-neon-green" />
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const isAdmin = user.role === 'admin';
  const TABS = ALL_TABS.filter((t) => !t.adminOnly || isAdmin);
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];
  // Если текущая вкладка недоступна роли — сбрасываем на первую
  const activeTab = TABS.find((t) => t.id === active) ? active : TABS[0].id;
  const lowCount = stock.filter((s) => s.qty <= s.min).length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 glass border-b border-border">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-green text-background glow-green">
              <Icon name="Warehouse" size={20} />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-none tracking-wide">СКЛАД·СИСТЕМА</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Адресное хранение · Сканер · Накладные</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-neon-green">
              <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse" /> Сканер подключён
            </span>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isAdmin ? '👑 Администратор' : 'Сотрудник'}
                </p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30 text-sm font-semibold">
                {user.name.charAt(0)}
              </span>
              <button onClick={handleLogout} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Выйти">
                <Icon name="LogOut" size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-7">
        <div className="mb-7">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Учёт <span className="text-neon-green text-glow">склада</span> в реальном времени
          </h1>
          <p className="text-muted-foreground mt-1">Добро пожаловать, {user.name}. Сканируйте, проводите приход и расход, контролируйте остатки.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-7">
          {[
            { l: 'Всего SKU', v: String(catalog.length), i: 'Tags', c: 'neon-blue' },
            { l: 'Приходов', v: String(incomes.length), i: 'ArrowDownToLine', c: 'neon-green' },
            { l: 'Расходов', v: String(outcomes.length), i: 'ArrowUpFromLine', c: 'neon-orange' },
            { l: 'Ячеек', v: String(cells.length), i: 'Boxes', c: 'neon-purple' },
            { l: 'Мало на складе', v: String(lowCount), i: 'TriangleAlert', c: 'neon-orange' },
          ].map((s, i) => (
            <div key={s.l} className="glass rounded-2xl p-4 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <Icon name={s.i} size={18} className={`${textMap[s.c]} mb-2`} />
              <p className="font-display text-2xl font-bold">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? `${colorMap[t.color]} border`
                  : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div key={activeTab}>
          {activeTab === 'income' && (
            <OpScreen tab={tab} invoices={incomes} onDelete={(id) => setIncomes((p) => p.filter((v) => v.id !== id))} />
          )}
          {activeTab === 'outcome' && (
            <OpScreen tab={tab} invoices={outcomes} onDelete={(id) => setOutcomes((p) => p.filter((v) => v.id !== id))} />
          )}
          {activeTab === 'stock' && (
            <StockScreen items={stock} onDelete={(id) => setStock((p) => p.filter((v) => v.id !== id))} />
          )}
          {activeTab === 'catalog' && isAdmin && (
            <CatalogScreen
              items={catalog}
              onAdd={(item) => setCatalog((p) => [item, ...p])}
              onBulkAdd={(newItems) => setCatalog((p) => [...newItems, ...p])}
              onDelete={(id) => setCatalog((p) => p.filter((v) => v.id !== id))}
            />
          )}
          {activeTab === 'cells' && isAdmin && (
            <CellsScreen
              cells={cells}
              onAdd={(cell) => setCells((p) => [cell, ...p])}
              onDelete={(id) => setCells((p) => p.filter((v) => v.id !== id))}
            />
          )}
          {activeTab === 'inventory' && isAdmin && (
            <InventoryScreen zones={zones} onDelete={(id) => setZones((p) => p.filter((v) => v.id !== id))} />
          )}
          {activeTab === 'log' && isAdmin && (
            <LogScreen entries={log} onDelete={(id) => setLog((p) => p.filter((v) => v.id !== id))} />
          )}
          {activeTab === 'users' && isAdmin && <UsersScreen />}
        </div>
      </main>
    </div>
  );
}