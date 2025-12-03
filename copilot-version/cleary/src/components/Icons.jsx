// Custom SVG icons with polished styling
const iconDefaults = {
  width: "24",
  height: "24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

export const Brain = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M12 2a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4 4 4 0 0 0 4-4V6a4 4 0 0 0-4-4Z"/>
    <path d="M12 14a6 6 0 0 0-6 6v2h12v-2a6 6 0 0 0-6-6Z"/>
  </svg>
);

export const Shield = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export const Zap = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

export const TrendingUp = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

export const Target = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

export const Sparkles = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

export const Users = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export const Award = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

export const Play = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

export const ArrowRight = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

export const Clock = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export const Heart = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export const Search = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

export const Filter = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

export const ArrowLeft = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

export const User = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export const ExternalLink = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

export const Share2 = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <circle cx="18" cy="5" r="3"/>
    <circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

export const Bookmark = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

export const MapPin = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

export const Building2 = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M3 21h18"/>
    <path d="M9 8h1"/>
    <path d="M9 12h1"/>
    <path d="M9 16h1"/>
    <path d="M14 8h1"/>
    <path d="M14 12h1"/>
    <path d="M14 16h1"/>
    <path d="M6 4v17"/>
    <path d="M18 4v17"/>
    <path d="M6 4h12"/>
  </svg>
);

export const Landmark = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <line x1="3" y1="22" x2="21" y2="22"/>
    <line x1="6" y1="18" x2="6" y2="11"/>
    <line x1="10" y1="18" x2="10" y2="11"/>
    <line x1="14" y1="18" x2="14" y2="11"/>
    <line x1="18" y1="18" x2="18" y2="11"/>
    <polygon points="12 2 20 7 4 7"/>
  </svg>
);

export const Sun = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

export const Moon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export const Mail = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

export const Settings = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const Bell = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export const Palette = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);

export const Activity = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

export const Send = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export const Loader2 = ({ className = "w-6 h-6 animate-spin", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export const Newspaper = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
    <path d="M18 14h-8"/>
    <path d="M15 18h-5"/>
    <path d="M10 6h8v4h-8V6Z"/>
  </svg>
);

export const AlertCircle = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export const Globe2 = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    <path d="M2 12h20"/>
  </svg>
);

export const Globe = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export const Film = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/>
    <line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="17" x2="22" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);

export const RefreshCcw = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M21 2v6h-6"/>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
    <path d="M3 22v-6h6"/>
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
  </svg>
);

export const Video = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="m22 8-6 4 6 4V8Z"/>
    <rect x="2" y="6" width="14" height="12" rx="2" ry="2"/>
  </svg>
);

export const LayoutGrid = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

export const Flame = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

export const MessageCircle = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

export const X = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export const BarChart2 = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

export const LogOut = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export const Vote = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

export const Scale = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/>
    <path d="M12 3v18"/>
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);

export const Lightbulb = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
  </svg>
);

export const Info = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

export const Eye = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const RefreshCw = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} {...iconDefaults} {...props} viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
