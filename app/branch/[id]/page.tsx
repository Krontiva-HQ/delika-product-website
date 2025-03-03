import { BranchPage } from "@/components/branch-page"

interface Props {
  params: {
    id: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ params }: Props) {
  return <BranchPage params={params} />
} 