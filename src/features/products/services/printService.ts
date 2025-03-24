import { toPng } from 'html-to-image'

export interface PrintJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
  progress: number
  createdAt: Date
  completedAt?: Date
  type: 'barcode' | 'template'
  data: any
}

class PrintService {
  private jobs: PrintJob[] = []
  private listeners: ((jobs: PrintJob[]) => void)[] = []

  addListener(listener: (jobs: PrintJob[]) => void) {
    this.listeners.push(listener)
  }

  removeListener(listener: (jobs: PrintJob[]) => void) {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.jobs))
  }

  addJob(job: PrintJob) {
    this.jobs.push(job)
    this.notifyListeners()
  }

  updateJob(id: string, updates: Partial<PrintJob>) {
    this.jobs = this.jobs.map(job =>
      job.id === id ? { ...job, ...updates } : job
    )
    this.notifyListeners()
  }

  removeJob(id: string) {
    this.jobs = this.jobs.filter(job => job.id !== id)
    this.notifyListeners()
  }

  getJobs() {
    return this.jobs
  }

  getJob(id: string) {
    return this.jobs.find(job => job.id === id)
  }

  async printBarcodes(elements: HTMLElement[]) {
    const jobId = Date.now().toString()
    
    this.addJob({
      id: jobId,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      type: 'barcode',
      data: { count: elements.length }
    })

    try {
      this.updateJob(jobId, { status: 'processing' })

      // Convert elements to images
      const images: string[] = []
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        const dataUrl = await toPng(element)
        images.push(dataUrl)
        
        this.updateJob(jobId, { 
          progress: ((i + 1) / elements.length) * 100 
        })
      }

      // Create a print document
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Failed to open print window')
      }

      printWindow.document.write(`
        <html>
          <head>
            <style>
              body { margin: 0; padding: 16px; }
              .barcode-container { 
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 16px;
                page-break-inside: avoid;
              }
              .barcode-item {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 8px;
              }
              @media print {
                @page { margin: 0; }
                body { margin: 16px; }
              }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              ${images.map(img => `
                <div class="barcode-item">
                  <img src="${img}" style="max-width: 100%; height: auto;" />
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `)

      printWindow.document.close()
      printWindow.print()
      printWindow.close()

      this.updateJob(jobId, { 
        status: 'completed',
        progress: 100,
        completedAt: new Date()
      })
    } catch (error) {
      this.updateJob(jobId, { 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Print failed'
      })
    }
  }

  async printTemplate(templateElement: HTMLElement) {
    const jobId = Date.now().toString()
    
    this.addJob({
      id: jobId,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      type: 'template',
      data: { templateId: templateElement.id }
    })

    try {
      this.updateJob(jobId, { status: 'processing' })

      const dataUrl = await toPng(templateElement)
      
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Failed to open print window')
      }

      printWindow.document.write(`
        <html>
          <head>
            <style>
              body { margin: 0; padding: 16px; }
              .template-container {
                display: flex;
                justify-content: center;
                align-items: center;
              }
              @media print {
                @page { margin: 0; }
                body { margin: 16px; }
              }
            </style>
          </head>
          <body>
            <div class="template-container">
              <img src="${dataUrl}" style="max-width: 100%; height: auto;" />
            </div>
          </body>
        </html>
      `)

      printWindow.document.close()
      printWindow.print()
      printWindow.close()

      this.updateJob(jobId, { 
        status: 'completed',
        progress: 100,
        completedAt: new Date()
      })
    } catch (error) {
      this.updateJob(jobId, { 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Print failed'
      })
    }
  }
}

// Create and export a singleton instance of PrintService
// This instance will be used throughout the application
export const printService = new PrintService()
