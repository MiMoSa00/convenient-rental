declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export type LucideIcon = FC<SVGProps<SVGSVGElement>>;
  
  // Export all icons as LucideIcon type
  const icons: {
    [key: string]: LucideIcon;
  };
  
  export = icons;
  export as namespace LucideReact;
  
  // Common exports
  export const Home: LucideIcon;
  export const Users: LucideIcon;
  export const MapPin: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Star: LucideIcon;
  export const Heart: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Building2: LucideIcon;
  export const Plus: LucideIcon;
  export const Sparkles: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Search: LucideIcon;
  export const X: LucideIcon;
  export const Maximize2: LucideIcon;
  export const Minimize2: LucideIcon;
  export const Send: LucideIcon;
  export const Smile: LucideIcon;
  export const Paperclip: LucideIcon;
  export const CheckCheck: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Menu: LucideIcon;
  export const Settings: LucideIcon;
  export const Bell: LucideIcon;
  export const User: LucideIcon;
  export const Mail: LucideIcon;
  export const Lock: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Upload: LucideIcon;
  export const Download: LucideIcon;
  export const Edit: LucideIcon;
  export const Trash: LucideIcon;
  export const Check: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Info: LucideIcon;
  export const Camera: LucideIcon;
  export const Filter: LucideIcon;
  export const LogOut: LucideIcon;
  export const Phone: LucideIcon;
  export const Calendar: LucideIcon;
  export const Clock: LucideIcon;
  export const DollarSign: LucideIcon;
  export const MapPinned: LucideIcon;
  export const Image: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const XCircle: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const Share: LucideIcon;
  export const Copy: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Loader2: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Palette: LucideIcon;
  export const Globe: LucideIcon;
  export const Trash2: LucideIcon;
  export const Save: LucideIcon;
}