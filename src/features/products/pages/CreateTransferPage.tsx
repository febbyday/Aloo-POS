import { TransferWizard } from '../components/TransferWizard'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'

export function CreateTransferPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  return (
    <div className="w-full px-4 py-6 space-y-6">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold tracking-tight">Create Stock Transfer</h2>
        <p className="text-muted-foreground">
          Transfer stock between locations
        </p>
      </div>

      <TransferWizard 
        onComplete={(transferData) => {
          // TODO: Handle transfer creation
          console.log('Transfer created:', transferData)
          toast({
            title: "Transfer Created",
            description: "Stock transfer has been created successfully."
          })
          navigate('/products/transfers')
        }}
        onCancel={() => {
          navigate('/products/transfers')
        }}
      />
    </div>
  )
}
