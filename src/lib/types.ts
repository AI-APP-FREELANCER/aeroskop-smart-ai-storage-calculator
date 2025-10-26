// Database Types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  phone_number: string;
  company?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  user_id?: number;
  session_type: 'user' | 'guest';
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
  last_activity: Date;
  is_active: boolean;
}

export interface AIRecommendation {
  id: string;
  session_id: string;
  user_id?: number;
  
  // Input parameters
  cameras: number;
  resolution: string;
  fps: number;
  codec: string;
  activity_level: string;
  retention_days: number;
  recording_mode: string;
  
  // Calculated results
  total_storage_tb: number;
  daily_storage_tb: number;
  total_bitrate_mbps: number;
  
  // AI Analysis
  ai_insights?: any;
  optimization_suggestions?: any;
  risk_assessment?: any;
  
  created_at: Date;
}

export interface UserActivity {
  id: string;
  session_id: string;
  user_id?: number;
  activity_type: string;
  page_url?: string;
  time_spent_seconds?: number;
  activity_data?: any;
  created_at: Date;
}

export interface AnalyticsSummary {
  id: number;
  date: string;
  total_users: number;
  total_sessions: number;
  total_calculations: number;
  total_storage_tb: number;
  created_at: Date;
}

// New Analytics Types
export interface UserAnalytics {
  id: number;
  user_session_id: string;
  parameter_data: {
    cameras: number | '';
    resolution: string;
    fps: number;
    codec: string;
    quality: string;
    activityPercent: number;
    recordingHoursPerDay: number;
    retentionDays: number;
    recordingMode: string;
  };
  start_time: string;
  end_time?: string;
  time_spent_seconds: number;
  actions: string[];
  page_url: string;
  user_agent: string;
  created_at: Date;
}

export interface CalculatorInteraction {
  id: number;
  session_id: string;
  action: string;
  parameters?: any;
  timestamp: string;
  page_url: string;
  created_at: Date;
}

export interface RecommendationAnalytics {
  id: number;
  session_id: string;
  parameters: any;
  recommendation_data: {
    product_name: string;
    storage_tb: number;
    bitrate: number;
  };
  timestamp: string;
  page_url: string;
  created_at: Date;
}

// API Request/Response Types
export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  country_code: string;
  phone_number: string;
  company?: string;
}

export interface CreateSessionRequest {
  user_id?: number;
  session_type: 'user' | 'guest';
  ip_address?: string;
  user_agent?: string;
}

export interface CreateAIRecommendationRequest {
  session_id: string;
  user_id?: number;
  cameras: number;
  resolution: string;
  fps: number;
  codec: string;
  activity_level: string;
  retention_days: number;
  recording_mode: string;
  total_storage_tb: number;
  daily_storage_tb: number;
  total_bitrate_mbps: number;
  estimated_cost: number;
  standard_cost: number;
  savings_amount: number;
  ai_insights?: any;
  optimization_suggestions?: any;
  risk_assessment?: any;
}

export interface CreateActivityRequest {
  session_id: string;
  user_id?: number;
  activity_type: string;
  page_url?: string;
  time_spent_seconds?: number;
  activity_data?: any;
}

// AI Storage Recommendation Types
export interface StorageRecommendation {
  product_name: string;
  product_model: string;
  product_image_url: string;
  channel_capacity: string;
  storage_capacity_tb: number;
  cpu: string;
  ram: string;
  pros: string[];
  cons: string[];
  raid_support: string;
  suitable_for: string[];
  why_recommended: string;
  key_benefits?: string[]; // NEW: Key benefits of the recommended solution
}

export interface AIRecommendationResponse {
  cached: boolean;
  is_fallback?: boolean; // NEW: Indicates this is a fallback response
  fallback_reason?: string; // NEW: Why fallback was used
  recommendation: StorageRecommendation; // Single recommended solution
  calculations: StorageCalculations;
  optimization: {
    suggestions: string[];
    insights: string[];
  };
  summary: string;
}

export interface StorageRecommendationCache {
  id: string;
  input_hash: string;
  cameras: number;
  resolution: string;
  fps: number;
  codec: string;
  activity_level: string;
  retention_days: number;
  recording_mode: string;
  recommended_product_good: StorageRecommendation;
  recommended_product_better: StorageRecommendation;
  recommended_product_best: StorageRecommendation;
  storage_calculation: object;
  optimization_suggestions: object;
  usage_count: number;
  created_at: Date;
}

export interface StorageRecommendationRequest {
  cameras: number;
  resolution: string;
  fps: number;
  codec: string;
  quality: string;              // NEW: Low, Medium, High
  activity_percent: number;     // NEW (replacing activity_level)
  recording_hours_per_day: number; // NEW: 1-24 hours
  retention_days: number;
  recording_mode: string;
}

export interface StorageCalculations {
  total_storage_tb: number;
  daily_storage_tb: number;
  daily_storage_per_camera_gb: number; // NEW
  total_bitrate_mbps: number;
  bitrate_per_camera: number;   // NEW
  retention_days: number;
  adjusted_bitrate: number;      // NEW
  overhead_factor: number;       // NEW
}
