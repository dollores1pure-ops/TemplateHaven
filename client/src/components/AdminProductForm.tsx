import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  Template,
  TemplateCategory,
  TemplateStatus,
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export interface TemplateFormValues {
  id?: string;
  slug?: string;
  title: string;
  category: TemplateCategory;
  price: number;
  description: string;
  videoUrl?: string;
  liveDemoUrl?: string;
  figmaUrl?: string;
  images: string[];
  tags: string[];
  features: string[];
  status: TemplateStatus;
}

interface AdminProductFormProps {
  initialTemplate?: Template | null;
  isSubmitting?: boolean;
  onSubmit?: (values: TemplateFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export default function AdminProductForm({
  initialTemplate = null,
  isSubmitting,
  onSubmit,
  onCancel,
}: AdminProductFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "">("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [status, setStatus] = useState<TemplateStatus>("published");
  const [tagsInput, setTagsInput] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (initialTemplate) {
      setTitle(initialTemplate.title);
      setCategory(initialTemplate.category);
      setPrice(initialTemplate.price.toString());
      setDescription(initialTemplate.description);
      setVideoUrl(initialTemplate.videoUrl ?? "");
      setLiveDemoUrl(initialTemplate.liveDemoUrl ?? "");
      setFigmaUrl(initialTemplate.figmaUrl ?? "");
      setStatus(initialTemplate.status);
      setImages(initialTemplate.galleryImages);
      setTagsInput(initialTemplate.tags.join(", "));
      setFeaturesInput(initialTemplate.features.join("\n"));
    } else {
      setTitle("");
      setCategory("");
      setPrice("");
      setDescription("");
      setVideoUrl("");
      setLiveDemoUrl("");
      setFigmaUrl("");
      setStatus("published");
      setImages([]);
      setTagsInput("");
      setFeaturesInput("");
    }
  }, [initialTemplate]);

  const isEditMode = useMemo(() => Boolean(initialTemplate), [initialTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !category || !price || Number.isNaN(Number(price))) {
      toast({
        title: "Missing information",
        description: "Please provide a title, category, and valid price.",
        variant: "destructive",
      });
      return;
    }

    if (!images.length) {
      toast({
        title: "Add at least one image",
        description: "Upload or add a URL for the template preview.",
        variant: "destructive",
      });
      return;
    }

    const parsedTags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const parsedFeatures = featuresInput
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

    const payload: TemplateFormValues = {
      id: initialTemplate?.id,
      slug: initialTemplate?.slug,
      title: title.trim(),
      category,
      price: Number(price),
      description: description.trim(),
      videoUrl: videoUrl.trim() || undefined,
      liveDemoUrl: liveDemoUrl.trim() || undefined,
      figmaUrl: figmaUrl.trim() || undefined,
      images,
      tags: parsedTags,
      features: parsedFeatures,
      status,
    };

    await onSubmit?.(payload);
  };

  const handleImageUpload = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      setImages([...images, url.trim()]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1
            className="text-4xl font-display font-bold mb-2"
            data-testid="text-form-title"
          >
            {isEditMode ? "Edit Template" : "Add New Template"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update the template details"
              : "Fill in the details for your new template"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the template details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Template Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Modern E-Commerce Template"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={category}
                    onValueChange={(value) =>
                      setCategory(value as TemplateCategory)
                    }
                  >
                    <SelectTrigger id="category" data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">E-Commerce</SelectItem>
                      <SelectItem value="portfolio">Portfolio</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="79"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    data-testid="input-price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as TemplateStatus)
                    }
                  >
                    <SelectTrigger id="status" data-testid="select-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your template..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    data-testid="textarea-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video">Video Preview URL</Label>
                  <Input
                    id="video"
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    data-testid="input-video-url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="live-demo">Live Demo URL</Label>
                  <Input
                    id="live-demo"
                    type="url"
                    placeholder="https://templatehub.com/demo/..."
                    value={liveDemoUrl}
                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                    data-testid="input-live-demo-url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="figma-url">Figma File URL</Label>
                  <Input
                    id="figma-url"
                    type="url"
                    placeholder="https://figma.com/file/..."
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    data-testid="input-figma-url"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Media Upload</CardTitle>
                <CardDescription>Add images and previews</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate cursor-pointer"
                  onClick={handleImageUpload}
                  data-testid="dropzone-images"
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">
                    Click to upload images
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 10MB
                  </p>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>Add tags and feature highlights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="commerce, responsive, dark mode"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  data-testid="input-tags"
                />
                <p className="text-xs text-muted-foreground">
                  Separate tags with commas to improve template discoverability.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Key Features</Label>
                <Textarea
                  id="features"
                  placeholder={`Responsive layout
Checkout flow
Dark mode ready`}
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  rows={4}
                  data-testid="textarea-features"
                />
                <p className="text-xs text-muted-foreground">
                  Enter one feature per line. These appear on the product detail
                  page.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              data-testid="button-cancel"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="button-publish"
              disabled={isSubmitting}
            >
              {isEditMode ? "Save Changes" : "Publish Template"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
