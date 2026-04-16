"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Can } from "@/components/shared/permission-gate";
import {
  useRegions,
  useCreateRegion,
  useDeleteRegion,
  useSubstations,
  useCreateSubstation,
  useDeleteSubstation,
  useTransformers,
  useCreateTransformer,
  useDeleteTransformer,
  useDCUs,
  useCreateDCU,
  useDeleteDCU,
} from "@/lib/hooks/use-topology";
import {
  MapPin,
  Building2,
  Zap,
  HardDrive,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";

export default function TopologyPage() {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedSubstationId, setSelectedSubstationId] = useState<number | null>(null);
  const [selectedTransformerId, setSelectedTransformerId] = useState<number | null>(null);

  const { data: regions, isLoading: loadingRegions } = useRegions();
  const { data: substations, isLoading: loadingSubs } = useSubstations(selectedRegionId ?? undefined);
  const { data: transformers, isLoading: loadingTx } = useTransformers(selectedSubstationId ?? undefined);
  const { data: dcus, isLoading: loadingDCUs } = useDCUs(selectedTransformerId ?? undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#14532d]">Network Topology</h1>
      </div>

      <p className="text-sm text-[#6b7280]">
        Navigate the hierarchy: Region &gt; Substation &gt; Transformer &gt; DCU
      </p>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Regions Column */}
        <TopologyColumn
          title="Regions"
          icon={MapPin}
          items={regions ?? []}
          loading={loadingRegions}
          selectedId={selectedRegionId}
          onSelect={(id) => {
            setSelectedRegionId(id);
            setSelectedSubstationId(null);
            setSelectedTransformerId(null);
          }}
          renderItem={(r) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-[#6b7280]">{r.code}</p>
              </div>
              <Badge variant="outline">{r.code}</Badge>
            </div>
          )}
          AddDialog={AddRegionDialog}
          useDelete={useDeleteRegion}
        />

        {/* Substations Column */}
        <TopologyColumn
          title="Substations"
          icon={Building2}
          items={selectedRegionId ? (substations ?? []) : []}
          loading={loadingSubs && !!selectedRegionId}
          selectedId={selectedSubstationId}
          onSelect={(id) => {
            setSelectedSubstationId(id);
            setSelectedTransformerId(null);
          }}
          renderItem={(s) => (
            <p className="text-sm font-medium">{s.name}</p>
          )}
          AddDialog={selectedRegionId ? (props) => <AddSubstationDialog {...props} regionId={selectedRegionId} /> : undefined}
          useDelete={useDeleteSubstation}
          emptyText={selectedRegionId ? "No substations" : "Select a region"}
        />

        {/* Transformers Column */}
        <TopologyColumn
          title="Transformers"
          icon={Zap}
          items={selectedSubstationId ? (transformers ?? []) : []}
          loading={loadingTx && !!selectedSubstationId}
          selectedId={selectedTransformerId}
          onSelect={(id) => setSelectedTransformerId(id)}
          renderItem={(t) => (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{t.name}</p>
              {t.rating_kva && <Badge variant="secondary">{t.rating_kva} kVA</Badge>}
            </div>
          )}
          AddDialog={selectedSubstationId ? (props) => <AddTransformerDialog {...props} substationId={selectedSubstationId} /> : undefined}
          useDelete={useDeleteTransformer}
          emptyText={selectedSubstationId ? "No transformers" : "Select a substation"}
        />

        {/* DCUs Column */}
        <TopologyColumn
          title="DCUs"
          icon={HardDrive}
          items={selectedTransformerId ? (dcus ?? []) : []}
          loading={loadingDCUs && !!selectedTransformerId}
          selectedId={null}
          onSelect={() => {}}
          renderItem={(d) => (
            <p className="text-sm font-medium font-mono">{d.serial_number}</p>
          )}
          AddDialog={selectedTransformerId ? (props) => <AddDCUDialog {...props} transformerId={selectedTransformerId} /> : undefined}
          useDelete={useDeleteDCU}
          emptyText={selectedTransformerId ? "No DCUs" : "Select a transformer"}
        />
      </div>
    </div>
  );
}

// --- Generic Column Component ---

interface TopologyColumnProps<T extends { id: number }> {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: T[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  renderItem: (item: T) => React.ReactNode;
  AddDialog?: React.ComponentType<{ onSuccess: () => void }>;
  useDelete: () => { mutateAsync: (id: number) => Promise<unknown>; isPending: boolean };
  emptyText?: string;
}

function TopologyColumn<T extends { id: number }>({
  title,
  icon: Icon,
  items,
  loading,
  selectedId,
  onSelect,
  renderItem,
  AddDialog,
  useDelete: useDeleteHook,
  emptyText = "No items",
}: TopologyColumnProps<T>) {
  const deleteMutation = useDeleteHook();

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`${title.slice(0, -1)} deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <Card className="border-[#bbf7d0]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#14532d]">
            <Icon className="h-4 w-4" />
            {title}
            <Badge variant="secondary" className="ml-1">{items.length}</Badge>
          </CardTitle>
          {AddDialog && (
            <Can permission="topology.create">
              <AddDialog onSuccess={() => {}} />
            </Can>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1 max-h-[500px] overflow-y-auto">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#6b7280]">{emptyText}</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                selectedId === item.id
                  ? "bg-[#15803d] text-white"
                  : "hover:bg-[#dcfce7]"
              }`}
            >
              <div className="flex-1">{renderItem(item)}</div>
              <div className="flex items-center gap-1">
                <Can permission="topology.delete">
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 ${
                      selectedId === item.id ? "text-red-200 hover:text-red-100" : "text-red-500"
                    }`}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Can>
                <ChevronRight className={`h-4 w-4 ${selectedId === item.id ? "text-white" : "text-[#6b7280]"}`} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// --- Add Dialogs ---

function AddRegionDialog({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);
  const createRegion = useCreateRegion();

  const handleSubmit = async () => {
    try {
      await createRegion.mutateAsync({ name, code });
      toast.success("Region created");
      setName("");
      setCode("");
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create region");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="h-7 text-xs" />}>
        <Plus className="mr-1 h-3 w-3" /> Add
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Region</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="region-name">Name</Label>
            <Input id="region-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dar es Salaam" />
          </div>
          <div>
            <Label htmlFor="region-code">Code</Label>
            <Input id="region-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="DSM" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit} disabled={!name || !code || createRegion.isPending}>
            {createRegion.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddSubstationDialog({ onSuccess, regionId }: { onSuccess: () => void; regionId: number }) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const create = useCreateSubstation();

  const handleSubmit = async () => {
    try {
      await create.mutateAsync({ name, region_id: regionId });
      toast.success("Substation created");
      setName("");
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="h-7 text-xs" />}>
        <Plus className="mr-1 h-3 w-3" /> Add
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Substation</DialogTitle></DialogHeader>
        <div>
          <Label htmlFor="sub-name">Name</Label>
          <Input id="sub-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kinondoni" />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit} disabled={!name || create.isPending}>
            {create.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddTransformerDialog({ onSuccess, substationId }: { onSuccess: () => void; substationId: number }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [open, setOpen] = useState(false);
  const create = useCreateTransformer();

  const handleSubmit = async () => {
    try {
      await create.mutateAsync({
        name,
        substation_id: substationId,
        rating_kva: rating ? Number(rating) : undefined,
      });
      toast.success("Transformer created");
      setName("");
      setRating("");
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="h-7 text-xs" />}>
        <Plus className="mr-1 h-3 w-3" /> Add
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Transformer</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="tx-name">Name</Label>
            <Input id="tx-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="TX-001" />
          </div>
          <div>
            <Label htmlFor="tx-rating">Rating (kVA)</Label>
            <Input id="tx-rating" type="number" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="200" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit} disabled={!name || create.isPending}>
            {create.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddDCUDialog({ onSuccess, transformerId }: { onSuccess: () => void; transformerId: number }) {
  const [serial, setSerial] = useState("");
  const [open, setOpen] = useState(false);
  const create = useCreateDCU();

  const handleSubmit = async () => {
    try {
      await create.mutateAsync({ serial_number: serial, transformer_id: transformerId });
      toast.success("DCU created");
      setSerial("");
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="h-7 text-xs" />}>
        <Plus className="mr-1 h-3 w-3" /> Add
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add DCU</DialogTitle></DialogHeader>
        <div>
          <Label htmlFor="dcu-serial">Serial Number</Label>
          <Input id="dcu-serial" value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="DCU-001" />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit} disabled={!serial || create.isPending}>
            {create.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
