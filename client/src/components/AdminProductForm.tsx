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
import { Loader2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Template,
  TemplateCategory,
  TemplateStatus,
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { uploadMedia, type UploadedFile } from "@/lib/api";

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
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const handleAddImageByUrl = () => {
    const url = window.prompt("Enter image URL");
    if (!url) {
      return;
    }

    const trimmed = url.trim();
    if (!trimmed) {
      return;
    }

    setImages((prev) => Array.from(new Set([...prev, trimmed])));
  };

  const handleOpenFilePicker = () => {
    if (isUploading) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (input: File[] | FileList) => {
    const filesArray = Array.from(input ?? []).filter((file) => file.size > 0);
    if (!filesArray.length) {
      return;
    }

    setIsUploading(true);
    try {
      const uploaded: UploadedFile[] = await uploadMedia(filesArray);

      if (!uploaded.length) {
        toast({
          title: "Upload failed",
          description: "No files were uploaded.",
          variant: "destructive",
        });
        return;
      }

      const imageFiles = uploaded.filter((file) => file.type === "image");
      const videoFiles = uploaded.filter((file) => file.type === "video");
      const newImages = imageFiles.map((file) => file.url);
      const newVideo = videoFiles[0];

      if (newImages.length) {
        setImages((prev) => Array.from(new Set([...prev, ...newImages])));
      }

      if (newVideo) {
        setVideoUrl(newVideo.url);
      }

      const acceptedCount = newImages.length + (newVideo ? 1 : 0);
      const skippedCount = uploaded.length - acceptedCount;

      if (acceptedCount > 0) {
        const summaryParts: string[] = [];
        if (newImages.length) {
          summaryParts.push(
            `${newImages.length} image${newImages.length === 1 ? "" : "s"}`,
          );
        }
        if (newVideo) {
          summaryParts.push("1 video");
        }

        const skippedText =
          skippedCount > 0
            ? ` Skipped ${skippedCount} unsupported file${
                skippedCount === 1 ? "" : "s"
              }.`
            : "";

        toast({
          title: "Upload complete",
          description: `Added ${summaryParts.join(" and ")}.${skippedText}`.trim(),
        });
      } else {
        toast({
          title: "Unsupported files",
          description:
            "Only image and video files can be uploaded for template previews.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length) {
      void handleFilesSelected(Array.from(files));
      event.dataTransfer.clearData();
    }
    setIsDragActive(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }
    setIsDragActive(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = () => {
    setVideoUrl("");
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
                <CardDescription>
                  Upload preview images or videos from your device, or add a
                  direct URL.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const { files } = event.target;
                    if (files && files.length) {
                      void handleFilesSelected(Array.from(files));
                    }
                    event.target.value = "";
                  }}
                />
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center hover-elevate cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isDragActive ? "border-primary bg-muted/40" : "border-muted-foreground/40"} ${isUploading ? "opacity-75 pointer-events-none" : ""}`}
                  onClick={handleOpenFilePicker}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleOpenFilePicker();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-disabled={isUploading}
                  aria-busy={isUploading}
                  data-testid="dropzone-images"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                      <p className="text-sm font-medium">Uploading…</p>
                      <p className="text-xs text-muted-foreground">
                        This may take a moment depending on file size.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Click or drag files to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Images (PNG, JPG, WebP) and videos (MP4, WebM) up to 25MB
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddImageByUrl}
                    disabled={isUploading}
                    data-testid="button-add-image-url"
                  >
                    Add image by URL
                  </Button>
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

                {videoUrl && (
                  <div className="relative group">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-48 rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveVideo}
                      disabled={isUploading}
                      data-testid="button-remove-video"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
              disabled={isSubmitting || isUploading}
            >
              {isEditMode ? "Save Changes" : "Publish Template"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
