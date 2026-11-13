'use client';

import { useState, type FormEvent } from 'react';

const WHATSAPP_NUMBER = '233277018939';

const productOptions = [
  'Water bottle',
  'Travel flask / tumbler',
  'Coffee mug',
  'T-shirt',
  'Photo frame',
  'Gift box',
  'Something else',
];

const designOptions = [
  'Photograph',
  'Name or initials',
  'Personal message',
  'Logo or business branding',
  'Photograph and message',
  'My own artwork',
];

export default function CustomOrderForm() {
  const [product, setProduct] = useState('Water bottle');
  const [productDescription, setProductDescription] = useState('');
  const [design, setDesign] = useState('Photograph');
  const [artworkDescription, setArtworkDescription] = useState('');
  const [placement, setPlacement] = useState('One side');
  const [quantity, setQuantity] = useState('1');
  const [occasion, setOccasion] = useState('Birthday');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const details = [
      'Hello Treasured Genius, I would like to request a personalised item.',
      '',
      `Name: ${customerName.trim()}`,
      `Phone: ${customerPhone.trim()}`,
      `Item: ${product}`,
      product === 'Something else' ? `Item description: ${productDescription.trim()}` : '',
      `Design: ${design}`,
      design === 'My own artwork' ? `My artwork details: ${artworkDescription.trim()}` : '',
      `Design placement: ${placement}`,
      `Quantity: ${quantity}`,
      `Occasion: ${occasion}`,
      notes.trim() ? `Additional instructions: ${notes.trim()}` : '',
      '',
      'Please let me know availability, the price and the estimated production time.',
    ].filter(Boolean);

    const message = encodeURIComponent(details.join('\n'));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <section id="custom-order" className="custom-order-section section-pad">
      <div className="custom-order-heading">
        <div>
          <p className="eyebrow">MADE PERSONAL, MADE MEANINGFUL</p>
          <h2>Make it <em>yours.</em></h2>
        </div>
        <p className="custom-order-lead">
          Have an idea for a gift? Tell us what you have in mind. We will review your request
          and get back to you with availability, a quotation and the next steps.
        </p>
      </div>

      <form className="custom-order-form" onSubmit={handleSubmit}>
        <div className="custom-order-form-topline">
          <span>YOUR PERSONALISATION REQUEST</span>
          <span>01 — 03</span>
        </div>

        <div className="custom-order-grid">
          <label className="custom-order-field">
            <span>Your name</span>
            <input
              autoComplete="name"
              name="customerName"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="How should we address you?"
              required
            />
          </label>

          <label className="custom-order-field">
            <span>WhatsApp phone number</span>
            <input
              autoComplete="tel"
              name="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="e.g. 024 000 0000"
              required
            />
          </label>

          <label className="custom-order-field">
            <span>What would you like customised?</span>
            <select name="product" value={product} onChange={(event) => setProduct(event.target.value)}>
              {productOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>

          <label className="custom-order-field">
            <span>What would you like on it?</span>
            <select name="design" value={design} onChange={(event) => setDesign(event.target.value)}>
              {designOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>

        {product === 'Something else' && (
          <label className="custom-order-field custom-order-conditional">
            <span>Describe the item you have in mind</span>
            <textarea
              name="productDescription"
              value={productDescription}
              onChange={(event) => setProductDescription(event.target.value)}
              placeholder="Tell us what the item is, what it should look like, its size or material if you know, and any other details that will help us understand your idea."
              rows={4}
              required
            />
            <small>For example: a key holder, a personalised desk accessory or another item you have in mind.</small>
          </label>
        )}

        {design === 'My own artwork' && (
          <label className="custom-order-field custom-order-conditional">
            <span>Describe your artwork and how you want it used</span>
            <textarea
              name="artworkDescription"
              value={artworkDescription}
              onChange={(event) => setArtworkDescription(event.target.value)}
              placeholder="Describe your artwork, what it represents, any text or colours that must stay exactly as they are, and where you would like it placed on the item."
              rows={4}
              required
            />
            <small>You can share the artwork with the team on WhatsApp after sending this request.</small>
          </label>
        )}

        <div className="custom-order-grid custom-order-grid-three">
          <label className="custom-order-field">
            <span>Design placement</span>
            <select name="placement" value={placement} onChange={(event) => setPlacement(event.target.value)}>
              <option>One side</option>
              <option>Both sides</option>
              <option>Wraparound design</option>
              <option>Not sure — please advise</option>
            </select>
          </label>

          <label className="custom-order-field">
            <span>Quantity</span>
            <input
              name="quantity"
              type="number"
              min="1"
              max="500"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />
          </label>

          <label className="custom-order-field">
            <span>What is the occasion?</span>
            <select name="occasion" value={occasion} onChange={(event) => setOccasion(event.target.value)}>
              <option>Birthday</option>
              <option>Anniversary</option>
              <option>Memorial / remembrance</option>
              <option>Graduation</option>
              <option>Wedding</option>
              <option>Business branding</option>
              <option>Just because</option>
              <option>Other</option>
            </select>
          </label>
        </div>

        <label className="custom-order-field">
          <span>Anything else we should know? <em>Optional</em></span>
          <textarea
            name="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add preferred colours, wording, a date you need the item by, or any other instructions."
            rows={3}
          />
        </label>

        <div className="custom-order-submit-row">
          <p>
            Every custom request is reviewed individually. We will confirm what is possible,
            the price and the estimated production time before you approve anything.
          </p>
          <button className="button button-gold custom-order-submit" type="submit">
            Send request on WhatsApp <span>↗</span>
          </button>
        </div>
        <p className="custom-order-privacy">
          This form prepares a message in WhatsApp. Your request is only sent when you press
          Send in WhatsApp. For your own artwork, attach the file in that chat.
        </p>
      </form>
    </section>
  );
}
