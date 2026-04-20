import { MobileHeader } from "@/components/mobile-header"
import { ReportForm } from "@/components/forms/report-form"

export default function NewReportPage() {
  return (
    <div className="pb-8">
      <MobileHeader title="Denuncia" backHref="/account" />
      <ReportForm />
    </div>
  )
}
