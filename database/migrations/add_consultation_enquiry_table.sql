-- Create consultation_enquiry table for storing contact form submissions
CREATE TABLE IF NOT EXISTS consultation_enquiry (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone_number VARCHAR(20),
  area_of_interest VARCHAR(255),
  message_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultation_enquiry_email ON consultation_enquiry(email);
CREATE INDEX IF NOT EXISTS idx_consultation_enquiry_created_at ON consultation_enquiry(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE consultation_enquiry IS 'Stores consultation enquiries submitted through the contact form';
COMMENT ON COLUMN consultation_enquiry.first_name IS 'Enquirer first name';
COMMENT ON COLUMN consultation_enquiry.last_name IS 'Enquirer last name';
COMMENT ON COLUMN consultation_enquiry.email IS 'Enquirer email address';
COMMENT ON COLUMN consultation_enquiry.company IS 'Company name (optional)';
COMMENT ON COLUMN consultation_enquiry.phone_number IS 'Phone number (optional)';
COMMENT ON COLUMN consultation_enquiry.area_of_interest IS 'Subject or area of interest';
COMMENT ON COLUMN consultation_enquiry.message_content IS 'Full message content';
COMMENT ON COLUMN consultation_enquiry.created_at IS 'Submission timestamp';

