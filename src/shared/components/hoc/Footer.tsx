import { Link } from 'react-router-dom';
import { FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import { MapPin, Mail } from 'lucide-react';
import logoImage from '@/assets/logo.jpg';
import { useTheme } from '@/shared/hooks/useTheme';

const SOCIAL_LINKS = [
  {
    icon: FaFacebookF,
    href: 'https://www.facebook.com/IEEECUSB/',
    label: 'Facebook',
  },
  {
    icon: FaLinkedinIn,
    href: 'https://www.linkedin.com/company/ieeecusb/', 
    label: 'LinkedIn',
  },
];

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Committees', to: '/committees' },
  { label: 'Events', to: '/events' },
  { label: 'Join Us', to: '/join' },
];

const RESOURCE_LINKS = [
  { label: 'IEEE.org', href: 'https://www.ieee.org/' },
  {
    label: 'IEEE Xplore',
    href: 'https://ieeexplore.ieee.org/Xplore/home.jsp',
  },
  { label: 'IEEE Spectrum', href: 'https://spectrum.ieee.org/' },
  { label: 'IEEE Standards', href: 'https://standards.ieee.org/' },
];

const POLICY_LINKS = [
  {
    label: 'IEEE Privacy Policy',
    href: 'https://www.ieee.org/security-privacy.html',
  },
  {
    label: 'IEEE Terms & Conditions',
    href: 'https://www.ieee.org/about/help/site-terms-conditions.html',
  },
  {
    label: 'IEEE Non-Discrimination Policy',
    href: 'https://www.ieee.org/about/corporate/governance/p9-26.html',
  },
];

export const Footer = () => {
  const { isDark } = useTheme();
  return (
    <footer
      className={`py-16 px-6 transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-600'}`}
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={logoImage}
              alt="IEEE CUSB"
              className="w-12 h-12 rounded-full"
            />
            <span
              className={`font-bold text-xl transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              IEEE CUSB
            </span>
          </div>
          <p
            className={`text-sm mb-4 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Advancing Technology for Humanity. The Official Student Branch of
            Cairo University.
          </p>
          <div className="flex gap-3">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all ${
                  isDark
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 shadow-sm border border-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3
            className={`font-bold mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            {QUICK_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="hover:text-primary transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3
            className={`font-bold mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Resources
          </h3>
          <ul className="space-y-2 text-sm">
            {RESOURCE_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3
            className={`font-bold mb-4 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Contact Us
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Faculty of Engineering, Cairo University, Giza, Egypt</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <a
                href="mailto:contact@ieeecusb.org"
                className="hover:text-primary transition-colors"
              >
                contact@ieeecusb.org
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        className={`max-w-7xl mx-auto mt-12 pt-8 border-t text-center text-sm transition-colors duration-300 ${
          isDark
            ? 'border-gray-800 text-gray-400'
            : 'border-gray-200 text-gray-500'
        }`}
      >
        <p className="mb-2">
          &copy; {new Date().getFullYear()} IEEE Cairo University Student
          Branch. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-x-1">
          {POLICY_LINKS.map(({ label, href }, index) => (
            <span key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors underline-offset-2 hover:underline"
              >
                {label}
              </a>
              {index < POLICY_LINKS.length - 1 && <span> | </span>}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};
