// Product Banner Data Structure
export interface ProductBannerData {
  id: string;
  product: string;
  contentFetchId: string;
  caption: string;
  color: string;
}

// Product Banner Data Array
export const PRODUCT_BANNER_DATA: ProductBannerData[] = [
  {
    id: "ASK-5D-IR",
    product: "Dome Camera",
    contentFetchId: "uploaded:ASK-5D-IR.webp-4404a42d-ed11-4652-9f35-da5a5eaaa315",
    caption: "Precision Dome Security: 4K Clarity and Built-in Audio Monitoring.",
    color: "#10b981"
  },
  {
    id: "ASK-8B-VF-IR",
    product: "Bullet Camera, Vari-focal",
    contentFetchId: "uploaded:ASK-8B-VF-IR.webp-1f67237d-0a1b-4c9a-91a3-b4c3069a8bb3",
    caption: "Vari-Focal Power: Adjust Coverage Remotely for Maximum Field View.",
    color: "#f59e0b"
  },
  {
    id: "ASK-290B-IR-8MP-180",
    product: "180° Panoramic Camera",
    contentFetchId: "uploaded:ASK-290B-IR-8MP-180.webp-4edcc0e2-e277-4d3c-8f47-3ad25fd380e1",
    caption: "Panoramic Vision: Seamless 180° Coverage Without Distortion.",
    color: "#3b82f6"
  },
  {
    id: "ASK-5036SD-IR-IR-PTZ",
    product: "High-Speed PTZ",
    contentFetchId: "uploaded:ASK-5036SD-IR-IR-PTZ.webp-fe47a75b-cef6-4bc1-9b6d-85debd6e5e21",
    caption: "360° Dynamic Patrol: High-Speed Pan, Tilt, and 36x Zoom Precision.",
    color: "#ef4444"
  },
  {
    id: "ASK-6DVF-IR",
    product: "Dome Camera, Vari-focal",
    contentFetchId: "uploaded:ASK-6DVF-IR.webp-a2c41c55-13b9-46fd-84b7-93f40dc72cb4",
    caption: "Indoor/Outdoor Flex: Remote Focus Dome with Superior Night IR.",
    color: "#8b5cf6"
  },
  {
    id: "ASK-8D-IR",
    product: "8MP Dome Camera",
    contentFetchId: "uploaded:ASK-8D-IR.webp-57657f3e-d3b6-49af-aba5-6ac5d9bc703a",
    caption: "Ultra HD 8MP: Crystal Clear Resolution for Critical Detail Capture.",
    color: "#ec4899"
  },
  {
    id: "ASK-8DVF-IR",
    product: "8MP Varifocal Dome",
    contentFetchId: "uploaded:ASK-8DVF-IR.webp-2c71e8f2-608b-485a-ae91-875caeb560eb",
    caption: "Adaptive 8MP Coverage: The Ultimate All-Weather Varifocal Dome.",
    color: "#f97316"
  },
  {
    id: "ASK-5B-IR",
    product: "Bullet Camera",
    contentFetchId: "uploaded:ASK-5B-IR.webp-f80bf980-228d-4ef8-8d4c-d32a5ec2654c",
    caption: "Weatherproof Bullet: Reliable Video Surveillance in Any Environment.",
    color: "#6366f1"
  },
  {
    id: "ASK-PAN-165",
    product: "165° Panoramic Camera",
    contentFetchId: "uploaded:ASK-PAN-165.webp-a2eb3b45-aa65-4164-9073-f395b7eb8944",
    caption: "Wide-Area Surveillance: 165° Coverage Optimized for Public Spaces.",
    color: "#a855f7"
  }
];

/**
 * Converts contentFetchId to image file path
 * Extracts model name from "uploaded:ASK-5D-IR.webp-..." format
 * Returns path: /images/Camera/ASK-5D-IR.webp
 */
export function contentFetchIdToImagePath(contentFetchId: string): string {
  const match = contentFetchId.match(/uploaded:([^.]+\.webp)/);
  if (match && match[1]) {
    return `/images/Camera/${match[1]}`;
  }
  return '/images/Camera/default.webp'; // fallback
}

/**
 * Get banner data by product ID
 */
export function getBannerData(productId: string): ProductBannerData | null {
  // Handle special case for ASK-290B-IR which maps to ASK-290B-IR-8MP-180
  if (productId === 'ASK-290B-IR') {
    return PRODUCT_BANNER_DATA.find(banner => banner.id === 'ASK-290B-IR-8MP-180') || null;
  }
  
  // Handle special case for ASK-5036SD-IR which maps to ASK-5036SD-IR-IR-PTZ
  if (productId === 'ASK-5036SD-IR') {
    return PRODUCT_BANNER_DATA.find(banner => banner.id === 'ASK-5036SD-IR-IR-PTZ') || null;
  }
  
  return PRODUCT_BANNER_DATA.find(banner => banner.id === productId) || null;
}

/**
 * Get category-specific banner (for PLP pages)
 * Returns the first available banner for the category
 */
export function getCategoryBanner(category: string): ProductBannerData | null {
  // For Security Cameras category, use ASK-6DVF-IR as default
  if (category === 'Security Cameras' || category === 'security-cameras') {
    return getBannerData('ASK-6DVF-IR');
  }
  
  // Fallback: return first banner
  return PRODUCT_BANNER_DATA[0] || null;
}

