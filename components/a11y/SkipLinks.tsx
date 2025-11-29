/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts for screen reader users
 */

import React from 'react';

interface SkipLink {
  id: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
}

const defaultLinks: SkipLink[] = [
  { id: 'main-content', label: 'Skip to main content' },
  { id: 'navigation', label: 'Skip to navigation' },
  { id: 'search', label: 'Skip to search' },
];

export const SkipLinks: React.FC<SkipLinksProps> = ({ links = defaultLinks }) => {
  return (
    <nav aria-label="Skip links" className="skip-links">
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className="
            sr-only focus:not-sr-only
            fixed top-0 left-0 z-[10000]
            bg-violet-600 text-white
            px-4 py-2
            font-medium
            focus:outline-none focus:ring-2 focus:ring-white
            transition-all duration-200
          "
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

/**
 * Landmark wrapper for main content
 */
interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent: React.FC<MainContentProps> = ({ children, className = '' }) => (
  <main
    id="main-content"
    tabIndex={-1}
    className={`focus:outline-none ${className}`}
    role="main"
    aria-label="Main content"
  >
    {children}
  </main>
);

/**
 * Navigation landmark
 */
interface NavigationLandmarkProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export const NavigationLandmark: React.FC<NavigationLandmarkProps> = ({
  children,
  label = 'Main navigation',
  className = '',
}) => (
  <nav
    id="navigation"
    aria-label={label}
    className={className}
  >
    {children}
  </nav>
);

/**
 * Search landmark
 */
interface SearchLandmarkProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export const SearchLandmark: React.FC<SearchLandmarkProps> = ({
  children,
  label = 'Search',
  className = '',
}) => (
  <search
    id="search"
    role="search"
    aria-label={label}
    className={className}
  >
    {children}
  </search>
);

/**
 * Complementary/Aside landmark
 */
interface AsideLandmarkProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

export const AsideLandmark: React.FC<AsideLandmarkProps> = ({
  children,
  label,
  className = '',
}) => (
  <aside
    aria-label={label}
    className={className}
  >
    {children}
  </aside>
);

/**
 * Footer landmark
 */
interface FooterLandmarkProps {
  children: React.ReactNode;
  className?: string;
}

export const FooterLandmark: React.FC<FooterLandmarkProps> = ({
  children,
  className = '',
}) => (
  <footer
    role="contentinfo"
    className={className}
  >
    {children}
  </footer>
);

/**
 * Region landmark for distinct sections
 */
interface RegionProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

export const Region: React.FC<RegionProps> = ({
  children,
  label,
  className = '',
}) => (
  <section
    role="region"
    aria-label={label}
    className={className}
  >
    {children}
  </section>
);

export default SkipLinks;
