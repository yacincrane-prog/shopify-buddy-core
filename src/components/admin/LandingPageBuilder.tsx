import { useState, useCallback, useEffect, forwardRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useProducts } from "@/hooks/useProducts";
import {
  fetchAllLandingPages,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
  fetchLPSections,
  createLPSection,
  updateLPSection,
  deleteLPSection,
  reorderLPSections,
  bulkCreateSections,
  duplicateLPSection,
  TEMPLATES,
  LP_SECTION_TYPES,
  SECTION_PRESETS,
  type LandingPage,
  type LPSection,
  type LPSectionType,
} from "@/lib/landing-pages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  GripVertical,
  Rocket,
  ArrowLeft,
  Globe,
  ExternalLink,
  PanelRightOpen,
  X,
  Monitor,
  Smartphone,
  Copy,
  LayoutTemplate,
  Maximize2,
} from "lucide-react";
import { PreviewFrame } from "@/components/admin/PreviewFrame";
import { toast } from "sonner";

type View = "list" | "create" | "edit";

export function LandingPageBuilder() {
  const queryClient = useQueryClient();
  const { data: products } = useProducts();
  const [view, setView] = useState<View>("list");
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newProductId, setNewProductId] = useState("");
  const [newTemplate, setNewTemplate] = useState("classic");

  const { data: pages, isLoading } = useQuery({
    queryKey: ["landing-pages-admin"],
    queryFn: fetchAllLandingPages,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const product = products?.find((p) => p.id === newProductId);
      if (!product) throw new Error("Select a product");
      const slug = newSlug.trim() || product.slug + "-" + Date.now().toString(36);
      const page = await createLandingPage({
        product_id: newProductId,
        title: newTitle || product.title,
        slug,
        template: newTemplate,
      });
      if (!page) throw new Error("Failed to create — slug may already exist");
      const template = TEMPLATES.find((t) => t.id === newTemplate);
      if (template) {
        await bulkCreateSections(page.id, template.sections);
      }
      return page;
    },
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: ["landing-pages-admin"] });
      toast.success("Landing page created!");
      setEditingPage(page as LandingPage);
      setView("edit");
      setNewTitle("");
      setNewSlug("");
      setNewProductId("");
    },
    onError: (e: any) => toast.error(e.message || "Failed to create"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLandingPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-pages-admin"] });
      toast.success("Deleted");
    },
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      updateLandingPage(id, { is_published: published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-pages-admin"] });
      toast.success("Updated");
    },
  });

  if (view === "create") {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setView("list")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Create Landing Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Page Details</h3>
              <p className="text-xs text-muted-foreground">Select a product and customize the page title</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Product <span className="text-destructive">*</span></Label>
                <Select value={newProductId} onValueChange={setNewProductId}>
                  <SelectTrigger><SelectValue placeholder="Select product…" /></SelectTrigger>
                  <SelectContent>
                    {products?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Leave empty to use product title" />
              </div>
              <div className="space-y-1.5">
                <Label>Slug (URL)</Label>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>/offer/</span>
                  <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value.replace(/[^a-z0-9-]/g, ""))} placeholder="auto-generated if empty" className="font-mono text-xs" />
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Template</h3>
              <p className="text-xs text-muted-foreground">Choose a pre-built template to start with</p>
            </div>
            <div className="grid gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setNewTemplate(t.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    newTemplate === t.id ? "border-accent bg-accent/5 shadow-sm" : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.sections.length} sections: {t.sections.map((s) => LP_SECTION_TYPES.find((st) => st.value === s)?.label).join(", ")}
                  </p>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-border">
              <Button onClick={() => createMutation.mutate()} disabled={!newProductId || createMutation.isPending}>
                <Rocket className="w-4 h-4 mr-1" /> Create Landing Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "edit" && editingPage) {
    return (
      <VisualBuilder
        page={editingPage}
        onBack={() => { setView("list"); setEditingPage(null); }}
      />
    );
  }

  // List view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent" />
          Landing Pages
        </h3>
        <Button size="sm" onClick={() => setView("create")}>
          <Plus className="w-4 h-4 mr-1" /> New Page
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm py-4">Loading…</p>
      ) : !pages?.length ? (
        <p className="text-sm text-muted-foreground py-4">No landing pages yet.</p>
      ) : (
        <div className="space-y-2">
          {pages.map((page: any) => (
            <Card key={page.id}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{page.title}</p>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="text-xs font-mono">/offer/{page.slug}</Badge>
                    {page.is_published
                      ? <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] text-xs">Live</Badge>
                      : <Badge variant="outline" className="text-xs">Draft</Badge>}
                  </div>
                </div>
                <div className="flex gap-1">
                  {page.is_published && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={`/offer/${page.slug}`} target="_blank" rel="noopener">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => togglePublish.mutate({ id: page.id, published: !page.is_published })}>
                    {page.is_published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditingPage(page); setView("edit"); }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(page.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Sortable Section Item
// ══════════════════════════════════════════════════════════════

function SortableSectionItem({
  section,
  index,
  total,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  sectionLabel,
}: {
  section: LPSection;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  sectionLabel: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : undefined,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-left text-sm transition-colors group ${
        isSelected
          ? "bg-accent/10 text-accent border border-accent/30"
          : "hover:bg-muted/60 border border-transparent"
      } ${!section.is_visible ? "opacity-50" : ""} ${isDragging ? "shadow-lg bg-card" : ""}`}
    >
      <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing shrink-0 touch-none">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
      </span>
      <span className="flex-1 truncate text-xs font-medium">{sectionLabel}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="p-0.5 hover:text-accent"
          title="Duplicate"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={index === 0}
          className="p-0.5 hover:text-accent disabled:opacity-30"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={index === total - 1}
          className="p-0.5 hover:text-accent disabled:opacity-30"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
// Visual Builder — 3-panel layout
// ══════════════════════════════════════════════════════════════

function VisualBuilder({ page, onBack }: { page: LandingPage; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingType, setAddingType] = useState<LPSectionType | "">("");
  const [addMode, setAddMode] = useState<"type" | "preset">("type");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const [fullPreview, setFullPreview] = useState(false);

  const { data: sections, isLoading } = useQuery({
    queryKey: ["lp-sections-admin", page.id],
    queryFn: () => fetchLPSections(page.id),
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["lp-sections-admin", page.id] });
    // Refresh preview iframe
    setPreviewKey((k) => k + 1);
  }, [queryClient, page.id]);

  const addMutation = useMutation({
    mutationFn: (type: LPSectionType) => createLPSection(page.id, type, sections?.length ?? 0),
    onSuccess: () => { invalidate(); toast.success("Section added"); setAddingType(""); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<LPSection, "content" | "is_visible">> }) =>
      updateLPSection(id, updates),
    onSuccess: () => { invalidate(); toast.success("Saved"); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLPSection,
    onSuccess: () => { invalidate(); toast.success("Removed"); setSelectedId(null); },
  });

  const duplicateMutation = useMutation({
    mutationFn: (section: LPSection) => duplicateLPSection(section, sections?.length ?? 0),
    onSuccess: () => { invalidate(); toast.success("Section duplicated"); },
  });

  const addPresetMutation = useMutation({
    mutationFn: async (preset: typeof SECTION_PRESETS[number]) => {
      const { data } = await (await import("@/integrations/supabase/client")).supabase
        .from("landing_page_sections")
        .insert({
          landing_page_id: page.id,
          section_type: preset.type,
          position: sections?.length ?? 0,
          content: preset.content,
        })
        .select()
        .single();
      return data;
    },
    onSuccess: () => { invalidate(); toast.success("Template section added"); },
  });

  const moveMutation = useMutation({
    mutationFn: reorderLPSections,
    onSuccess: invalidate,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !sections) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(sections, oldIndex, newIndex);
    moveMutation.mutate(reordered.map((s, i) => ({ id: s.id, position: i })));
  };

  const moveSection = (index: number, dir: "up" | "down") => {
    if (!sections) return;
    const arr = [...sections];
    const swap = dir === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= arr.length) return;
    [arr[index], arr[swap]] = [arr[swap], arr[index]];
    moveMutation.mutate(arr.map((s, i) => ({ id: s.id, position: i })));
  };

  const sectionLabel = (type: string) => LP_SECTION_TYPES.find((t) => t.value === type)?.label ?? type;
  const selectedSection = sections?.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] -m-6">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <h2 className="text-sm font-semibold truncate max-w-[200px]">{page.title}</h2>
          <Badge variant="secondary" className="text-[10px] font-mono">/offer/{page.slug}</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-md border border-border p-0.5 bg-muted/30">
            <Button
              variant={previewMode === "desktop" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setPreviewMode("desktop")}
            >
              <Monitor className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={previewMode === "mobile" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setPreviewMode("mobile")}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={() => setFullPreview(true)}>
            <Maximize2 className="w-3.5 h-3.5 mr-1" /> Full Preview
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={`/offer/${page.slug}`} target="_blank" rel="noopener">
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open
            </a>
          </Button>
        </div>
      </div>

      {/* 3-panel body - stacked on small screens, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left: Section List */}
        <div className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-card flex flex-col max-h-[30vh] lg:max-h-none">
          <div className="px-3 py-2.5 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sections</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <p className="text-xs text-muted-foreground p-2">Loading…</p>
              ) : sections?.length ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    {sections.map((section, index) => (
                      <SortableSectionItem
                        key={section.id}
                        section={section}
                        index={index}
                        total={sections.length}
                        isSelected={section.id === selectedId}
                        onSelect={() => setSelectedId(section.id === selectedId ? null : section.id)}
                        onMoveUp={() => moveSection(index, "up")}
                        onMoveDown={() => moveSection(index, "down")}
                        onDuplicate={() => duplicateMutation.mutate(section)}
                        sectionLabel={sectionLabel(section.section_type)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : null}
            </div>
          </ScrollArea>

          {/* Add section */}
          <div className="p-2 border-t border-border space-y-2">
            <div className="flex rounded-md border border-border p-0.5 bg-muted/30">
              <button
                onClick={() => setAddMode("type")}
                className={`flex-1 text-[10px] font-medium py-1 rounded-sm transition-colors ${
                  addMode === "type" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <Plus className="w-3 h-3 inline mr-0.5" /> Blank
              </button>
              <button
                onClick={() => setAddMode("preset")}
                className={`flex-1 text-[10px] font-medium py-1 rounded-sm transition-colors ${
                  addMode === "preset" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <LayoutTemplate className="w-3 h-3 inline mr-0.5" /> Templates
              </button>
            </div>

            {addMode === "type" ? (
              <>
                <Select value={addingType} onValueChange={(v) => setAddingType(v as LPSectionType)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Add section…" />
                  </SelectTrigger>
                  <SelectContent>
                    {LP_SECTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={() => addingType && addMutation.mutate(addingType as LPSectionType)}
                  disabled={!addingType}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Section
                </Button>
              </>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-1">
                  {SECTION_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => addPresetMutation.mutate(preset)}
                      disabled={addPresetMutation.isPending}
                      className="w-full text-left px-2.5 py-2 rounded-md text-xs hover:bg-muted/60 border border-transparent hover:border-border transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Center: Live Preview */}
        <div className="flex-1 bg-muted/30 flex items-start justify-center overflow-auto p-4 min-h-[40vh] lg:min-h-0">
          <div
            className={`bg-background border border-border rounded-lg shadow-lg overflow-hidden transition-all duration-300 w-full ${
              previewMode === "mobile" ? "w-[375px]" : "w-full max-w-[900px]"
            }`}
            style={{ height: "calc(100vh - 200px)" }}
          >
            <iframe
              key={previewKey}
              src={`/offer/${page.slug}`}
              className="w-full h-full border-0"
              title="Landing page preview"
            />
          </div>
        </div>

        {/* Right: Section Editor */}
        {selectedSection ? (
          <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col max-h-[40vh] lg:max-h-none">
            <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Badge variant="secondary" className="text-[10px] shrink-0">{sectionLabel(selectedSection.section_type)}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => updateMutation.mutate({ id: selectedSection.id, updates: { is_visible: !selectedSection.is_visible } })}
                >
                  {selectedSection.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive"
                  onClick={() => deleteMutation.mutate(selectedSection.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedId(null)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3">
                <SectionContentEditor
                  key={selectedSection.id}
                  section={selectedSection}
                  onSave={(content) => updateMutation.mutate({ id: selectedSection.id, updates: { content } })}
                />
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="w-80 shrink-0 border-l border-border bg-card flex flex-col items-center justify-center text-center p-6">
            <PanelRightOpen className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No section selected</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Click a section in the left panel to edit its content</p>
          </div>
        )}
      </div>
      <PreviewFrame
        url={`/offer/${page.slug}`}
        open={fullPreview}
        onOpenChange={setFullPreview}
        title={`${page.title} — Full Preview`}
        refreshKey={previewKey}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Section Content Editor (right panel)
// ══════════════════════════════════════════════════════════════

function SectionContentEditor({ section, onSave }: { section: LPSection; onSave: (c: Record<string, any>) => void }) {
  const [content, setContent] = useState(section.content);
  const hasChanges = JSON.stringify(content) !== JSON.stringify(section.content);
  const update = (key: string, value: any) => setContent({ ...content, [key]: value });

  // Reset when section changes
  useEffect(() => {
    setContent(section.content);
  }, [section.id, section.content]);

  const renderArrayEditor = (key: string, fields: { name: string; placeholder: string; type?: string }[]) => (
    <div className="space-y-2">
      {(content[key] ?? []).map((item: any, i: number) => (
        <div key={i} className="border border-border rounded-lg p-2.5 space-y-1.5 bg-muted/20">
          {fields.map((f) => (
            <div key={f.name}>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.placeholder}</Label>
              {f.type === "textarea" ? (
                <Textarea
                  placeholder={f.placeholder}
                  value={item[f.name] ?? ""}
                  rows={2}
                  className="text-xs mt-0.5"
                  onChange={(e) => {
                    const items = [...(content[key] ?? [])];
                    items[i] = { ...items[i], [f.name]: e.target.value };
                    update(key, items);
                  }}
                />
              ) : (
                <Input
                  placeholder={f.placeholder}
                  value={item[f.name] ?? ""}
                  type={f.type ?? "text"}
                  className="h-8 text-xs mt-0.5"
                  onChange={(e) => {
                    const items = [...(content[key] ?? [])];
                    items[i] = { ...items[i], [f.name]: e.target.value };
                    update(key, items);
                  }}
                />
              )}
            </div>
          ))}
          <Button size="sm" variant="ghost" className="h-6 text-[10px] text-destructive" onClick={() => {
            update(key, (content[key] ?? []).filter((_: any, j: number) => j !== i));
          }}>
            <Trash2 className="w-3 h-3 mr-1" /> Remove
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={() => {
        const empty: any = {};
        fields.forEach((f) => (empty[f.name] = ""));
        update(key, [...(content[key] ?? []), empty]);
      }}>
        <Plus className="w-3 h-3 mr-1" /> Add Item
      </Button>
    </div>
  );

  const renderFields = () => {
    switch (section.section_type) {
      case "hero":
        return (
          <div className="space-y-3">
            <FieldGroup label="Headline">
              <Input className="h-8 text-xs" placeholder="Headline" value={content.headline ?? ""} onChange={(e) => update("headline", e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Subtitle">
              <Input className="h-8 text-xs" placeholder="Subtitle" value={content.subtitle ?? ""} onChange={(e) => update("subtitle", e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Image URL">
              <Input className="h-8 text-xs" placeholder="Image URL" value={content.image_url ?? ""} onChange={(e) => update("image_url", e.target.value)} />
            </FieldGroup>
            <FieldGroup label="CTA Button Text">
              <Input className="h-8 text-xs" placeholder="Order Now" value={content.cta_text ?? ""} onChange={(e) => update("cta_text", e.target.value)} />
            </FieldGroup>
          </div>
        );
      case "gallery":
      case "order_form":
        return (
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">This section uses product data automatically. No configuration needed.</p>
          </div>
        );
      case "video":
        return (
          <div className="space-y-3">
            <FieldGroup label="Video Title">
              <Input className="h-8 text-xs" placeholder="Video Title" value={content.title ?? ""} onChange={(e) => update("title", e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Video URL">
              <Input className="h-8 text-xs" placeholder="YouTube/Vimeo embed URL" value={content.video_url ?? ""} onChange={(e) => update("video_url", e.target.value)} />
            </FieldGroup>
          </div>
        );
      case "benefits":
        return (
          <div className="space-y-3">
            <FieldGroup label="Section Heading">
              <Input className="h-8 text-xs" placeholder="Why Choose Us" value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            </FieldGroup>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Benefits</Label>
              {renderArrayEditor("items", [
                { name: "icon", placeholder: "Icon (emoji)" },
                { name: "title", placeholder: "Benefit title" },
                { name: "description", placeholder: "Description", type: "textarea" },
              ])}
            </div>
          </div>
        );
      case "reviews":
        return (
          <div className="space-y-3">
            <FieldGroup label="Section Heading">
              <Input className="h-8 text-xs" placeholder="Customer Reviews" value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            </FieldGroup>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Reviews</Label>
              {renderArrayEditor("items", [
                { name: "name", placeholder: "Customer name" },
                { name: "text", placeholder: "Review text", type: "textarea" },
                { name: "image_url", placeholder: "Customer image URL (optional)" },
              ])}
            </div>
          </div>
        );
      case "before_after":
        return (
          <div className="space-y-3">
            <FieldGroup label="Heading">
              <Input className="h-8 text-xs" placeholder="See the Difference" value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Before Image URL">
              <Input className="h-8 text-xs" placeholder="Before Image URL" value={content.before_image ?? ""} onChange={(e) => update("before_image", e.target.value)} />
            </FieldGroup>
            <FieldGroup label="After Image URL">
              <Input className="h-8 text-xs" placeholder="After Image URL" value={content.after_image ?? ""} onChange={(e) => update("after_image", e.target.value)} />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="Before Label">
                <Input className="h-8 text-xs" placeholder="Before" value={content.before_label ?? ""} onChange={(e) => update("before_label", e.target.value)} />
              </FieldGroup>
              <FieldGroup label="After Label">
                <Input className="h-8 text-xs" placeholder="After" value={content.after_label ?? ""} onChange={(e) => update("after_label", e.target.value)} />
              </FieldGroup>
            </div>
          </div>
        );
      case "faq":
        return (
          <div className="space-y-3">
            <FieldGroup label="Section Heading">
              <Input className="h-8 text-xs" placeholder="FAQ" value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            </FieldGroup>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Questions</Label>
              {renderArrayEditor("items", [
                { name: "question", placeholder: "Question" },
                { name: "answer", placeholder: "Answer", type: "textarea" },
              ])}
            </div>
          </div>
        );
      case "countdown":
        return (
          <div className="space-y-3">
            <FieldGroup label="Heading">
              <Input className="h-8 text-xs" placeholder="Limited Time Offer" value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Subtitle">
              <Input className="h-8 text-xs" placeholder="Subtitle" value={content.subtitle ?? ""} onChange={(e) => update("subtitle", e.target.value)} />
            </FieldGroup>
            <FieldGroup label="End Date & Time">
              <Input className="h-8 text-xs" type="datetime-local" value={content.end_date ?? ""} onChange={(e) => update("end_date", e.target.value)} />
            </FieldGroup>
          </div>
        );
      case "guarantee":
        return (
          <div className="space-y-3">
            <FieldGroup label="Icon (emoji)">
              <Input className="h-8 text-xs" placeholder="🛡️" value={content.icon ?? ""} onChange={(e) => update("icon", e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Heading">
              <Input className="h-8 text-xs" placeholder="Our Guarantee" value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            </FieldGroup>
            <FieldGroup label="Text">
              <Textarea className="text-xs" placeholder="Guarantee details…" value={content.text ?? ""} rows={3} onChange={(e) => update("text", e.target.value)} />
            </FieldGroup>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderFields()}
      {hasChanges && (
        <Button size="sm" className="w-full" onClick={() => onSave(content)}>
          <Save className="w-3 h-3 mr-1" /> Save Changes
        </Button>
      )}
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
