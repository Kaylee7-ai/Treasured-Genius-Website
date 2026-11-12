'use client';
import { useState } from 'react';
import { saveProductAction } from './actions';
type Category={id:string;name:string};
type Product={id:string;name:string;slug:string;short_description:string|null;description:string|null;price_ghs:number;stock_quantity:number;category_id:string|null;sort_order:number;is_active:boolean;is_featured:boolean};
export default function ProductForm({categories,product}:{categories:Category[];product?:Product}){
 const [name,setName]=useState(product?.name??'');const [slug,setSlug]=useState(product?.slug??'');const [files,setFiles]=useState('');
 return <form action={saveProductAction} className="admin-product-form">
 {product&&<input type="hidden" name="id" value={product.id}/>}
 <label>Product name<input name="name" value={name} onChange={e=>{setName(e.target.value);if(!product)setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));}} required minLength={2} maxLength={120}/></label>
 <label>Page address (slug)<input name="slug" value={slug} onChange={e=>setSlug(e.target.value)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required/></label>
 <label>Short description<input name="short_description" defaultValue={product?.short_description??''} maxLength={240}/></label>
 <label>Full description<textarea name="description" defaultValue={product?.description??''} rows={6} maxLength={5000}/></label>
 <div className="admin-form-row"><label>Price (GH₵)<input name="price_ghs" type="number" min="0.01" step="0.01" defaultValue={product?.price_ghs??''} required/></label><label>Stock quantity<input name="stock_quantity" type="number" min="0" step="1" defaultValue={product?.stock_quantity??0} required/></label></div>
 <label>Category<select name="category_id" defaultValue={product?.category_id??''}><option value="">Choose a category</option>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
 <label>Display order<input name="sort_order" type="number" min="0" max="10000" defaultValue={product?.sort_order??0}/></label>
 <label className="admin-file-label">Product photographs (up to 8, JPG/PNG/WebP/AVIF, max 5 MB each)<input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={e=>setFiles(Array.from(e.target.files??[]).map(f=>f.name).join(', '))}/><small>{files||'Choose multiple images. Selecting new images replaces the current gallery.'}</small></label>
 <div className="admin-checks"><label><input type="checkbox" name="is_active" defaultChecked={product?.is_active??true}/> Visible in public shop</label><label><input type="checkbox" name="is_featured" defaultChecked={product?.is_featured??false}/> Featured product</label></div>
 <button className="admin-primary" type="submit">Save product ↗</button></form>;
}
