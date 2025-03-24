import { useState } from "react"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Button } from "@/components/ui/button"
import { BulkBarcodeGenerator } from "../components/labels/BulkBarcodeGenerator"
import { TemplateDesigner } from "../components/labels/TemplateDesigner"
import { TemplateLibrary } from "../components/labels/TemplateLibrary"
import { PrintQueue } from "../components/labels/PrintQueue"
import { 
  Barcode, 
  LayoutTemplate, 
  Library, 
  Printer 
} from "lucide-react"

export function PrintLabelsPage() {
  const [activeTab, setActiveTab] = useState("generate")

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full">
        <div className="w-full px-4 py-2 flex items-center gap-2 bg-zinc-900/95 border-b border-border/40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("generate")}
            className={activeTab === "generate" ? "bg-white/10" : ""}
          >
            <Barcode className="h-4 w-4 mr-2" />
            Generate Barcodes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("templates")}
            className={activeTab === "templates" ? "bg-white/10" : ""}
          >
            <LayoutTemplate className="h-4 w-4 mr-2" />
            Label Templates
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("library")}
            className={activeTab === "library" ? "bg-white/10" : ""}
          >
            <Library className="h-4 w-4 mr-2" />
            Template Library
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("queue")}
            className={activeTab === "queue" ? "bg-white/10" : ""}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Queue
          </Button>
        </div>

        <div className="flex-1">
          {activeTab === "generate" && <BulkBarcodeGenerator />}
          {activeTab === "templates" && <TemplateDesigner />}
          {activeTab === "library" && <TemplateLibrary />}
          {activeTab === "queue" && <PrintQueue />}
        </div>
      </div>
    </DndProvider>
  )
}
