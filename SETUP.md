# New Life Juice Website Setup Instructions

## Next Steps to Complete the Setup:

### 1. **Set up Formspree Form**
1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form for "New Life Juice Orders"
3. Copy your form endpoint (it will look like `https://formspree.io/f/xpzkqrqx`)
4. Replace `YOUR_FORM_ID` in `index.html` line 132 with your actual form ID

### 2. **Add Product Images**
The site needs high-quality images for:
- Hero section: `images/hero-juice.jpg`
- Products: `green-detox.jpg`, `citrus-burst.jpg`, `berry-antioxidant.jpg`, `tropical-paradise.jpg`, `root-vegetable.jpg`
- About section: `images/about-us.jpg`

See `images/README.md` for detailed requirements.

### 3. **Initialize Git Repository**
```bash
git init
git add .
git commit -m "Initial New Life Juice website setup"
```

### 4. **Create GitHub Repository**
1. Go to GitHub and create a new public repository named "NewLifeJuice"
2. Add the remote and push:
```bash
git remote add origin https://github.com/yourusername/NewLifeJuice.git
git branch -M main
git push -u origin main
```

### 5. **Enable GitHub Pages**
1. Go to repository Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: "main"
4. Folder: "/ (root)"
5. Save

Your site will be available at: `https://yourusername.github.io/NewLifeJuice`

### 6. **Customize Content**
- Update contact information in footer
- Replace "yourusername" with actual GitHub username in URLs
- Add Google Analytics tracking ID if desired
- Customize colors, fonts, or layout as needed

### 7. **Test the Form**
1. Once Formspree is configured, test the order form
2. Verify email notifications are working
3. Check that order totals calculate correctly

### 8. **Optional Enhancements**
- Add custom domain
- Set up Google Analytics
- Add customer testimonials
- Create social media links
- Add favicon

## Development Server
The local development server is already running at: http://localhost:8000

## Support
If you need any modifications or have questions, just let me know!
