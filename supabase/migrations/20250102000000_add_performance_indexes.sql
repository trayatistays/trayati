-- Performance Optimization Migration
-- Add indexes for frequently queried columns

-- ─── STAYS TABLE INDEXES ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS stays_is_active_idx ON stays(is_active);
CREATE INDEX IF NOT EXISTS stays_sort_order_idx ON stays(sort_order);
CREATE INDEX IF NOT EXISTS stays_experience_type_idx ON stays(experience_type);
CREATE INDEX IF NOT EXISTS stays_city_state_idx ON stays(city, state);
CREATE INDEX IF NOT EXISTS stays_is_featured_idx ON stays((amenities_detail->>'featured')) WHERE is_active = true;

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS stays_active_featured_idx ON stays(sort_order) WHERE is_active = true;

-- ─── TESTIMONIALS TABLE INDEXES ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS testimonials_is_active_idx ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS testimonials_sort_order_idx ON testimonials(sort_order);
CREATE INDEX IF NOT EXISTS testimonials_active_idx ON testimonials(sort_order) WHERE is_active = true;

-- ─── EXPERIENCES TABLE INDEXES ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS experiences_is_active_idx ON experiences(is_active);
CREATE INDEX IF NOT EXISTS experiences_sort_order_idx ON experiences(sort_order);
CREATE INDEX IF NOT EXISTS experiences_category_idx ON experiences(category);
CREATE INDEX IF NOT EXISTS experiences_featured_idx ON experiences(featured) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS experiences_active_idx ON experiences(sort_order) WHERE is_active = true;

-- ─── RESERVATIONS TABLE INDEXES ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS reservations_clerk_user_id_idx ON reservations(clerk_user_id);
CREATE INDEX IF NOT EXISTS reservations_stay_id_idx ON reservations(stay_id);
CREATE INDEX IF NOT EXISTS reservations_status_idx ON reservations(status);
CREATE INDEX IF NOT EXISTS reservations_check_in_idx ON reservations(check_in);
CREATE INDEX IF NOT EXISTS reservations_created_at_idx ON reservations(created_at DESC);

-- ─── PROPERTY SUBMISSIONS TABLE INDEXES ─────────────────────────────
CREATE INDEX IF NOT EXISTS property_submissions_status_idx ON property_submissions(status);
CREATE INDEX IF NOT EXISTS property_submissions_submitted_at_idx ON property_submissions(submitted_at DESC);

-- ─── CONTACT MESSAGES TABLE INDEXES ─────────────────────────────────
CREATE INDEX IF NOT EXISTS contact_messages_is_read_idx ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages(created_at DESC);

-- ─── ANALYZE TABLES FOR QUERY PLANNER ───────────────────────────────
ANALYZE stays;
ANALYZE testimonials;
ANALYZE experiences;
ANALYZE reservations;
ANALYZE property_submissions;
ANALYZE contact_messages;
ANALYZE destinations;
