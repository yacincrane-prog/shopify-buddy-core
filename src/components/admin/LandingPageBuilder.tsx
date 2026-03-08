import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  TEMPLATES,
  LP_SECTION_TYPES,
  type LandingPage,
  type LPSection,
  type LPSectionType,
} from "@/lib/landing-pages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
} from "lucide-react";
import { toast } from "sonner";

type View = "list" | "create" | "edit";

export function LandingPageBuilder() {
  const queryClient = useQueryClient();
  const { data: products } = useProducts();
  const [view, setView] = useState<View>("list");
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
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
      const slug = product.slug;
      const page = await createLandingPage({
        product_id: newProductId,
        title: newTitle || product.title,
        slug,
        template: newTemplate,
      });
      if (!page) throw new Error("Failed to create");
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
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
            <div className="space-y-2">
              <Label>Template</Label>
              <div className="grid gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNewTemplate(t.id)}
                    className={`text-left p-3 rounded-lg border-2 transition-colors ${
                      newTemplate === t.id ? "border-accent bg-accent/5" : "border-border"
                    }`}
                  >
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.sections.length} sections: {t.sections.map((s) => LP_SECTION_TYPES.find((st) => st.value === s)?.label).join(", ")}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => createMutation.mutate()} disabled={!newProductId || createMutation.isPending}>
              <Rocket className="w-4 h-4 mr-1" /> Create Landing Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "edit" && editingPage) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setView("list"); setEditingPage(null); }}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h2 className="font-semibold">{editingPage.title}</h2>
          <Badge variant="secondary" className="text-xs">/offer/{editingPage.slug}</Badge>
        </div>
        <SectionEditor pageId={editingPage.id} />
      </div>
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
                      ? <Badge className="bg-success text-success-foreground text-xs">Live</Badge>
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

// ── Section Editor (reorder, add, remove, edit content) ──

function SectionEditor({ pageId }: { pageId: string }) {
  const queryClient = useQueryClient();
  const [addingType, setAddingType] = useState<LPSectionType | "">("");

  const { data: sections, isLoading } = useQuery({
    queryKey: ["lp-sections-admin", pageId],
    queryFn: () => fetchLPSections(pageId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["lp-sections-admin", pageId] });

  const addMutation = useMutation({
    mutationFn: (type: LPSectionType) => createLPSection(pageId, type, sections?.length ?? 0),
    onSuccess: () => { invalidate(); toast.success("Section added"); setAddingType(""); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<LPSection, "content" | "is_visible">> }) =>
      updateLPSection(id, updates),
    onSuccess: () => { invalidate(); toast.success("Saved"); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLPSection,
    onSuccess: () => { invalidate(); toast.success("Removed"); },
  });

  const moveMutation = useMutation({
    mutationFn: reorderLPSections,
    onSuccess: invalidate,
  });

  const moveSection = (index: number, dir: "up" | "down") => {
    if (!sections) return;
    const arr = [...sections];
    const swap = dir === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= arr.length) return;
    [arr[index], arr[swap]] = [arr[swap], arr[index]];
    moveMutation.mutate(arr.map((s, i) => ({ id: s.id, position: i })));
  };

  const sectionLabel = (type: string) => LP_SECTION_TYPES.find((t) => t.value === type)?.label ?? type;

  if (isLoading) return <p className="text-sm text-muted-foreground py-4">Loading sections…</p>;

  return (
    <div className="space-y-3">
      {sections?.map((section, index) => (
        <Card key={section.id} className={`border transition-colors ${!section.is_visible ? "opacity-50" : ""}`}>
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2 mb-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs">{sectionLabel(section.section_type)}</Badge>
              <div className="ml-auto flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveSection(index, "up")} disabled={index === 0}>
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveSection(index, "down")} disabled={index === (sections?.length ?? 0) - 1}>
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateMutation.mutate({ id: section.id, updates: { is_visible: !section.is_visible } })}>
                  {section.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(section.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <LPSectionContentEditor
              section={section}
              onSave={(content) => updateMutation.mutate({ id: section.id, updates: { content } })}
            />
          </CardContent>
        </Card>
      ))}

      <Card className="border-dashed border-2 border-accent/30">
        <CardContent className="py-4 px-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label className="text-xs">Add Section</Label>
              <Select value={addingType} onValueChange={(v) => setAddingType(v as LPSectionType)}>
                <SelectTrigger><SelectValue placeholder="Choose section type…" /></SelectTrigger>
                <SelectContent>
                  {LP_SECTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => addingType && addMutation.mutate(addingType as LPSectionType)} disabled={!addingType}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Content editor per section type ──

function LPSectionContentEditor({ section, onSave }: { section: LPSection; onSave: (c: Record<string, any>) => void }) {
  const [content, setContent] = useState(section.content);
  const hasChanges = JSON.stringify(content) !== JSON.stringify(section.content);
  const update = (key: string, value: any) => setContent({ ...content, [key]: value });

  const renderArrayEditor = (key: string, fields: { name: string; placeholder: string; type?: string }[]) => (
    <div className="space-y-2">
      {(content[key] ?? []).map((item: any, i: number) => (
        <div key={i} className="border border-border rounded-md p-2 space-y-1">
          {fields.map((f) => (
            <div key={f.name}>
              {f.type === "textarea" ? (
                <Textarea
                  placeholder={f.placeholder}
                  value={item[f.name] ?? ""}
                  rows={2}
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
                  onChange={(e) => {
                    const items = [...(content[key] ?? [])];
                    items[i] = { ...items[i], [f.name]: e.target.value };
                    update(key, items);
                  }}
                />
              )}
            </div>
          ))}
          <Button size="sm" variant="ghost" className="h-6 text-xs text-destructive" onClick={() => {
            update(key, (content[key] ?? []).filter((_: any, j: number) => j !== i));
          }}>
            <Trash2 className="w-3 h-3 mr-1" /> Remove
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => {
        const empty: any = {};
        fields.forEach((f) => (empty[f.name] = ""));
        update(key, [...(content[key] ?? []), empty]);
      }}>
        <Plus className="w-3 h-3 mr-1" /> Add
      </Button>
    </div>
  );

  const renderFields = () => {
    switch (section.section_type) {
      case "hero":
        return (
          <div className="space-y-2">
            <Input placeholder="Headline" value={content.headline ?? ""} onChange={(e) => update("headline", e.target.value)} />
            <Input placeholder="Subtitle" value={content.subtitle ?? ""} onChange={(e) => update("subtitle", e.target.value)} />
            <Input placeholder="Image URL" value={content.image_url ?? ""} onChange={(e) => update("image_url", e.target.value)} />
            <Input placeholder="CTA Button Text" value={content.cta_text ?? ""} onChange={(e) => update("cta_text", e.target.value)} />
          </div>
        );
      case "gallery":
      case "order_form":
        return <p className="text-xs text-muted-foreground">Uses product data automatically.</p>;
      case "video":
        return (
          <div className="space-y-2">
            <Input placeholder="Video Title" value={content.title ?? ""} onChange={(e) => update("title", e.target.value)} />
            <Input placeholder="Video URL (YouTube/Vimeo embed)" value={content.video_url ?? ""} onChange={(e) => update("video_url", e.target.value)} />
          </div>
        );
      case "benefits":
        return (
          <div className="space-y-2">
            <Input placeholder="Section Heading" value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            {renderArrayEditor("items", [
              { name: "icon", placeholder: "Icon (emoji)" },
              { name: "title", placeholder: "Benefit title" },
              { name: "description", placeholder: "Description", type: "textarea" },
            ])}
          </div>
        );
      case "reviews":
        return (
          <div className="space-y-2">
            <Input placeholder="Section Heading" value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            {renderArrayEditor("items", [
              { name: "name", placeholder: "Customer name" },
              { name: "text", placeholder: "Review text", type: "textarea" },
              { name: "image_url", placeholder: "Customer image URL (optional)" },
            ])}
          </div>
        );
      case "before_after":
        return (
          <div className="space-y-2">
            <Input placeholder="Heading" value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            <Input placeholder="Before Image URL" value={content.before_image ?? ""} onChange={(e) => update("before_image", e.target.value)} />
            <Input placeholder="After Image URL" value={content.after_image ?? ""} onChange={(e) => update("after_image", e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Before Label" value={content.before_label ?? ""} onChange={(e) => update("before_label", e.target.value)} />
              <Input placeholder="After Label" value={content.after_label ?? ""} onChange={(e) => update("after_label", e.target.value)} />
            </div>
          </div>
        );
      case "faq":
        return (
          <div className="space-y-2">
            <Input placeholder="Section Heading" value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            {renderArrayEditor("items", [
              { name: "question", placeholder: "Question" },
              { name: "answer", placeholder: "Answer", type: "textarea" },
            ])}
          </div>
        );
      case "countdown":
        return (
          <div className="space-y-2">
            <Input placeholder="Heading" value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            <Input placeholder="Subtitle" value={content.subtitle ?? ""} onChange={(e) => update("subtitle", e.target.value)} />
            <div className="space-y-1">
              <Label className="text-xs">End Date & Time</Label>
              <Input type="datetime-local" value={content.end_date ?? ""} onChange={(e) => update("end_date", e.target.value)} />
            </div>
          </div>
        );
      case "guarantee":
        return (
          <div className="space-y-2">
            <Input placeholder="Icon (emoji)" value={content.icon ?? ""} onChange={(e) => update("icon", e.target.value)} />
            <Input placeholder="Heading" value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            <Textarea placeholder="Guarantee text" value={content.text ?? ""} rows={3} onChange={(e) => update("text", e.target.value)} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="content" className="border-0">
        <AccordionTrigger className="py-1 text-xs text-muted-foreground hover:no-underline">
          Edit Content
        </AccordionTrigger>
        <AccordionContent className="pt-2 space-y-3">
          {renderFields()}
          {hasChanges && (
            <Button size="sm" onClick={() => onSave(content)}>
              <Save className="w-3 h-3 mr-1" /> Save
            </Button>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
