import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { TransferWizard } from '../components/TransferWizard'

export function EditTransferPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { transferId } = useParams()
  const transfer = location.state?.transfer

  if (!transfer) {
    navigate('/products/stock/transfers')
    return null
  }

  // Transform transfer data to match TransferWizard format
  const initialTransferData = {
    source: transfer.source,
    destination: transfer.destination,
    transferType: transfer.status === 'Pending' ? 'scheduled' : 'immediate',
    scheduledDate: new Date(transfer.createdAt),
    selectedProducts: transfer.items.map((item: any) => ({
      product: {
        id: item.sku, // Using SKU as ID since we don't have real IDs in mock data
        name: item.name,
        sku: item.sku,
        category: item.category,
        description: item.description || '',
        image: `https://placehold.co/100x100.png`, // Placeholder image
        variants: [
          {
            id: `${item.sku}-1`,
            size: item.unit,
            color: 'Default',
            stock: item.quantity,
            price: item.unitPrice
          }
        ]
      },
      variant: {
        id: `${item.sku}-1`,
        size: item.unit,
        color: 'Default',
        stock: item.quantity,
        price: item.unitPrice
      },
      quantity: item.quantity,
    })),
    notes: transfer.notes || '',
    reason: transfer.reason || '',
  }

  return (
    <div className="p-6 w-full">
      <TransferWizard
        initialData={initialTransferData}
        onComplete={(transferData) => {
          // TODO: Handle transfer update
          console.log('Transfer updated:', transferData)
          navigate('/products/stock/transfers')
        }}
        onCancel={() => {
          navigate('/products/stock/transfers')
        }}
      />
    </div>
  )
}
