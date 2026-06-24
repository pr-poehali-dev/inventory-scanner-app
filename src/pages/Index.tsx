import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type TabId = 'income' | 'outcome' | 'stock' | 'catalog' | 'cells' | 'inventory' | 'log';

const TABS: { id: TabId; label: string; icon: string; color: string }[] = [
  { id: 'income', label: 'Приход', icon: 'ArrowDownToLine', color: 'neon-green' },
  { id: 'outcome', label: 'Расход', icon: 'ArrowUpFromLine', color: 'neon-orange' },
  { id: 'stock', label: 'Остаток', icon: 'Boxes', color: 'neon-blue' },
  { id: 'catalog', label: 'База товаров', icon: 'Tags', color: 'neon-green' },
  { id: 'cells', label: 'Ячейки', icon: 'Grid3x3', color: 'neon-blue' },
  { id: 'inventory', label: 'Инвентаризация', icon: 'ClipboardCheck', color: 'neon-purple' },
  { id: 'log', label: 'Журнал', icon: 'ScrollText', color: 'neon-green' },
];

const STOCK = [
  { sku: '4607012340012', name: 'Кабель UTP cat.6, 305м', cell: 'A-01-04', qty: 14, min: 5 },
  { sku: '4601546021304', name: 'Коннектор RJ-45 (100шт)', cell: 'A-02-11', qty: 48, min: 20 },
  { sku: '4810231025109', name: 'Роутер Wi-Fi AX1800', cell: 'B-03-07', qty: 6, min: 10 },
  { sku: '4607890123456', name: 'Патч-корд 2м синий', cell: 'B-01-02', qty: 132, min: 50 },
  { sku: '4602324110987', name: 'Источник питания 12В 5А', cell: 'C-05-03', qty: 0, min: 8 },
];

const LOG = [
  { time: '14:32', user: 'Иванов А.', action: 'Приход', target: 'Кабель UTP cat.6 +10', color: 'neon-green' },
  { time: '13:05', user: 'Петрова М.', action: 'Расход', target: 'Патч-корд 2м −24', color: 'neon-orange' },
  { time: '11:48', user: 'Система', action: 'Перемещение', target: 'A-01-04 → A-01-06', color: 'neon-blue' },
  { time: '10:12', user: 'Иванов А.', action: 'Инвентаризация', target: 'Зона B завершена', color: 'neon-purple' },
  { time: '09:30', user: 'Сидоров К.', action: 'Приход', target: 'Роутер AX1800 +6', color: 'neon-green' },
];

const colorMap: Record<string, string> = {
  'neon-green': 'text-neon-green border-neon-green/40 bg-neon-green/10',
  'neon-orange': 'text-neon-orange border-neon-orange/40 bg-neon-orange/10',
  'neon-blue': 'text-neon-blue border-neon-blue/40 bg-neon-blue/10',
  'neon-purple': 'text-neon-purple border-neon-purple/40 bg-neon-purple/10',
};

const textMap: Record<string, string> = {
  'neon-green': 'text-neon-green',
  'neon-orange': 'text-neon-orange',
  'neon-blue': 'text-neon-blue',
  'neon-purple': 'text-neon-purple',
};

const barMap: Record<string, string> = {
  'neon-green': 'bg-neon-green',
  'neon-orange': 'bg-neon-orange',
  'neon-blue': 'bg-neon-blue',
  'neon-purple': 'bg-neon-purple',
};

const dotMap: Record<string, string> = {
  'neon-green': 'border-neon-green',
  'neon-orange': 'border-neon-orange',
  'neon-blue': 'border-neon-blue',
  'neon-purple': 'border-neon-purple',
};

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

function OpScreen({ tab }: { tab: typeof TABS[number] }) {
  const isIncome = tab.id === 'income';
  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
      <Scanner accent={tab.color} />
      <div className="glass rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '0.08s' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-display font-semibold">{isIncome ? 'Накладная прихода' : 'Накладная расхода'}</p>
          <Button variant="outline" size="sm" className="border-neon-blue/40 text-neon-blue hover:bg-neon-blue/10">
            <Icon name="FileText" size={15} className="mr-1.5" /> Сформировать PDF
          </Button>
        </div>
        <div className="space-y-2">
          {STOCK.slice(0, 3).map((item, i) => (
            <div key={item.sku} className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-4 py-3 animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.06}s` }}>
              <div className="min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{item.sku} · ячейка {item.cell}</p>
              </div>
              <Badge className={`ml-3 shrink-0 border ${colorMap[tab.color]}`}>
                {isIncome ? '+' : '−'}{(i + 1) * 4} шт
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-muted-foreground text-sm">Позиций: 3 · Всего: 24 шт</span>
          <Button className={`font-semibold ${isIncome ? 'bg-neon-green text-background hover:bg-neon-green/90' : 'bg-neon-orange text-background hover:bg-neon-orange/90'}`}>
            <Icon name="Check" size={16} className="mr-1.5" /> Провести
          </Button>
        </div>
      </div>
    </div>
  );
}

function StockScreen() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-fade-up">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <p className="font-display font-semibold">Остатки по адресам хранения</p>
        <div className="relative w-64 max-w-[50vw]">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Поиск по названию / ячейке" className="pl-9 bg-background/60" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {STOCK.map((item, i) => {
          const low = item.qty <= item.min;
          return (
            <div key={item.sku} className="flex items-center gap-4 px-5 py-4 hover:bg-background/40 transition-colors animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
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
              {low && (
                <Badge variant="destructive" className="ml-1">
                  {item.qty === 0 ? 'Нет' : 'Мало'}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InventoryScreen() {
  const zones = [
    { name: 'Зона A — Кабельная', done: 24, total: 24, status: 'Завершено', color: 'neon-green' },
    { name: 'Зона B — Активное обор.', done: 12, total: 30, status: 'В процессе', color: 'neon-purple' },
    { name: 'Зона C — Питание', done: 0, total: 18, status: 'Ожидает', color: 'neon-orange' },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-5">
      {zones.map((z, i) => {
        const pct = Math.round((z.done / z.total) * 100);
        return (
          <div key={z.name} className="glass rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="flex items-center justify-between mb-4">
              <Icon name="ClipboardCheck" size={20} className={textMap[z.color]} />
              <Badge className={`border ${colorMap[z.color]}`}>{z.status}</Badge>
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
    </div>
  );
}

function LogScreen() {
  return (
    <div className="glass rounded-2xl p-5 animate-fade-up">
      <p className="font-display font-semibold mb-4">Журнал операций и изменений</p>
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
        {LOG.map((l, i) => (
          <div key={i} className="relative pb-5 last:pb-0 animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <span className={`absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-background ${dotMap[l.color]}`} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{l.time}</span>
              <Badge className={`border ${colorMap[l.color]}`}>{l.action}</Badge>
              <span className="text-sm">{l.target}</span>
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
  items,
  onAdd,
}: {
  items: { sku: string; name: string; unit: string }[];
  onAdd: (item: { sku: string; name: string; unit: string }) => void;
}) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('шт');

  const submit = () => {
    if (!sku.trim() || !name.trim()) return;
    onAdd({ sku: sku.trim(), name: name.trim(), unit: unit.trim() || 'шт' });
    setSku('');
    setName('');
    setUnit('шт');
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
      <div className="glass rounded-2xl p-5 animate-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorMap['neon-green']}`}>
            <Icon name="PackagePlus" size={18} />
          </span>
          <div>
            <p className="font-display font-semibold leading-none">Новый товар в базу</p>
            <p className="text-xs text-muted-foreground mt-1">Карточка товара для учёта на складе</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Артикул / штрихкод</label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="4607012340012" className="bg-background/60 font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Наименование</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Кабель UTP cat.6, 305м" className="bg-background/60" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Единица измерения</label>
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="шт" className="bg-background/60" />
          </div>
          <Button onClick={submit} className="w-full bg-neon-green text-background hover:bg-neon-green/90 font-semibold">
            <Icon name="Plus" size={16} className="mr-1" /> Добавить в базу
          </Button>
        </div>
      </div>
      <div className="glass rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: '0.08s' }}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <p className="font-display font-semibold">База товаров</p>
          <Badge className={`border ${colorMap['neon-green']}`}>{items.length} позиций</Badge>
        </div>
        <div className="divide-y divide-border max-h-[440px] overflow-y-auto">
          {items.map((item, i) => (
            <div key={item.sku + i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-background/40 transition-colors">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-green/10 text-neon-green border border-neon-green/30">
                <Icon name="Tag" size={15} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
              </div>
              <span className="text-xs text-muted-foreground">{item.unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CellsScreen({
  cells,
  onAdd,
}: {
  cells: { code: string; zone: string; capacity: number }[];
  onAdd: (cell: { code: string; zone: string; capacity: number }) => void;
}) {
  const [code, setCode] = useState('');
  const [zone, setZone] = useState('A');
  const [capacity, setCapacity] = useState('100');

  const submit = () => {
    if (!code.trim()) return;
    onAdd({ code: code.trim().toUpperCase(), zone: zone.trim().toUpperCase() || 'A', capacity: Number(capacity) || 0 });
    setCode('');
    setCapacity('100');
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
          {cells.map((c, i) => (
            <div key={c.code + i} className="rounded-xl border border-border bg-background/40 p-3 hover:bg-background/60 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-semibold text-neon-blue">{c.code}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neon-blue/10 text-neon-blue text-[11px] font-bold">{c.zone}</span>
              </div>
              <p className="text-xs text-muted-foreground">Вместимость: {c.capacity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [active, setActive] = useState<TabId>('income');
  const [catalog, setCatalog] = useState(
    STOCK.map((s) => ({ sku: s.sku, name: s.name, unit: 'шт' }))
  );
  const [cells, setCells] = useState([
    { code: 'A-01-04', zone: 'A', capacity: 200 },
    { code: 'A-02-11', zone: 'A', capacity: 150 },
    { code: 'B-03-07', zone: 'B', capacity: 80 },
    { code: 'B-01-02', zone: 'B', capacity: 300 },
    { code: 'C-05-03', zone: 'C', capacity: 120 },
  ]);
  const tab = TABS.find((t) => t.id === active)!;

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
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-neon-green">
              <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse" /> Сканер подключён
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold">ИА</span>
          </div>
        </div>
      </header>

      <main className="container py-7">
        <div className="mb-7">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Учёт <span className="text-neon-green text-glow">склада</span> в реальном времени
          </h1>
          <p className="text-muted-foreground mt-1">Сканируйте, проводите приход и расход, контролируйте остатки по ячейкам.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-7">
          {[
            { l: 'Всего SKU', v: '1 284', i: 'Tags', c: 'neon-blue' },
            { l: 'Приход сегодня', v: '+342', i: 'ArrowDownToLine', c: 'neon-green' },
            { l: 'Расход сегодня', v: '−218', i: 'ArrowUpFromLine', c: 'neon-orange' },
            { l: 'Заполнено ячеек', v: '78%', i: 'Boxes', c: 'neon-purple' },
            { l: 'Мало на складе', v: '2', i: 'TriangleAlert', c: 'neon-orange' },
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
                active === t.id
                  ? `${colorMap[t.color]} border`
                  : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon name={t.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div key={active}>
          {(active === 'income' || active === 'outcome') && <OpScreen tab={tab} />}
          {active === 'stock' && <StockScreen />}
          {active === 'catalog' && (
            <CatalogScreen items={catalog} onAdd={(item) => setCatalog((prev) => [item, ...prev])} />
          )}
          {active === 'cells' && (
            <CellsScreen cells={cells} onAdd={(cell) => setCells((prev) => [cell, ...prev])} />
          )}
          {active === 'inventory' && <InventoryScreen />}
          {active === 'log' && <LogScreen />}
        </div>
      </main>
    </div>
  );
}