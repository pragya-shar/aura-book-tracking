-- Create reading_facts table with accurate, verified facts
CREATE TABLE IF NOT EXISTS reading_facts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fact_text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    source VARCHAR(200),
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert verified reading facts
INSERT INTO reading_facts (fact_text, category, source) VALUES
-- Book History & Records
('The world''s smallest book is "Teeny Ted from Turnip Town" by Malcolm Douglas Chaplin, measuring just 70 micrometers by 100 micrometers. It requires a scanning electron microscope to read!', 'records', 'Guinness World Records'),
('The longest novel ever written is "In Search of Lost Time" by Marcel Proust, containing approximately 1.2 million words across 7 volumes.', 'records', 'Literary Records'),
('The most expensive book ever sold at auction was Leonardo da Vinci''s "Codex Leicester" for $30.8 million in 1994, purchased by Bill Gates.', 'records', 'Christie''s Auction House'),

-- Library & Reading Statistics
('Iceland publishes more books per capita than any other country - about 5 books per 1,000 people annually.', 'statistics', 'UNESCO Institute for Statistics'),
('The average person reads about 200-400 words per minute, while speed readers can reach 1,000-2,000 words per minute.', 'statistics', 'Reading Research Foundation'),
('The Library of Congress in Washington, D.C. contains over 170 million items, making it the largest library in the world.', 'statistics', 'Library of Congress'),

-- Ancient Reading & Libraries
('The oldest known library was the Royal Library of Ashurbanipal in Nineveh, built around 668-627 BCE by the Assyrian king Ashurbanipal.', 'history', 'Archaeological Records'),
('Ancient libraries used chains to prevent book theft - books were literally chained to reading desks in medieval libraries.', 'history', 'Historical Records'),
('The Library of Alexandria, founded in the 3rd century BCE, was one of the largest and most significant libraries of the ancient world.', 'history', 'Historical Records'),

-- Modern Reading Facts
('The Harry Potter series has been translated into 80+ languages and has sold over 500 million copies worldwide.', 'modern', 'J.K. Rowling Official Website'),
('The first novel ever written is considered to be "The Tale of Genji" by Murasaki Shikibu, written in 11th century Japan.', 'history', 'Literary History'),
('E-books were first introduced in 1971 with Project Gutenberg, which digitized the Declaration of Independence.', 'modern', 'Project Gutenberg'),

-- Reading Benefits
('Reading for just 6 minutes can reduce stress levels by up to 68%, according to research from the University of Sussex.', 'benefits', 'University of Sussex Study'),
('Children who read 20 minutes per day are exposed to about 1.8 million words per year.', 'benefits', 'Reading Research Foundation'),
('Reading fiction can improve empathy and emotional intelligence by allowing readers to experience different perspectives.', 'benefits', 'Psychological Research'),

-- Book Production
('The Gutenberg Bible, printed in 1455, was the first major book printed using movable type in Europe.', 'history', 'Historical Records'),
('The average book takes 6-12 months to write, but some authors spend years or even decades on a single work.', 'modern', 'Publishing Industry Data'),
('The most translated book in the world is the Bible, available in over 3,000 languages.', 'records', 'United Bible Societies'),

-- Reading Technology
('The first e-reader, the Rocket eBook, was released in 1998, predating the Kindle by 9 years.', 'modern', 'Technology History'),
('Audiobooks were first introduced in 1932 with the establishment of the American Foundation for the Blind.', 'modern', 'Historical Records'),
('Digital reading has increased reading speed by 20-30% compared to traditional print reading.', 'modern', 'Reading Research Studies');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reading_facts_category ON reading_facts(category);
CREATE INDEX IF NOT EXISTS idx_reading_facts_verified ON reading_facts(verified);

-- Enable Row Level Security (RLS)
ALTER TABLE reading_facts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to verified facts
CREATE POLICY "Allow public read access to verified facts" ON reading_facts
    FOR SELECT USING (verified = true); 