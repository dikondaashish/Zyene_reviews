-- Add columns for full review flow text customization
ALTER TABLE businesses
ADD COLUMN rating_subtitle text DEFAULT 'Your feedback means a lot to us!',
ADD COLUMN tags_heading text DEFAULT 'What did you like most?',
ADD COLUMN tags_subheading text DEFAULT 'Tap to select what stood out',
ADD COLUMN custom_tags text[],
ADD COLUMN google_heading text DEFAULT 'Would you post this on Google?',
ADD COLUMN google_subheading text DEFAULT 'Tap to edit, or post as-is',
ADD COLUMN google_button_text text DEFAULT 'Copy & Go to Google',
ADD COLUMN negative_subheading text DEFAULT 'Share your feedback directly with the owner.',
ADD COLUMN negative_textarea_placeholder text DEFAULT 'Tell us what happened...',
ADD COLUMN negative_button_text text DEFAULT 'Send Feedback',
ADD COLUMN thank_you_heading text DEFAULT 'Thank You!',
ADD COLUMN thank_you_message text DEFAULT 'Your feedback means the world to us.' || chr(10) || 'We appreciate you taking the time.',
ADD COLUMN footer_text text DEFAULT 'Powered by Zyene',
ADD COLUMN hide_branding boolean DEFAULT false;
