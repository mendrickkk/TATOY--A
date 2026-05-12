/**
 * Normalized product row for the shop UI. Raw API Platform / custom payloads
 * may use PascalCase or nested values — normalize in {@link normalizeUnknownToProduct}.
 */
export type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  /** Relative path, absolute URL, or API Platform IRI string */
  image?: string | null;
  category?: string;
  /** Single quantity field if the backend exposes it */
  stock?: number;
};

function readString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value.replace(',', '.'));
    if (Number.isFinite(n)) {
      return n;
    }
  }
  return undefined;
}

function pickName(o: Record<string, unknown>): string | undefined {
  return (
    readString(o.name) ||
    readString(o.Name) ||
    readString(o.title) ||
    readString(o.Title)
  );
}

function pickId(o: Record<string, unknown>): string | undefined {
  const idVal = o.id ?? o.Id ?? o.ID;
  if (typeof idVal === 'number' && Number.isFinite(idVal)) {
    return String(idVal);
  }
  if (typeof idVal === 'string' && idVal.trim()) {
    return idVal.trim();
  }
  const atId = o['@id'];
  if (typeof atId === 'string' && atId.trim()) {
    return atId.trim();
  }
  return undefined;
}

function pickImage(o: Record<string, unknown>): string | null | undefined {
  const direct =
    readString(o.image) ||
    readString(o.Image) ||
    readString(o.imageUrl) ||
    readString(o.imagePath) ||
    readString(o.photo) ||
    readString(o.Photo) ||
    readString(o.thumbnail) ||
    readString(o.Thumbnail) ||
    readString(o.picture) ||
    readString(o.filePath);
  if (direct !== undefined) {
    return direct;
  }

  const media = o.media ?? o.Media ?? o.file ?? o.File;
  if (media && typeof media === 'object' && !Array.isArray(media)) {
    const m = media as Record<string, unknown>;
    const fromMedia =
      readString(m.contentUrl) ||
      readString(m.url) ||
      readString(m.filePath) ||
      readString(m.path);
    if (fromMedia) {
      return fromMedia;
    }
  }

  const nested = o.image ?? o.Image;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const img = nested as Record<string, unknown>;
    const contentUrl = readString(img.contentUrl) || readString(img.url);
    if (contentUrl) {
      return contentUrl;
    }
  }
  return undefined;
}

function pickStock(o: Record<string, unknown>): number | undefined {
  return (
    readNumber(o.stock) ??
    readNumber(o.Stock) ??
    readNumber(o.stocks) ??
    readNumber(o.Stocks) ??
    readNumber(o.quantity) ??
    readNumber(o.Quantity)
  );
}

function pickCategory(o: Record<string, unknown>): string | undefined {
  const c = o.category ?? o.Category;
  if (typeof c === 'string') {
    return readString(c);
  }
  if (c && typeof c === 'object' && !Array.isArray(c)) {
    return readString((c as Record<string, unknown>).name);
  }
  return undefined;
}

/**
 * Maps one API collection item to {@link Product}. Returns null if there is no usable id+name.
 */
export function normalizeUnknownToProduct(raw: unknown): Product | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const id = pickId(o);
  const name = pickName(o);
  if (!id || !name) {
    return null;
  }
  const price = readNumber(o.price ?? o.Price) ?? 0;
  const description =
    readString(o.description) || readString(o.Description) || undefined;

  return {
    id,
    name,
    price,
    description,
    image: pickImage(o) ?? null,
    category: pickCategory(o),
    stock: pickStock(o),
  };
}
