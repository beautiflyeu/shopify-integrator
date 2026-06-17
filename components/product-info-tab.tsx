"use client";

import { useState } from "react";
import { CheckCircle2, Package, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BeautiflyProduct } from "@/services/beautifly";
import type { NormalizedProduct } from "@/types/product";

interface Props {
  raw: BeautiflyProduct;
  normalized: NormalizedProduct;
}

function formatParamValue(value: unknown, unit?: string | null): string {
  let str: string;
  if (Array.isArray(value)) str = value.join(", ");
  else if (typeof value === "boolean") str = value ? "Tak" : "Nie";
  else str = String(value ?? "");
  return unit ? `${str} ${unit}` : str;
}

export function ProductInfoTab({ raw, normalized }: Props) {
  const [activeImg, setActiveImg] = useState(0);

  const dd = raw.description_data ?? {};
  const md = raw.main_details ?? {};
  const price = raw.price ?? {};
  const stock = raw.stock ?? {};
  const parameters = (raw.parameters ?? []) as Array<{
    name: string;
    value: unknown;
    unit?: string;
    type?: string;
  }>;

  const images = normalized.images;
  const mainImg = images[activeImg];
  const thumbs = images.filter((_, i) => i !== activeImg);

  return (
    <div className="space-y-8">
      {/* Header badges */}
      <div className="flex flex-wrap items-center gap-2">
        {normalized.vendor && (
          <Badge className="uppercase tracking-wide">{normalized.vendor}</Badge>
        )}
        {normalized.productType && (
          <Badge variant="outline">{normalized.productType}</Badge>
        )}
        {normalized.barcode && (
          <Badge variant="outline" className="font-mono text-xs">
            EAN: {normalized.barcode}
          </Badge>
        )}
        {stock.status && (
          <Badge
            variant={stock.status === "in_stock" ? "default" : "destructive"}
            className={
              stock.status === "in_stock"
                ? "bg-success text-success-foreground hover:bg-success/80"
                : ""
            }
          >
            {stock.status === "in_stock" ? "W magazynie" : "Brak"}
          </Badge>
        )}
        {normalized.weightGrams != null && (
          <Badge variant="outline">{normalized.weightGrams} g</Badge>
        )}
      </div>

      {/* Images + right column */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          {images.length > 0 ? (
            <>
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mainImg.url}
                  alt={mainImg.alt ?? normalized.name}
                  className="h-full w-full object-contain"
                />
              </div>
              {images.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`h-16 w-16 overflow-hidden rounded border-2 transition-colors ${
                        i === activeImg
                          ? "border-primary"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.alt ?? `Zdjęcie ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted">
              <Package className="h-20 w-20 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Price, stock, dimensions */}
        <div className="space-y-6">
          {/* Price */}
          {(price.pln || price.eur) && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Cena
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {price.pln && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">PLN netto</p>
                      <p className="text-lg font-medium">{price.pln.net} zł</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">PLN brutto</p>
                      <p className="text-2xl font-bold">{price.pln.gross} zł</p>
                    </div>
                  </>
                )}
                {price.eur && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">EUR netto</p>
                      <p className="text-base font-medium text-muted-foreground">
                        {price.eur.net} €
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">EUR brutto</p>
                      <p className="text-base font-medium text-muted-foreground">
                        {price.eur.gross} €
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Stock */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Dostępność
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {normalized.inventoryQty ?? 0}
              </span>
              <span className="text-sm text-muted-foreground">szt.</span>
            </div>
          </div>

          {/* Dimensions */}
          {(md.weight_gross || md.height) && (
            <>
              <Separator />
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Wymiary opakowania
                </p>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  {md.weight_gross != null && (
                    <>
                      <dt className="text-muted-foreground">Waga brutto</dt>
                      <dd>{md.weight_gross} kg</dd>
                    </>
                  )}
                  {md.weight_net != null && (
                    <>
                      <dt className="text-muted-foreground">Waga netto</dt>
                      <dd>{md.weight_net} kg</dd>
                    </>
                  )}
                  {md.height != null && (
                    <>
                      <dt className="text-muted-foreground">Wysokość</dt>
                      <dd>{md.height} cm</dd>
                    </>
                  )}
                  {md.width != null && (
                    <>
                      <dt className="text-muted-foreground">Szerokość</dt>
                      <dd>{md.width} cm</dd>
                    </>
                  )}
                  {md.length != null && (
                    <>
                      <dt className="text-muted-foreground">Długość</dt>
                      <dd>{md.length} cm</dd>
                    </>
                  )}
                </dl>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Description */}
      {dd.description && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Opis
          </p>
          <p className="text-sm leading-relaxed">{dd.description}</p>
        </div>
      )}

      {/* Short descriptions */}
      {dd.short_descriptions && (dd.short_descriptions as string[]).length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Krótkie opisy
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {(dd.short_descriptions as string[]).map((s, i) => (
              <li key={i} className="leading-relaxed">
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* USP */}
      {dd.usp && (dd.usp as string[]).length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Wyróżniki produktu
          </p>
          <ul className="space-y-2">
            {(dd.usp as string[]).map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Parameters */}
      {parameters.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Parametry techniczne
            </p>
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <tbody>
                  {parameters.map((p, i) => (
                    <tr
                      key={i}
                      className={
                        i % 2 === 0 ? "bg-muted/40" : "bg-background"
                      }
                    >
                      <td className="w-1/2 px-4 py-2.5 font-medium text-muted-foreground">
                        {p.name}
                      </td>
                      <td className="px-4 py-2.5">
                        {formatParamValue(p.value, p.unit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Tags */}
      {normalized.tags.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Tagi / Rodziny
            </p>
            <div className="flex flex-wrap gap-2">
              {normalized.tags.map((tag, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
