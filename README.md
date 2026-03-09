# Lukáš & [Bride] — Wedding Invitation Website

A minimalist, romantic single-page wedding invitation website. No frameworks, no build step — pure HTML, CSS & JS.

## 📁 Files

| File | Purpose |
|------|---------|
| `index.html` | All content & structure |
| `style.css` | Responsive styles, light/dark themes, animations |
| `script.js` | Countdown, dark mode, RSVP form, calendar links |
| `vercel.json` | Vercel deployment config with security headers |

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI once
npm i -g vercel

# From the project folder
vercel --prod
```

Or drag-drop the folder to vercel.com/new.

## ✏️ Customise

### Replace placeholder content
1. **Bride's name** — search for `[Bride]` in `index.html` and `script.js`; replace with her name.
2. **Wedding photo** — replace the `<div class="hero-photo-placeholder">` block with:
   ```html
   <img src="your-photo.jpg" alt="Lukáš & [Bride]" />
   ```
3. **Wedding date** — update `WEDDING_DATE` in `script.js` (currently `2027-03-13T14:00:00`).
4. **About us text** — edit the paragraphs in the `#about` section.
5. **Contact email** — update `lukas@example.com` in the form note.
6. **Social hashtag** — update `#LukasAndBride2027` in FAQ.
7. **Map embed** — replace the `<iframe src="...">` URL in the Location section with your exact venue coordinates.

### Connect RSVP to a real backend
In `script.js`, find the comment `// ℹ️  In production` and replace the `localStorage` block with a `fetch()` to:
- [Formspree](https://formspree.io) (free tier, no backend needed)
- [Netlify Forms](https://docs.netlify.com/forms/setup/)
- Your own serverless function

Example with Formspree:
```js
await fetch('https://formspree.io/f/YOUR_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

## 🎨 Design Tokens

All colours, fonts and spacing are CSS custom properties in `:root` inside `style.css`. Swap them to re-theme the entire site instantly.

## 🌙 Dark Mode

Automatically respects `prefers-color-scheme`. Users can also toggle manually — preference is saved in `localStorage`.
