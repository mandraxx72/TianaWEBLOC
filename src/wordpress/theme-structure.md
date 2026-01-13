
# WordPress Theme Structure Guide

## File Mapping for WordPress Conversion

### Theme Files Structure
```
casa-tiana-theme/
├── style.css
├── index.php
├── functions.php
├── header.php
├── footer.php
├── sidebar.php
├── single.php
├── page.php
├── archive.php
├── search.php
├── 404.php
├── front-page.php
├── home.php
├── inc/
│   ├── customizer.php
│   ├── enqueue.php
│   └── template-functions.php
├── template-parts/
│   ├── header/
│   ├── footer/
│   ├── content/
│   └── navigation/
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── page-templates/
    └── page-home.php
```

### React Component to WordPress Mapping

#### Static Components (Convert to PHP templates)
- `src/components/layout/Header.tsx` → `header.php` + `template-parts/header/site-header.php`
- `src/components/layout/Footer.tsx` → `footer.php` + `template-parts/footer/site-footer.php`
- `src/components/layout/Layout.tsx` → Template structure for all pages

#### Dynamic Content Components (WordPress integration)
- `src/components/Blog.tsx` → `archive.php`, `single.php`, `home.php`
- `src/components/Gallery.tsx` → Custom post type + gallery template
- `src/components/Rooms.tsx` → Custom post type + room archive template
- `src/components/Reviews.tsx` → Custom post type + testimonials template

#### Page Components
- `src/pages/Index.tsx` → `front-page.php`
- `src/components/sections/HeroSection.tsx` → `template-parts/content/hero.php`
- `src/components/sections/AboutSection.tsx` → `template-parts/content/about.php`

### WordPress Features to Implement

#### Custom Post Types
1. **Rooms** (`rooms`)
   - Fields: title, description, price, capacity, amenities, gallery
   - Archive page for all rooms
   - Single room detail pages

2. **Testimonials** (`testimonials`)
   - Fields: reviewer name, rating, content, date
   - Display on homepage and dedicated page

3. **Gallery Images** (`gallery`)
   - Fields: image, category, title, description
   - Filterable gallery interface

#### Custom Fields (ACF or native)
- Hero section: title, subtitle, button text, background images
- About section: story content, team photos
- Contact information: address, phone, email
- Social media links
- Site customization options

#### Theme Customizer Options
- Site identity (logo, colors)
- Hero section content
- Contact information
- Social media links
- Typography options

#### Menus
- Primary navigation (header)
- Footer links
- Social media links

#### Widgets
- Footer widget areas
- Sidebar areas (if needed)

### WordPress Integration Points

#### Functions.php Setup
```php
// Theme support
add_theme_support('post-thumbnails');
add_theme_support('custom-logo');
add_theme_support('html5', ['gallery', 'caption']);

// Register menus
register_nav_menus([
    'primary' => 'Primary Menu',
    'footer' => 'Footer Menu'
]);

// Enqueue scripts and styles
wp_enqueue_style('theme-style', get_stylesheet_uri());
wp_enqueue_script('theme-script', get_template_directory_uri() . '/assets/js/theme.js');
```

#### Custom Fields Integration
- Use ACF or native custom fields for content management
- Create field groups for different content types
- Implement field output in templates

#### Database Considerations
- Custom post types for rooms, testimonials, gallery
- Custom taxonomies for room types, gallery categories
- User roles for content management

### Migration Strategy

1. **Phase 1: Static Structure**
   - Convert layout components to PHP
   - Set up basic theme structure
   - Implement WordPress standards

2. **Phase 2: Dynamic Content**
   - Create custom post types
   - Implement custom fields
   - Build content management interfaces

3. **Phase 3: Advanced Features**
   - Add theme customizer options
   - Implement search functionality
   - Add performance optimizations

4. **Phase 4: Polish & SEO**
   - Add schema markup
   - Optimize for performance
   - Implement SEO best practices
```
