'use client';

import { useState } from 'react';
import { saveProductAction } from './actions';

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price_mode: 'quote' | 'fixed';
  price_ghs: number | null;
  availability: 'in_stock' | 'made_to_order' | 'unavailable';
  stock_quantity: number;
  category_id: string | null;
  personalisation_options: string[] | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
};

const options = [
  'Photograph',
  'Name or initials',
  'Personal message',
  'Logo or business branding',
  'Custom artwork',
];

export default function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [priceMode, setPriceMode] = useState(product?.price_mode ?? 'quote');
  const [fileNames, setFileNames] = useState('');

  return (
    <form action={saveProductAction} className="admin-product-form">
      {product && <input type="hidden" name="id" value={product.id} />}

      <label>
        Product or sample name
        <input
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (!product) {
              setSlug(event.target.value.toLowerCase().trim()
                .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
            }
          }}
          required minLength={2} maxLength={120}
        />
      </label>

      <label>
        Page address
        <input name="slug" value={slug} onChange={(event) => setSlug(event.target.value)}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required maxLength={140} />
      </label>

      <label>
        Short description
        <input name="short_description" defaultValue={product?.short_description ?? ''}
          maxLength={240} />
      </label>

      <label>
        Full description
        <textarea name="description" defaultValue={product?.description ?? ''}
          rows={5} maxLength={5000} />
      </label>

      <div className="admin-form-row">
        <label>
          Pricing
          <select name="price_mode" value={priceMode}
            onChange={(event) => setPriceMode(event.target.value as 'quote' | 'fixed')}>
            <option value="quote">Request a quotation</option>
            <option value="fixed">Show a fixed price</option>
          </select>
        </label>
        {priceMode === 'fixed' && (
          <label>
            Price (GH₵)
            <input name="price_ghs" type="number" min="0.01" step="0.01"
              defaultValue={product?.price_ghs ?? ''} required />
          </label>
        )}
      </div>

      <div className="admin-form-row">
        <label>
          Availability
          <select name="availability" defaultValue={product?.availability ?? 'made_to_order'}>
            <option value="in_stock">In stock</option>
            <option value="made_to_order">Made to order</option>
            <option value="unavailable">Currently unavailable</option>
          </select>
        </label>
        <label>
          Quantity (for stock tracking)
          <input name="stock_quantity" type="number" min="0" max="100000"
            defaultValue={product?.stock_quantity ?? 0} required />
        </label>
      </div>

      <label>
        Category
        <select name="category_id" defaultValue={product?.category_id ?? ''}>
          <option value="">Choose a category</option>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>{category.name}</option>
          ))}
        </select>
      </label>

      <label>
        Display order
        <input name="sort_order" type="number" min="0" max="10000"
          defaultValue={product?.sort_order ?? 0} />
      </label>

      <fieldset className="admin-option-fieldset">
        <legend>Personalisation options shown for this item</legend>
        <div className="admin-checks">
          {options.map((option) => (
            <label key={option}>
              <input type="checkbox" name="personalisation_options" value={option}
                defaultChecked={product?.personalisation_options?.includes(option) ?? false} />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="admin-file-label">
        Product and sample photographs
        <input name="images" type="file"
          accept="image/jpeg,image/png,image/webp,image/avif" multiple
          onChange={(event) => setFileNames(
            Array.from(event.target.files ?? []).map((file) => file.name).join(', ')
          )} />
        <small>Up to 8 additional images, JPG/PNG/WebP/AVIF, maximum 5 MB each. Existing images remain in the gallery.</small>
        <small>{fileNames || 'Choose one or more images from your phone or computer.'}</small>
      </label>

      <div className="admin-checks">
        <label><input type="checkbox" name="is_active"
          defaultChecked={product?.is_active ?? false} /> Show in public gallery</label>
        <label><input type="checkbox" name="is_featured"
          defaultChecked={product?.is_featured ?? false} /> Feature on the gallery</label>
      </div>

      <button className="admin-primary" type="submit">Save product ↗</button>
    </form>
  );
}
