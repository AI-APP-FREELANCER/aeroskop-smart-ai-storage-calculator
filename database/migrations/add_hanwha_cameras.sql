-- Add Hanwha camera models to ai_recommendations table
-- Insert each camera model as a separate row using the codec column

INSERT INTO ai_recommendations (
    session_id,
    user_id,
    cameras,
    resolution,
    fps,
    codec,
    activity_level,
    retention_days,
    recording_mode,
    total_storage_tb,
    daily_storage_tb,
    total_bitrate_mbps,
    estimated_cost,
    standard_cost,
    savings_amount,
    ai_insights,
    optimization_suggestions,
    risk_assessment
) VALUES 
-- Hanwha QNO-6010R
(NULL, NULL, 1, '1080p', 30, 'Hanwha QNO-6010R', 'medium', 30, 'continuous', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '{"camera_model": "Hanwha QNO-6010R", "type": "camera_reference"}', '{"description": "Reference camera model for calculations"}', '{"risk_level": "low"}'),

-- Hanwha QNO-6020R
(NULL, NULL, 1, '1080p', 30, 'Hanwha QNO-6020R', 'medium', 30, 'continuous', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '{"camera_model": "Hanwha QNO-6020R", "type": "camera_reference"}', '{"description": "Reference camera model for calculations"}', '{"risk_level": "low"}'),

-- Hanwha QNO-6030R
(NULL, NULL, 1, '1080p', 30, 'Hanwha QNO-6030R', 'medium', 30, 'continuous', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '{"camera_model": "Hanwha QNO-6030R", "type": "camera_reference"}', '{"description": "Reference camera model for calculations"}', '{"risk_level": "low"}'),

-- Hanwha QNO-6070R
(NULL, NULL, 1, '1080p', 30, 'Hanwha QNO-6070R', 'medium', 30, 'continuous', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '{"camera_model": "Hanwha QNO-6070R", "type": "camera_reference"}', '{"description": "Reference camera model for calculations"}', '{"risk_level": "low"}'),

-- Hanwha QNO-7010R
(NULL, NULL, 1, '1080p', 30, 'Hanwha QNO-7010R', 'medium', 30, 'continuous', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '{"camera_model": "Hanwha QNO-7010R", "type": "camera_reference"}', '{"description": "Reference camera model for calculations"}', '{"risk_level": "low"}'),

-- Hanwha QNO-7020R
(NULL, NULL, 1, '1080p', 30, 'Hanwha QNO-7020R', 'medium', 30, 'continuous', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '{"camera_model": "Hanwha QNO-7020R", "type": "camera_reference"}', '{"description": "Reference camera model for calculations"}', '{"risk_level": "low"}'),

-- Hanwha QNO-7030R
(NULL, NULL, 1, '1080p', 30, 'Hanwha QNO-7030R', 'medium', 30, 'continuous', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '{"camera_model": "Hanwha QNO-7030R", "type": "camera_reference"}', '{"description": "Reference camera model for calculations"}', '{"risk_level": "low"}'),

-- Hanwha QNO-7080R
(NULL, NULL, 1, '1080p', 30, 'Hanwha QNO-7080R', 'medium', 30, 'continuous', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '{"camera_model": "Hanwha QNO-7080R", "type": "camera_reference"}', '{"description": "Reference camera model for calculations"}', '{"risk_level": "low"}'),

-- Hanwha QNO-8010R
(NULL, NULL, 1, '1080p', 30, 'Hanwha QNO-8010R', 'medium', 30, 'continuous', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '{"camera_model": "Hanwha QNO-8010R", "type": "camera_reference"}', '{"description": "Reference camera model for calculations"}', '{"risk_level": "low"}'),

-- Hanwha QNO-8020R
(NULL, NULL, 1, '1080p', 30, 'Hanwha QNO-8020R', 'medium', 30, 'continuous', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '{"camera_model": "Hanwha QNO-8020R", "type": "camera_reference"}', '{"description": "Reference camera model for calculations"}', '{"risk_level": "low"}'),

-- Hanwha QNO-8030R
(NULL, NULL, 1, '1080p', 30, 'Hanwha QNO-8030R', 'medium', 30, 'continuous', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '{"camera_model": "Hanwha QNO-8030R", "type": "camera_reference"}', '{"description": "Reference camera model for calculations"}', '{"risk_level": "low"}'),

-- Hanwha QNO-8080R
(NULL, NULL, 1, '1080p', 30, 'Hanwha QNO-8080R', 'medium', 30, 'continuous', 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, '{"camera_model": "Hanwha QNO-8080R", "type": "camera_reference"}', '{"description": "Reference camera model for calculations"}', '{"risk_level": "low"}');

-- Add comment for documentation
COMMENT ON TABLE ai_recommendations IS 'Contains AI recommendations and camera model references including Hanwha camera models';
