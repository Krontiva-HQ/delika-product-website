import { BranchPage } from "@/components/branch-page"

interface PageProps {
  params: {
    id: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function Page({ params }: PageProps) {
  return <BranchPage params={params} />
} 