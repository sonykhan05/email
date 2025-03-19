# QuickLink URL Shortener

A responsive, client-side URL shortener web application with a modern and professional UI. This project is built using only HTML, CSS, and vanilla JavaScript.

## Features

- Shorten any URL with a single click
- Create custom URL aliases
- Generate QR codes for shortened URLs
- Copy shortened URLs to clipboard
- Track recently shortened URLs
- Fully responsive design for all devices
- Modern and professional UI

## Demo

To use the URL shortener:

1. Open `index.html` in your web browser
2. Paste a long URL in the input field
3. Click the "Shorten" button
4. Copy your shortened URL or generate a QR code

## Deployment Instructions

This URL shortener is designed to work on various web hosting environments. Follow these instructions to deploy it:

### Shared Hosting (cPanel, etc.)

1. Upload all files to your web hosting via FTP or the hosting control panel
2. Make sure the `.htaccess` file is included in the upload (it may be hidden by default)
3. If your hosting supports PHP, the `index.php` file will ensure proper URL handling
4. Point your domain to the folder containing these files

### Apache Server

The included `.htaccess` file will handle URL rewrites automatically. Make sure:
- `mod_rewrite` is enabled on your server
- `.htaccess` files are allowed (AllowOverride All)

### Nginx Server

Add this to your server configuration:

```
location / {
    if (!-e $request_filename) {
        rewrite ^/([a-zA-Z0-9-]+)$ /index.html last;
    }
}
```

### IIS Server

The included `web.config` file will handle URL rewrites. Make sure URL Rewrite module is installed.

### Static Site Hosting (GitHub Pages, Netlify, Vercel)

For static hosting environments that support client-side redirects:

1. Upload all files to your hosting service
2. For GitHub Pages, you may need to add a 404.html file that redirects to index.html
3. For Netlify, create a `_redirects` file with: `/* /index.html 200`
4. For Vercel, use the vercel.json configuration to handle rewrites

## Implementation Details

This is a client-side implementation of a URL shortener that stores data in the browser's localStorage. In a production environment, this would typically be implemented with:

- A server-side component to handle URL shortening and redirection
- A database to store URLs and analytics
- User authentication for management of URLs

## Technologies Used

- HTML5
- CSS3 (with animations and responsive design)
- Vanilla JavaScript
- Font Awesome for icons
- QRCode.js for QR code generation

## Browser Compatibility

The URL shortener works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## License

MIT License

## Credits

Developed by [Your Name] 