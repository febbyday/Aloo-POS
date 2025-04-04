// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface TemporaryProductAlertProps {
  onComplete: () => void;
  className?: string;
}

export function TemporaryProductAlert({ onComplete, className = '' }: TemporaryProductAlertProps) {
  return (
    <Alert className={`mb-4 border-yellow-300 bg-yellow-50 ${className}`}>
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Temporary Product</AlertTitle>
      <AlertDescription className="text-yellow-700">
        This is a temporary product with minimal information. Complete the product details to make it fully functional.
      </AlertDescription>
      <Button 
        variant="outline" 
        className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-900" 
        onClick={onComplete}
      >
        <Clock className="h-4 w-4 mr-2" />
        Complete Product Details
      </Button>
    </Alert>
  );
}
