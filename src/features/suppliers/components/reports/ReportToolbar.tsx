import { 
  Download, 
  FileText, 
  Printer, 
  Share2 
} from "lucide-react"
import { IconToolbar } from "@/components/ui/toolbar"

interface ReportToolbarProps {
  onDownload?: () => void
  onPrint?: () => void
  onShare?: () => void
  onViewDetails?: () => void
}

export function ReportToolbar({
  onDownload,
  onPrint,
  onShare,
  onViewDetails
}: ReportToolbarProps) {
  const buttons = [
    ...(onViewDetails ? [{
      icon: FileText,
      onClick: onViewDetails,
      title: "View Details"
    }] : []),
    ...(onPrint ? [{
      icon: Printer,
      onClick: onPrint,
      title: "Print"
    }] : []),
    ...(onShare ? [{
      icon: Share2,
      onClick: onShare,
      title: "Share"
    }] : []),
    ...(onDownload ? [{
      icon: Download,
      onClick: onDownload,
      title: "Download"
    }] : [])
  ];

  return (
    <IconToolbar 
      buttons={buttons}
      variant="transparent"
      size="sm"
      className="justify-end p-2"
    />
  );
}
