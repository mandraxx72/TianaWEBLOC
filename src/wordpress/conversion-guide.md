
# React to WordPress Theme Conversion Guide

## Overview
This guide provides step-by-step instructions for converting the Casa Tiana React application into a WordPress theme while maintaining all functionality and design.

## Current React Structure Analysis

### Layout Components (Static → WordPress Templates)
```
src/components/layout/
├── Layout.tsx       → Base template structure for all WordPress files
├── Header.tsx       → header.php + template-parts/header/site-header.php
└── Footer.tsx       → footer.php + template-parts/footer/site-footer.php
```

### Page Sections (Static → Template Parts)
```
src/components/sections/
├── HeroSection.tsx  → template-parts/content/hero.php
└── AboutSection.tsx → template-parts/content/about.php
```

### Content Components (Dynamic → WordPress Integration)
```
src/components/
├── Blog.tsx         → archive.php, single.php, home.php
├── Gallery.tsx      → Custom post type + gallery template
├── Rooms.tsx        → Custom post type + room archive template
├── Reviews.tsx      → Custom post type + testimonials template
├── Contact.tsx      → page-contact.php or shortcode
└── BookingModal.tsx → JavaScript widget + WordPress integration
```

## Step-by-Step Conversion Process

### Phase 1: Theme Structure Setup

1. **Create WordPress Theme Directory**
   ```
   wp-content/themes/casa-tiana/
   ```

2. **Create Essential WordPress Files**
   ```
   casa-tiana/
   ├── style.css (theme header with metadata)
   ├── index.php (fallback template)
   ├── functions.php (theme functionality)
   ├── header.php (from Header.tsx)
   ├── footer.php (from Footer.tsx)
   ├── front-page.php (from Index.tsx)
   └── screenshot.png (theme preview)
   ```

### Phase 2: Convert Layout Components

#### Header.tsx → header.php
**Source:** `src/components/layout/Header.tsx`
**Target:** `header.php` + `template-parts/header/site-header.php`

**Key Conversions:**
- `siteName` → `get_bloginfo('name')`
- `menuItems` → `wp_nav_menu()`
- `onBookingClick` → JavaScript function
- Language switcher → WPML/Polylang integration

#### Footer.tsx → footer.php
**Source:** `src/components/layout/Footer.tsx`
**Target:** `footer.php` + `template-parts/footer/site-footer.php`

**Key Conversions:**
- `contactInfo` → Custom fields or theme options
- `socialLinks` → Theme customizer options
- Static content → WordPress widgets or custom fields

### Phase 3: Convert Page Components

#### Index.tsx → front-page.php
**Source:** `src/pages/Index.tsx`
**Target:** `front-page.php`

**Structure:**
```php
<?php get_header(); ?>

<?php get_template_part('template-parts/content/hero'); ?>
<?php get_template_part('template-parts/content/about'); ?>
<?php get_template_part('template-parts/content/rooms'); ?>
<?php get_template_part('template-parts/content/gallery'); ?>
<?php get_template_part('template-parts/content/reviews'); ?>
<?php get_template_part('template-parts/content/blog'); ?>
<?php get_template_part('template-parts/content/contact'); ?>

<?php get_footer(); ?>
```

### Phase 4: Convert Content Components

#### Blog.tsx → WordPress Blog Templates
**Source:** `src/components/Blog.tsx`
**Targets:** 
- `home.php` (blog listing)
- `single.php` (single post)
- `archive.php` (category/tag archives)

**Integration Points:**
- Use WordPress Loop
- Replace static posts with `get_posts()` or `WP_Query`
- Integrate with WordPress categories and tags

#### Gallery.tsx → Custom Post Type
**Source:** `src/components/Gallery.tsx`
**Implementation:**
1. Create "Gallery" custom post type
2. Add custom fields for image categories
3. Create `archive-gallery.php` template
4. Use WordPress media library

#### Rooms.tsx → Custom Post Type
**Source:** `src/components/Rooms.tsx`
**Implementation:**
1. Create "Rooms" custom post type
2. Add custom fields:
   - Room price
   - Capacity
   - Amenities (repeater field)
   - Image gallery
3. Create templates:
   - `archive-rooms.php`
   - `single-room.php`

#### Reviews.tsx → Custom Post Type
**Source:** `src/components/Reviews.tsx`
**Implementation:**
1. Create "Testimonials" custom post type
2. Add custom fields:
   - Reviewer name
   - Rating (1-5 stars)
   - Review content
   - Date
3. Create `archive-testimonials.php`

### Phase 5: Content Management Integration

#### ContentManager.tsx → WordPress Options
**Source:** `src/components/content/ContentManager.tsx`
**Target:** Theme Customizer + Custom Fields

**Conversions:**
- `siteContent` object → WordPress options table
- `getContent()` → `get_theme_mod()` or `get_option()`
- `updateContent()` → WordPress admin interface

## WordPress-Specific Implementation

### Custom Post Types (functions.php)
```php
// Register Rooms Custom Post Type
function register_rooms_post_type() {
    register_post_type('rooms', array(
        'public' => true,
        'label' => 'Rooms',
        'supports' => array('title', 'editor', 'thumbnail'),
        'has_archive' => true,
    ));
}
add_action('init', 'register_rooms_post_type');

// Register Testimonials Custom Post Type
function register_testimonials_post_type() {
    register_post_type('testimonials', array(
        'public' => true,
        'label' => 'Testimonials',
        'supports' => array('title', 'editor'),
    ));
}
add_action('init', 'register_testimonials_post_type');
```

### Theme Customizer Integration
```php
function casa_tiana_customize_register($wp_customize) {
    // Hero Section
    $wp_customize->add_section('hero_section', array(
        'title' => 'Hero Section',
        'priority' => 30,
    ));
    
    $wp_customize->add_setting('hero_title');
    $wp_customize->add_control('hero_title', array(
        'label' => 'Hero Title',
        'section' => 'hero_section',
        'type' => 'text',
    ));
    
    // Contact Information
    $wp_customize->add_section('contact_info', array(
        'title' => 'Contact Information',
        'priority' => 40,
    ));
    
    // Add controls for address, phone, email
}
add_action('customize_register', 'casa_tiana_customize_register');
```

### Asset Management
```php
function casa_tiana_enqueue_scripts() {
    // Enqueue CSS (compiled from Tailwind)
    wp_enqueue_style('casa-tiana-style', get_stylesheet_uri());
    
    // Enqueue JavaScript
    wp_enqueue_script('casa-tiana-script', 
        get_template_directory_uri() . '/assets/js/theme.js', 
        array('jquery'), '1.0.0', true
    );
    
    // Localize script for AJAX
    wp_localize_script('casa-tiana-script', 'ajax_object', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('casa_tiana_nonce')
    ));
}
add_action('wp_enqueue_scripts', 'casa_tiana_enqueue_scripts');
```

## Styling Conversion

### Tailwind CSS → WordPress
1. **Compile Tailwind CSS** into a single `style.css` file
2. **Extract custom CSS variables** from `src/index.css`
3. **Ensure responsive design** is maintained
4. **Test cross-browser compatibility**

### CSS Classes Mapping
- Keep existing Tailwind classes in compiled CSS
- Ensure all custom colors and fonts are preserved
- Maintain responsive breakpoints

## JavaScript Functionality

### BookingModal.tsx → WordPress Widget
1. Convert React component to vanilla JavaScript
2. Create WordPress widget or shortcode
3. Integrate with booking system (external API)
4. Handle form submissions via AJAX

### Interactive Elements
- Convert React state management to vanilla JavaScript
- Maintain mobile menu functionality
- Preserve image gallery interactions
- Keep contact form functionality

## Multi-language Support

### LanguageContext.tsx → WordPress i18n
1. **Install WPML or Polylang** plugin
2. **Extract all text strings** for translation
3. **Use WordPress text domain** functions:
   - `__('Text', 'casa-tiana')`
   - `_e('Text', 'casa-tiana')`
4. **Create .pot file** for translators

## Testing Checklist

### Functionality Tests
- [ ] Navigation menu works correctly
- [ ] All sections display properly
- [ ] Contact form submits successfully
- [ ] Gallery filtering functions
- [ ] Mobile responsiveness maintained
- [ ] Booking modal integration works

### WordPress Integration Tests
- [ ] Custom post types created successfully
- [ ] Theme customizer options save correctly
- [ ] Blog posts display with proper formatting
- [ ] SEO meta tags working
- [ ] Admin interface user-friendly

### Performance Tests
- [ ] Page load times acceptable
- [ ] Images optimized
- [ ] CSS/JS minified
- [ ] Caching compatibility

## Maintenance Considerations

### Update Strategy
1. **Version control** for theme files
2. **Child theme** for customizations
3. **Backup procedures** before updates
4. **Testing environment** for changes

### Documentation
1. **Admin user guide** for content management
2. **Developer documentation** for customizations
3. **Troubleshooting guide** for common issues

## File Conversion Priority

### High Priority (Core Functionality)
1. Layout components (Header, Footer, Layout)
2. Front page template
3. Basic styling integration
4. Navigation functionality

### Medium Priority (Content)
1. Blog integration
2. Custom post types (Rooms, Testimonials)
3. Gallery functionality
4. Contact form

### Low Priority (Enhancements)
1. Advanced customizer options
2. Multi-language setup
3. Performance optimizations
4. SEO enhancements

This conversion guide provides a roadmap for systematically converting your React application to a fully functional WordPress theme while preserving all existing functionality and design elements.
