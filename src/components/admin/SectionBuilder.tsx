import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProducts } from "@/hooks/useProducts";
import {
  fetchAllSectionsForProduct,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  SECTION_TYPES,
  type ProductSection,
  type SectionType,
} from "@/lib/product-sections";
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
  Layers,
  Save,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";

export function SectionBuilder() {
  const queryClient = useQueryClient();
  const { data: products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [addingType, setAddingType] = useState<SectionType | "">("");

  const { data: sections, isLoading } = useQuery({
    queryKey: ["product-sections-admin", selectedProductId],
    queryFn: () => fetchAllSectionsForProduct(selectedProductId),
    enabled: !!selectedProductId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["product-sections-admin", selectedProductId] });

  const addMutation = useMutation({
    mutationFn: (type: SectionType) =>
      createSection(selectedProductId, type, (sections?.length ?? 0)),
    onSuccess: () => { invalidate(); toast.success("Section added"); setAddingType(""); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<ProductSection, "content" | "is_visible">> }) =>
      updateSection(id, updates),
    onSuccess: () => { invalidate(); toast.success("Section updated"); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => { invalidate(); toast.success("Section removed"); },
  });

  const moveMutation = useMutation({
    mutationFn: reorderSections,
    onSuccess: invalidate,
  });

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!sections) return;
    const newSections = [...sections];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;
    [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];
    const reordered = newSections.map((s, i) => ({ id: s.id, position: i }));
    moveMutation.mutate(reordered);
  };

  const sectionLabel = (type: string) =>
    SECTION_TYPES.find((t) => t.value === type)?.label ?? type;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Layers className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Page Builder</h2>
      </div>

      <div className="space-y-2">
        <Label>Select Product</Label>
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a product…" />
          </SelectTrigger>
          <SelectContent>
            {products?.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProductId && (
        <>
          {isLoading ? (
            <p className="text-muted-foreground text-sm py-4">Loading sections…</p>
          ) : (
            <div className="space-y-2">
              {!sections?.length && (
                <p className="text-sm text-muted-foreground py-4">
                  No custom sections yet. The default product layout will be used. Add sections below to customize.
                </p>
              )}

              {sections?.map((section, index) => (
                <Card key={section.id} className={`border transition-colors ${!section.is_visible ? "opacity-50" : ""}`}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-2 mb-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs">{sectionLabel(section.section_type)}</Badge>
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
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

                    <SectionContentEditor
                      section={section}
                      onSave={(content) => updateMutation.mutate({ id: section.id, updates: { content } })}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="border-dashed border-2 border-accent/30">
            <CardContent className="py-4 px-4">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs">Add Section</Label>
                  <Select value={addingType} onValueChange={(v) => setAddingType(v as SectionType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose section type…" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => addingType && addMutation.mutate(addingType as SectionType)}
                  disabled={!addingType || addMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function SectionContentEditor({
  section,
  onSave,
}: {
  section: ProductSection;
  onSave: (content: Record<string, any>) => void;
}) {
  const [content, setContent] = useState(section.content);
  const hasChanges = JSON.stringify(content) !== JSON.stringify(section.content);

  const update = (key: string, value: any) => setContent({ ...content, [key]: value });

  const renderFields = () => {
    switch (section.section_type) {
      case "gallery":
      case "bundle_offers":
      case "upsell":
      case "quantity_pricing":
      case "order_button":
        return <p className="text-xs text-muted-foreground">This section uses product data automatically. No extra configuration needed.</p>;

      case "description":
        return (
          <div className="space-y-2">
            <Label className="text-xs">Custom Text (leave empty to use product description)</Label>
            <Textarea
              value={content.custom_text ?? ""}
              onChange={(e) => update("custom_text", e.target.value)}
              rows={3}
              placeholder="Enter custom description or leave empty…"
            />
          </div>
        );

      case "reviews":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Section Heading</Label>
              <Input value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Reviews</Label>
              {(content.items ?? []).map((item: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input
                    placeholder="Name"
                    value={item.name ?? ""}
                    onChange={(e) => {
                      const items = [...(content.items ?? [])];
                      items[i] = { ...items[i], name: e.target.value };
                      update("items", items);
                    }}
                  />
                  <Input
                    placeholder="Review text"
                    value={item.text ?? ""}
                    onChange={(e) => {
                      const items = [...(content.items ?? [])];
                      items[i] = { ...items[i], text: e.target.value };
                      update("items", items);
                    }}
                  />
                  <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => {
                    const items = (content.items ?? []).filter((_: any, j: number) => j !== i);
                    update("items", items);
                  }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => update("items", [...(content.items ?? []), { name: "", text: "", rating: 5 }])}>
                <Plus className="w-3 h-3 mr-1" /> Add Review
              </Button>
            </div>
          </div>
        );

      case "faq":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Section Heading</Label>
              <Input value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">FAQ Items</Label>
              {(content.items ?? []).map((item: any, i: number) => (
                <div key={i} className="space-y-1 border border-border rounded-md p-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Question"
                      value={item.question ?? ""}
                      onChange={(e) => {
                        const items = [...(content.items ?? [])];
                        items[i] = { ...items[i], question: e.target.value };
                        update("items", items);
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => {
                      const items = (content.items ?? []).filter((_: any, j: number) => j !== i);
                      update("items", items);
                    }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Answer"
                    value={item.answer ?? ""}
                    rows={2}
                    onChange={(e) => {
                      const items = [...(content.items ?? [])];
                      items[i] = { ...items[i], answer: e.target.value };
                      update("items", items);
                    }}
                  />
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => update("items", [...(content.items ?? []), { question: "", answer: "" }])}>
                <Plus className="w-3 h-3 mr-1" /> Add FAQ
              </Button>
            </div>
          </div>
        );

      case "image_text":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Heading</Label>
              <Input value={content.heading ?? ""} onChange={(e) => update("heading", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Image URL</Label>
              <Input value={content.image_url ?? ""} onChange={(e) => update("image_url", e.target.value)} placeholder="https://…" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Text Content</Label>
              <Textarea value={content.text ?? ""} onChange={(e) => update("text", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Layout</Label>
              <Select value={content.layout ?? "left"} onValueChange={(v) => update("layout", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Image Left</SelectItem>
                  <SelectItem value="right">Image Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "video":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Video Title</Label>
              <Input value={content.title ?? ""} onChange={(e) => update("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Video URL (YouTube/Vimeo embed URL)</Label>
              <Input value={content.video_url ?? ""} onChange={(e) => update("video_url", e.target.value)} placeholder="https://www.youtube.com/embed/…" />
            </div>
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
              <Save className="w-3 h-3 mr-1" /> Save Changes
            </Button>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
