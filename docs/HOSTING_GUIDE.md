# Host Privacy Policy & Terms on GitHub Pages

## 🚀 Quick Setup (5 minutes)

### Step 1: Create GitHub Repo
```bash
# In your workspace
cd /Users/himaschal/workspace
mkdir aperioesca-legal
cd aperioesca-legal
git init
```

### Step 2: Copy Legal Documents
```bash
# Copy privacy policy and terms
cp /Users/himaschal/workspace/snapcal/docs/PRIVACY_POLICY.md ./privacy.md
cp /Users/himaschal/workspace/snapcal/docs/TERMS_OF_SERVICE.md ./terms.md
```

### Step 3: Create index.html
Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aperioesca - Legal</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        h1 { color: #FF6B9D; }
        a { color: #6FEDD6; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Aperioesca Legal Documents</h1>
    <ul>
        <li><a href="privacy.html">Privacy Policy</a></li>
        <li><a href="terms.html">Terms of Service</a></li>
    </ul>
</body>
</html>
```

### Step 4: Convert Markdown to HTML
Use a simple converter or just rename:
```bash
# Option 1: Use pandoc (if installed)
pandoc privacy.md -o privacy.html
pandoc terms.md -o terms.html

# Option 2: Use online converter
# Go to https://markdowntohtml.com
# Paste content, download HTML
```

### Step 5: Push to GitHub
```bash
git add .
git commit -m "Add legal documents"
git remote add origin https://github.com/YOUR_USERNAME/aperioesca-legal.git
git push -u origin main
```

### Step 6: Enable GitHub Pages
1. Go to repo settings
2. Pages section (left sidebar)
3. Source: Deploy from branch
4. Branch: main, folder: / (root)
5. Save

**Done!** Your URLs will be:
- Privacy: `https://YOUR_USERNAME.github.io/aperioesca-legal/privacy.html`
- Terms: `https://YOUR_USERNAME.github.io/aperioesca-legal/terms.html`

---

## 🎨 Styled HTML Template (Optional)

If you want a nicer look, here's a styled template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aperioesca Privacy Policy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%);
            color: #ECEDEE;
            padding: 40px 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 40px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        h1 {
            background: linear-gradient(135deg, #FF6B9D 0%, #6FEDD6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 20px;
        }
        h2 { color: #FF9ECD; margin-top: 30px; margin-bottom: 15px; }
        h3 { color: #6FEDD6; margin-top: 20px; margin-bottom: 10px; }
        p, li { margin-bottom: 10px; }
        a { color: #6FEDD6; text-decoration: none; }
        a:hover { text-decoration: underline; }
        code { background: rgba(255, 255, 255, 0.1); padding: 2px 6px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Paste your markdown content here (converted to HTML) -->
    </div>
</body>
</html>
```

---

## 🔄 Alternative: Even Simpler

Just use GitHub's built-in markdown rendering:
1. Push `privacy.md` and `terms.md` to repo
2. Enable GitHub Pages
3. URLs will be:
   - `https://YOUR_USERNAME.github.io/aperioesca-legal/privacy`
   - `https://YOUR_USERNAME.github.io/aperioesca-legal/terms`

GitHub automatically renders `.md` files as HTML!

---

## ✅ Recommended Approach

**Simplest (5 min):**
1. Create repo `aperioesca-legal`
2. Push `privacy.md` and `terms.md`
3. Enable GitHub Pages
4. Use URLs in App Store Connect

**No Render, no server, no complexity. Just works!**
