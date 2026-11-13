'use client';

import { useState, type FormEvent } from 'react';

type SampleProduct = { id: string; name: string; slug: string };
type Props = {
  sampleProducts: SampleProduct[];
  initialProductId?: string;
  onlineSubmissionEnabled: boolean;
};

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
const fileExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
};

export default function CustomOrderForm({
  sampleProducts,
  initialProductId,
  onlineSubmissionEnabled,
}: Props) {
  const [product, setProduct] = useState('Water bottle');
  const [sampleProductId, setSampleProductId] = useState(initialProductId ?? '');
  const [productDescription, setProductDescription] = useState('');
  const [design, setDesign] = useState('Photograph');
  const [artworkDescription, setArtworkDescription] = useState('');
  const [placement, setPlacement] = useState('One side');
  const [quantity, setQuantity] = useState('1');
  const [occasion, setOccasion] = useState('Birthday');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [artworkConsent, setArtworkConsent] = useState(false);
  const [fileNames, setFileNames] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [requestCode, setRequestCode] = useState('');

  const selectedSample = sampleProducts.find((item) => item.id === sampleProductId);
  const itemLabel = selectedSample
    ? selectedSample.name
    : product === 'Something else' ? 'Something else' : product;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setErrorMessage('');
    setRequestCode('');

    if (product === 'Something else' && !productDescription.trim()) {
      setErrorMessage('Please describe the item you have in mind.');
      return;
    }
    if (design === 'My own artwork' && !artworkDescription.trim()) {
      setErrorMessage('Please describe how you would like your artwork used.');
      return;
    }
    if (!artworkConsent) {
      setErrorMessage('Please confirm that you have permission to share the photograph or artwork.');
      return;
    }

    const payload = new FormData(formElement);
    const files = payload.getAll('artwork').filter(
      (entry): entry is File => typeof File !== 'undefined' && entry instanceof File && entry.size > 0,
    );
    if (
      files.length > 5
      || files.some((file) => !fileExtensions[file.type] || file.size > 5 * 1024 * 1024)
      || files.reduce((total, file) => total + file.size, 0) > 20 * 1024 * 1024
    ) {
      setErrorMessage('Please attach up to 5 JPG, PNG, WebP, AVIF or PDF files. Each file must be 5 MB or smaller.');
      return;
    }

    const details = [
      'Hello Treasured Genius, I would like to request a personalised item.',
      '',
      `Name: ${customerName.trim()}`,
      `Phone: ${customerPhone.trim()}`,
      customerEmail.trim() ? `Email: ${customerEmail.trim()}` : '',
      `Item: ${itemLabel}`,
      product === 'Something else' ? `Item description: ${productDescription.trim()}` : '',
      `Design: ${design}`,
      design === 'My own artwork' ? `Artwork instructions: ${artworkDescription.trim()}` : '',
      `Placement: ${placement}`,
      `Quantity: ${quantity}`,
      `Occasion: ${occasion}`,
      requestedDate ? `Requested date: ${requestedDate}` : '',
      notes.trim() ? `Additional instructions: ${notes.trim()}` : '',
      files.length ? `Attachments to share: ${files.map((file) => file.name).join(', ')}` : '',
      '',
      'Please confirm availability, the quotation and estimated production time.',
    ].filter(Boolean);

    if (!onlineSubmissionEnabled) {
      const message = encodeURIComponent(details.join('\n'));
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer');
      setErrorMessage('The secure online inbox is still being connected. WhatsApp has been opened with your request details. Attach any photographs or artwork in that chat before sending.');
      return;
    }

    payload.set('productLabel', itemLabel);
    payload.set('productId', selectedSample?.id ?? '');
    payload.set('itemDescription', productDescription.trim());
    payload.set('designType', design);
    payload.set('artworkDescription', artworkDescription.trim());
    payload.set('designPlacement', placement);
    payload.set('quantity', quantity);
    payload.set('occasion', occasion);
    payload.set('requestedDate', requestedDate);
    payload.set('extraNotes', notes.trim());

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/custom-requests', {
        method: 'POST',
        body: payload,
      });

      const result = await response.json() as {
        ok?: boolean;
        requestCode?: string;
        error?: string;
      };

      if (!response.ok || !result.ok || !result.requestCode) {
        throw new Error(result.error || 'We could not save your request. Please try again.');
      }

      setRequestCode(result.requestCode);
      formElement.reset();
      setProduct('Water bottle');
      setSampleProductId(initialProductId ?? '');
      setProductDescription('');
      setDesign('Photograph');
      setArtworkDescription('');
      setPlacement('One side');
      setQuantity('1');
      setOccasion('Birthday');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setRequestedDate('');
      setNotes('');
      setArtworkConsent(false);
      setFileNames('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="custom-order" className="custom-order-section section-pad">
      <div className="custom-order-heading">
        <div>
          <p className="eyebrow">MADE PERSONAL, MADE MEANINGFUL</p>
          <h2>Make it <em>yours.</em></h2>
        </div>
        <p className="custom-order-lead">
          Have an idea for a gift? Tell us what you have in mind. You can choose a gallery example,
          describe something different, and attach your photograph or artwork.
        </p>
      </div>

      {requestCode ? (
        <div className="custom-order-success" role="status">
          <p className="eyebrow">REQUEST RECEIVED</p>
          <h3>Your idea is now with Treasured Genius.</h3>
          <p>Your reference number is <strong>{requestCode}</strong>. The team can use it to find your request and private attachments.</p>
          <p>We will review the details and confirm what is possible, the quotation and the estimated production time before anything goes into production.</p>
          <a className="button button-gold" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Treasured Genius, I have submitted custom request ${requestCode}.`)}`} target="_blank" rel="noreferrer">
            Continue on WhatsApp <span>↗</span>
          </a>
        </div>
      ) : (
        <form className="custom-order-form" onSubmit={handleSubmit}>
          <input className="custom-order-honeypot" type="text" name="websiteUrl"
            tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div className="custom-order-form-topline">
            <span>YOUR PERSONALISATION REQUEST</span>
            <span>01 — 03</span>
          </div>

          <div className="custom-order-grid">
            <label className="custom-order-field">
              <span>Your name</span>
              <input autoComplete="name" name="customerName" value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="How should we address you?" required maxLength={120} />
            </label>

            <label className="custom-order-field">
              <span>WhatsApp phone number</span>
              <input autoComplete="tel" name="customerPhone" type="tel" value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="e.g. 024 000 0000" required maxLength={40} />
            </label>

            <label className="custom-order-field">
              <span>Email address <em>Optional</em></span>
              <input autoComplete="email" name="customerEmail" type="email" value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                placeholder="you@example.com" maxLength={254} />
            </label>

            <label className="custom-order-field">
              <span>What would you like customised?</span>
              <select name="product" value={product} onChange={(event) => setProduct(event.target.value)}>
                {productOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>

            {sampleProducts.length > 0 && (
              <label className="custom-order-field custom-order-field-wide">
                <span>Choose a sample from our gallery <em>Optional</em></span>
                <select value={sampleProductId} onChange={(event) => setSampleProductId(event.target.value)}>
                  <option value="">No specific gallery item</option>
                  {sampleProducts.map((item) => (
                    <option value={item.id} key={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
            )}

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
              <textarea name="productDescription" value={productDescription}
                onChange={(event) => setProductDescription(event.target.value)}
                placeholder="Tell us what the item is, what it should look like, its size or material if you know, and any other details that will help us understand your idea."
                rows={4} required maxLength={2000} />
              <small>For example: a key holder, a personalised desk accessory or another item you have in mind.</small>
            </label>
          )}

          {design === 'My own artwork' && (
            <label className="custom-order-field custom-order-conditional">
              <span>Describe your artwork and how you want it used</span>
              <textarea name="artworkDescription" value={artworkDescription}
                onChange={(event) => setArtworkDescription(event.target.value)}
                placeholder="Describe your artwork, what it represents, any text or colours that must stay exactly as they are, and where you would like it placed."
                rows={4} required maxLength={2000} />
              <small>You can attach the artwork below or share it with the team later on WhatsApp.</small>
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
              <input name="quantity" type="number" min="1" max="500" value={quantity}
                onChange={(event) => setQuantity(event.target.value)} required />
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
            <span>When would you ideally need it? <em>Optional</em></span>
            <input type="date" name="requestedDate" value={requestedDate}
              onChange={(event) => setRequestedDate(event.target.value)}
              min={new Date().toISOString().slice(0, 10)} />
          </label>

          <label className="custom-order-field custom-order-upload">
            <span>Upload your photograph, logo or artwork <em>Optional</em></span>
            <input name="artwork" type="file" multiple
              accept="image/jpeg,image/png,image/webp,image/avif,application/pdf"
              onChange={(event) => setFileNames(
                Array.from(event.target.files ?? []).map((file) => file.name).join(', ')
              )} />
            <small>Up to 5 files, JPG, PNG, WebP, AVIF or PDF. Maximum 5 MB per file. Files are kept private and only authorised Treasured Genius staff can open them.</small>
            <small>{fileNames || 'Choose files from your phone or computer.'}</small>
          </label>

          <label className="custom-order-field">
            <span>Anything else we should know? <em>Optional</em></span>
            <textarea name="notes" value={notes} onChange={(event) => setNotes(event.target.value)}
              placeholder="Add preferred colours, wording, a date you need the item by, or any other instructions."
              rows={3} maxLength={3000} />
          </label>

          <label className="custom-order-consent">
            <input type="checkbox" checked={artworkConsent}
              onChange={(event) => setArtworkConsent(event.target.checked)} required />
            <span>I confirm that I have permission to share the photographs, artwork or logos included with this request.</span>
          </label>

          {errorMessage && <p className="custom-order-error" role="alert">{errorMessage}</p>}

          <div className="custom-order-submit-row">
            <p>
              {onlineSubmissionEnabled
                ? 'Your request and any uploaded files are saved securely for the owner to review. A quotation and production timeline will be confirmed before work begins.'
                : 'The secure online inbox is not connected yet. Your details will be prepared in WhatsApp so you can send them directly to the shop.'}
            </p>
            <button className="button button-gold custom-order-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : onlineSubmissionEnabled ? 'Submit custom request' : 'Send request on WhatsApp'} <span>↗</span>
            </button>
          </div>
          <p className="custom-order-privacy">
            {onlineSubmissionEnabled
              ? 'Customer artwork is stored in a private folder and is not displayed in the public gallery.'
              : 'Your WhatsApp message is not sent until you press Send in WhatsApp. Attach any artwork there before sending.'}
          </p>
        </form>
      )}
    </section>
  );
}
