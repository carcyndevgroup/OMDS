import { ProductEdit } from "@/features/settings/product";

type EditProductPageProps = { params: { id: string } };

export default function EditProductPage({ params }: EditProductPageProps) {
  return <ProductEdit id={params.id} />;
}
