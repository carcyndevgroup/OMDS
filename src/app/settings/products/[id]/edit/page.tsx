import { ProductEdit } from "@/features/settings/product";

type EditProductPageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage(props: EditProductPageProps) {
  const params = await props.params;
  return <ProductEdit id={params.id} />;
}
