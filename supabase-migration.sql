-- ==============================================================================
-- DATABASE MIGRATION: PORTFOLIO VIDEOS
-- Platform: Supabase / PostgreSQL
-- ==============================================================================

-- 1. Create portfolio_videos table
CREATE TABLE IF NOT EXISTS public.portfolio_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cloudinary_public_id TEXT UNIQUE NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'cloudinary' CHECK (source_type IN ('cloudinary', 'local')),
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    category TEXT NOT NULL CHECK (category IN ('Editing', 'Marketing', 'Motion')),
    description TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    video_url TEXT NOT NULL,
    poster_url TEXT NOT NULL,
    duration NUMERIC,
    width INTEGER,
    height INTEGER,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Performance index for public gallery retrieval
-- (Note: cloudinary_public_id is already indexed via the UNIQUE constraint above)
CREATE INDEX IF NOT EXISTS idx_portfolio_videos_published_order 
    ON public.portfolio_videos (is_published, display_order ASC, created_at DESC);

-- 3. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_portfolio_videos_updated_at ON public.portfolio_videos;
CREATE TRIGGER trigger_portfolio_videos_updated_at
    BEFORE UPDATE ON public.portfolio_videos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Row Level Security (RLS)
ALTER TABLE public.portfolio_videos ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated roles to SELECT (strictly filtered by the RLS policy below)
GRANT SELECT ON public.portfolio_videos TO anon;
GRANT SELECT ON public.portfolio_videos TO authenticated;

-- Public can view ONLY published videos
DROP POLICY IF EXISTS "Public can view published portfolio videos" ON public.portfolio_videos;
CREATE POLICY "Public can view published portfolio videos"
    ON public.portfolio_videos
    FOR SELECT
    USING (is_published = true);

-- Service role has full administrative access (used by server-authenticated Next.js APIs)
DROP POLICY IF EXISTS "Service role full access on portfolio videos" ON public.portfolio_videos;
CREATE POLICY "Service role full access on portfolio videos"
    ON public.portfolio_videos
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 5. SEED DATA: Exactly 21 Existing Projects (15 Cloudinary + 6 Local)
-- ==============================================================================
INSERT INTO public.portfolio_videos (
    cloudinary_public_id, source_type, title, subtitle, category, description, tags, video_url, poster_url, display_order, is_published
) VALUES
('portfolio/project-01', 'cloudinary', 'Midnight Motion', 'A Study in Movement', 'Editing', 'Cinematic exploration of movement and shadow — crafted through meticulous editorial pacing and dramatic color grading.', ARRAY['Premiere Pro', 'Color Grading', 'Cinematic'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/project-01.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/project-01_poster.jpg', 1, true),
('portfolio/project-02', 'cloudinary', 'Frame Theory', 'Visual Storytelling', 'Motion', 'Dynamic motion graphics sequence blending typography, form, and rhythm into a compelling visual narrative.', ARRAY['After Effects', 'Motion Design', 'Typography'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/project-02.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/project-02_poster.jpg', 2, true),
('portfolio/project-03', 'cloudinary', 'Visual Pulse', 'Commercial Campaign', 'Marketing', 'High-energy commercial piece engineered for maximum engagement — driving brand awareness through visual impact.', ARRAY['Paid Social', 'Brand Strategy', 'Conversion'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/project-03.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/project-03_poster.jpg', 3, true),
('portfolio/IMG_0019', 'cloudinary', 'Motion Narrative', 'Editorial Short', 'Editing', 'Intimate editorial short capturing raw emotion through deliberate pacing and atmospheric sound design.', ARRAY['Documentary', 'Sound Design', 'Storytelling'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/IMG_0019.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/IMG_0019_poster.jpg', 4, true),
('portfolio/IMG_0772', 'cloudinary', 'Cinematic Flow', 'Brand Film', 'Motion', 'Fluid brand film merging sleek transitions with bold compositions — a visual identity brought to life.', ARRAY['Direction', '3D Animation', 'Branding'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/IMG_0772.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/IMG_0772_poster.jpg', 5, true),
('portfolio/IMG_2652', 'cloudinary', 'Golden Hour', 'Performance Ad', 'Marketing', 'Performance-driven ad campaign bathed in warm tones, optimized for scroll-stopping impact across platforms.', ARRAY['Ad Creative', 'A/B Testing', 'ROI Driven'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/IMG_2652.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/IMG_2652_poster.jpg', 6, true),
('portfolio/IMG_3024', 'cloudinary', 'Silent Frames', 'Art Direction', 'Editing', 'Contemplative art piece exploring stillness within motion — every frame composed with editorial precision.', ARRAY['Art Direction', 'Post-Production', 'Grading'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/IMG_3024.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/IMG_3024_poster.jpg', 7, true),
('portfolio/IMG_3507', 'cloudinary', 'Royal Caribbean', 'Premium Editorial Cut', 'Editing', 'A premium-grade editorial sequence focused on pacing, tension, and controlled highlights — built for a cinematic finish.', ARRAY['Premium Cut', 'Color Work', 'Cinematic'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/IMG_3507.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/IMG_3507_poster.jpg', 8, true),
('portfolio/IMG_3956', 'cloudinary', 'Noir Kinetics', 'Motion Signature', 'Motion', 'A bold motion study with refined timing, micro-transitions, and a luxury finish — designed to feel effortless and expensive.', ARRAY['After Effects', 'Micro-Transitions', 'Typography'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/IMG_3956.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/IMG_3956_poster.jpg', 9, true),
('portfolio/IMG_3966', 'cloudinary', 'Aurum Campaign', 'Performance Showcase', 'Marketing', 'High-intent creative engineered for scroll-stopping performance — sharp hooks, clean composition, and brand-first rhythm.', ARRAY['Ad Creative', 'Hook Design', 'Conversion'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/IMG_3966.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/IMG_3966_poster.jpg', 10, true),
('portfolio/new1', 'cloudinary', 'Velvet Horizon', 'Luxury Brand Film', 'Motion', 'A sweeping brand film with velvet tones, deliberate pacing, and editorial framing built for premium digital presence.', ARRAY['Brand Film', 'Direction', 'Luxury'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/new1.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/new1_poster.jpg', 11, true),
('portfolio/new2', 'cloudinary', 'Chromatic Drift', 'Visual Experience', 'Editing', 'An immersive chromatic journey through light, texture, and rhythm — refined in post for a high-end cinematic finish.', ARRAY['Color Work', 'Editorial', 'Cinematic'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/new2.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/new2_poster.jpg', 12, true),
('portfolio/new3', 'cloudinary', 'Aether Drift', 'Ambient Synthesis', 'Motion', 'A continuous flow of abstract particle dynamics and ambient lighting, crafted for high-end luxury digital displays.', ARRAY['Particles', 'Houdini', 'Atmospheric'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/new3.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/new3_poster.jpg', 13, true),
('portfolio/new4', 'cloudinary', 'Luminous Shift', 'Editorial Lookbook', 'Marketing', 'A visually striking lookbook campaign featuring high contrast aesthetics and bold color blocking for digital channels.', ARRAY['Lookbook', 'Direct Response', 'Social Ad'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/new4.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/new4_poster.jpg', 14, true),
('portfolio/new5', 'cloudinary', 'Prism View', 'Optical Refractions', 'Editing', 'A detailed exploration of light refractions, crystal optics, and chromatic aberration through dynamic macro shots.', ARRAY['Macro', 'VFX', 'Color Work'], 'https://res.cloudinary.com/driapshxj/video/upload/f_auto,q_auto/portfolio/new5.mp4', 'https://res.cloudinary.com/driapshxj/image/upload/f_auto,q_auto/portfolio/new5_poster.jpg', 15, true),
('local/IMG_2340', 'local', 'Solstice Bloom', 'Fashion Editorial', 'Marketing', 'An evocative fashion editorial merging organic silhouettes with warm, natural daylight and rhythmic pacing.', ARRAY['High Fashion', 'Pacing', 'Grading'], '/video/opt_IMG_2340.mp4', '/video/thumb_opt_IMG_2340.jpg', 16, true),
('local/IMG_3441', 'local', 'Apex Kinetic', 'Commercial Spot', 'Motion', 'A high-octane commercial spot capturing raw velocity and precision engineering through dynamic sound design.', ARRAY['Sound Design', 'CGI', 'Visual Hook'], '/video/opt_IMG_3441.mp4', '/video/thumb_opt_IMG_3441.jpg', 17, true),
('local/IMG_8112', 'local', 'Opal Atmosphere', 'Documentary Short', 'Editing', 'A poetic documentary portrait exploring human connection against vast landscapes with organic color science.', ARRAY['Storytelling', 'Atmosphere', 'Grading'], '/video/opt_IMG_8112.mp4', '/video/thumb_opt_IMG_8112.jpg', 18, true),
('local/IMG_8858', 'local', 'Midnight Motion', 'A Study in Movement', 'Editing', 'Cinematic exploration of movement and shadow — crafted through meticulous editorial pacing and dramatic color grading.', ARRAY['Premiere Pro', 'Color Grading', 'Cinematic'], '/video/opt_IMG_8858.mp4', '/video/thumb_opt_IMG_8858.jpg', 19, true),
('local/IMG_9540', 'local', 'Frame Theory', 'Visual Storytelling', 'Motion', 'Dynamic motion graphics sequence blending typography, form, and rhythm into a compelling visual narrative.', ARRAY['After Effects', 'Motion Design', 'Typography'], '/video/opt_IMG_9540.mp4', '/video/thumb_opt_IMG_9540.jpg', 20, true),
('local/IMG_9661', 'local', 'Visual Pulse', 'Commercial Campaign', 'Marketing', 'High-energy commercial piece engineered for maximum engagement — driving brand awareness through visual impact.', ARRAY['Paid Social', 'Brand Strategy', 'Conversion'], '/video/opt_IMG_9661.mp4', '/video/thumb_opt_IMG_9661.jpg', 21, true)
ON CONFLICT (cloudinary_public_id) DO NOTHING;
