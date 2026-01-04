'use client'

import { useDashboardLayout } from '@/contexts/dashboard-layout-context'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Settings2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  GripVertical,
} from 'lucide-react'

export function LayoutEditor() {
  const {
    sections,
    toggleSection,
    moveSection,
    resetToDefault,
    isEditing,
    setIsEditing,
  } = useDashboardLayout()

  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  return (
    <Sheet open={isEditing} onOpenChange={setIsEditing}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-xl border-border/60 bg-muted/30 hover:bg-muted/50"
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Editar Layout</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Personalizar Dashboard
          </SheetTitle>
          <SheetDescription>
            Escolha quais secoes mostrar e reorganize a ordem como preferir.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          {sortedSections.map((section, index) => (
            <div
              key={section.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={`section-${section.id}`}
                  className="font-medium cursor-pointer"
                >
                  {section.name}
                </Label>
                <p className="text-xs text-muted-foreground truncate">
                  {section.description}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveSection(section.id, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => moveSection(section.id, 'down')}
                  disabled={index === sortedSections.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <Switch
                id={`section-${section.id}`}
                checked={section.visible}
                onCheckedChange={() => toggleSection(section.id)}
              />
            </div>
          ))}
        </div>

        <SheetFooter className="flex-row gap-2 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefault}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar padrao
          </Button>
          <Button size="sm" onClick={() => setIsEditing(false)}>
            Concluir
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
