# New Life Juice - Premium Fresh Juice Delivery

A modern, responsive website for New Life Juice, featuring a beautiful landing page and integrated order form built with GitHub Pages and Formspree.

## 🌟 Features

- **Responsive Design**: Mobile-first approach that looks great on all devices
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Order Form Integration**: Formspree-powered form handling with real-time total calculation
- **Performance Optimized**: Fast loading times with optimized assets
- **Accessibility Compliant**: WCAG 2.1 AA standards with keyboard navigation
- **SEO Friendly**: Semantic HTML and meta tags for better search visibility

## 🚀 Live Demo

Visit the live site: [https://yourusername.github.io/NewLifeJuice](https://yourusername.github.io/NewLifeJuice)

## 🏗️ Project Structure

```
NewLifeJuice/
├── index.html              # Main landing page
├── css/
│   ├── main.css            # Core styles and design system
│   └── responsive.css      # Mobile responsiveness and breakpoints
├── js/
│   └── main.js            # Interactive functionality and form handling
├── images/
│   ├── README.md          # Image requirements and guidelines
│   └── [product images]   # Product and hero images (to be added)
├── .github/
│   └── copilot-instructions.md  # Development guidelines
└── README.md              # This file
```

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Hosting**: GitHub Pages (free static hosting)
- **Form Processing**: Formspree (handles form submissions)
- **Design**: CSS Grid, Flexbox, CSS Custom Properties
- **Fonts**: Google Fonts (Poppins)

## 📦 Quick Setup

### 1. Clone and Deploy

```bash
# Clone the repository
git clone https://github.com/yourusername/NewLifeJuice.git
cd NewLifeJuice

# Enable GitHub Pages
# Go to Settings > Pages > Source: Deploy from a branch > Branch: main
```

### 2. Configure Formspree

1. Sign up at [Formspree.io](https://formspree.io)
2. Create a new form
3. Copy your form endpoint
4. Replace `YOUR_FORM_ID` in `index.html` with your actual Formspree form ID:

```html
<form class="order-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

### 3. Add Images

Replace the placeholder image references in the `images/` directory with actual product photos. See `images/README.md` for detailed requirements.

### 4. Customize Content

- Update contact information in the footer
- Modify product names and descriptions as needed
- Adjust pricing if different from $18 per juice
- Update meta tags for SEO

## 🎨 Customization

### Colors
The design system uses CSS custom properties for easy theming:

```css
:root {
    --primary-green: #4CAF50;
    --secondary-green: #45a049;
    --accent-orange: #FF6B35;
    --text-dark: #2c3e50;
    --text-light: #6c757d;
}
```

### Typography
Change fonts by updating the Google Fonts import in `index.html` and the CSS variable:

```css
:root {
    --font-primary: 'Poppins', sans-serif;
}
```

## 📱 Mobile Optimization

The site is built with a mobile-first approach and includes:
- Responsive navigation with hamburger menu
- Touch-friendly buttons and form elements
- Optimized images for different screen densities
- Readable text at all screen sizes

## 🔧 Development

### Local Development

```bash
# Serve locally (Python 3)
python -m http.server 8000

# Or with Node.js
npx http-server

# Or with PHP
php -S localhost:8000
```

### Performance Optimization

- Optimize images before adding them (use tools like TinyPNG)
- Consider implementing a service worker for caching
- Use WebP images for better compression
- Minify CSS and JavaScript for production

## 📊 Analytics & Monitoring

To add analytics:

1. **Google Analytics**: Add tracking code to `index.html`
2. **Formspree Analytics**: Monitor form submissions in your Formspree dashboard
3. **GitHub Pages**: Monitor traffic in your repository insights

## 🔒 Security & Privacy

- All forms use HTTPS via GitHub Pages
- Formspree handles form data securely
- No sensitive payment information is collected on the site
- Consider adding a privacy policy page

## 🚀 Deployment

### GitHub Pages (Automatic)
1. Push code to `main` branch
2. Enable GitHub Pages in repository settings
3. Site will be available at `https://yourusername.github.io/NewLifeJuice`

### Custom Domain
1. Add `CNAME` file with your domain
2. Configure DNS with your domain provider
3. Enable HTTPS in GitHub Pages settings

## 📈 SEO Optimization

The site includes:
- Semantic HTML structure
- Meta tags for social sharing
- Descriptive alt text for images
- Structured data for local business (can be added)
- Mobile-friendly design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple devices
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Email: [your-email@domain.com]

## 🎯 Roadmap

Future enhancements:
- [ ] Add customer testimonials section
- [ ] Implement subscription/recurring orders
- [ ] Add nutrition information for each juice
- [ ] Create blog section for health tips
- [ ] Add multi-language support
- [ ] Implement progressive web app features

---

Built with ❤️ for New Life Juice
