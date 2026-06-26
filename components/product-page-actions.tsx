"use client";

import { ExportCsvButton } from "@/components/export-csv-button";

interface Props {
  productId: string;
  fieldKeys?: string[];
}

export function ProductPageActions({ productId, fieldKeys }: Props) {
  return (
    <ExportCsvButton
      getProductIds={() => [productId]}
      fieldKeys={fieldKeys}
      label="Eksportuj CSV"
    />
  );
}
