import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CategoryFormData } from '../types/category'
import { useCategories } from '../context/CategoryContext'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  parentId: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  inheritParentAttributes: z.boolean().optional(),
  seo: z.object({
    metaTitle: z.string().max(100, 'Meta title must be at most 100 characters').optional(),
    metaDescription: z.string().max(200, 'Meta description must be at most 200 characters').optional(),
    keywords: z.string().max(200, 'Keywords must be at most 200 characters').optional(),
  }).optional(),
})

interface CategoryFormProps {
  id?: string
  initialData?: CategoryFormData
  onSubmit: (data: CategoryFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function CategoryForm({ id, initialData, onSubmit, onCancel, isSubmitting = false }: CategoryFormProps) {
  const { categories } = useCategories()
  const [activeTab, setActiveTab] = useState('basic')
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!initialData?.slug)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      status: 'active',
      inheritParentAttributes: true,
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: '',
      },
    },
  })

  // Watch the name field to auto-generate slug
  const nameValue = form.watch('name')

  // Auto-generate slug when name changes if auto-generate is enabled
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
  }

  // Update slug when name changes if auto-generate is enabled
  if (autoGenerateSlug && nameValue) {
    const generatedSlug = generateSlug(nameValue)
    form.setValue('slug', generatedSlug)
  }

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details for this category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Category name" />
                        </FormControl>
                        <FormDescription>
                          The name of the category as it will appear to customers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Active categories are visible to customers
                        </FormDescription>
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Category description"
                          className="min-h-[120px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description of this category
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None (Root Category)</SelectItem>
                          {categories
                            .filter(category => category.id !== initialData?.id) // Prevent selecting self as parent
                            .map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a parent category to create a hierarchy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Configure advanced options for this category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium">Auto-generate Slug</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate a URL-friendly slug from the category name
                    </p>
                  </div>
                  <Switch
                    checked={autoGenerateSlug}
                    onCheckedChange={setAutoGenerateSlug}
                  />
                </div>

                <Separator className="my-4" />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="category-slug"
                          disabled={autoGenerateSlug}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        The URL-friendly version of the name (auto-generated if enabled above)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="my-4" />

                <FormField
                  control={form.control}
                  name="inheritParentAttributes"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Inherit Parent Attributes</FormLabel>
                        <FormDescription>
                          Products in this category will inherit attributes from parent categories
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Optimize this category for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="seo.metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="SEO title"
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        The title that appears in search engine results (defaults to category name if empty)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seo.metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="SEO description"
                          className="min-h-[80px]"
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description that appears in search engine results
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seo.keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="keyword1, keyword2, keyword3"
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated keywords related to this category
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update' : 'Create'} Category
          </Button>
        </div>
      </form>
    </Form>
  )
}