-- KnowYouRole — Job Roles Seed Data
-- Run after migration: supabase db seed or via Supabase Dashboard

INSERT INTO public.job_roles (role_name, category, description, mbti_best, mbti_avoid, disc_prefs, big_five_avg, salary_min, salary_max, growth_rate) VALUES

-- Technology
('Software Engineer', 'Technology', 'Designs, builds, and maintains software systems. Works across the full stack from databases to user interfaces.', ARRAY['INTP','ISTP','ENTJ'], ARRAY['ESFP','ISFP'], ARRAY['D','C'], '{"O":70,"C":80,"E":40,"A":50,"N":35}', 85000, 200000, 'High'),
('Product Manager', 'Technology', 'Owns product strategy, roadmap, and cross-functional alignment between engineering, design, and business.', ARRAY['ENTJ','INTJ','ENFJ'], ARRAY['ISFP','ISTP'], ARRAY['D','I'], '{"O":70,"C":70,"E":65,"A":60,"N":30}', 100000, 220000, 'Very High'),
('Data Scientist', 'Technology', 'Extracts insights from data using statistics, ML, and programming. Bridges data and decision-making.', ARRAY['INTP','INTJ','INFJ'], ARRAY['ESFJ','ESTJ'], ARRAY['C','I'], '{"O":85,"C":70,"E":40,"A":55,"N":40}', 95000, 200000, 'Very High'),
('UX Designer', 'Technology', 'Designs intuitive, accessible digital experiences. Researches user behavior and translates it into interfaces.', ARRAY['INFP','ENFP','ISFP'], ARRAY['ESTJ','ISTJ'], ARRAY['I','S'], '{"O":90,"C":55,"E":50,"A":70,"N":30}', 75000, 155000, 'High'),
('DevOps Engineer', 'Technology', 'Builds and maintains CI/CD pipelines, cloud infrastructure, and deployment automation.', ARRAY['ISTJ','INTP','ENTJ'], ARRAY['ESFP','ENFP'], ARRAY['C','D'], '{"O":60,"C":85,"E":40,"A":50,"N":35}', 90000, 185000, 'High'),
('Cybersecurity Analyst', 'Technology', 'Protects organizations from digital threats. Monitors systems, responds to incidents, and implements defenses.', ARRAY['INTJ','ISTJ','INFJ'], ARRAY['ESFP','ENFP'], ARRAY['C','D'], '{"O":65,"C":80,"E":40,"A":55,"N":45}', 80000, 170000, 'Very High'),
('ML Engineer', 'Technology', 'Builds and deploys machine learning models at scale. Bridges research and production systems.', ARRAY['INTP','INTJ','ENTP'], ARRAY['ESFJ','ISFP'], ARRAY['C','I'], '{"O":85,"C":75,"E":40,"A":50,"N":35}', 120000, 250000, 'Very High'),

-- Business
('Financial Analyst', 'Finance', 'Analyzes financial data, builds models, and guides investment and operational decisions.', ARRAY['INTJ','ISTJ','ENTJ'], ARRAY['ESFP','ISFP'], ARRAY['C','D'], '{"O":60,"C":80,"E":40,"A":55,"N":45}', 65000, 145000, 'Moderate'),
('Marketing Director', 'Business', 'Leads brand strategy, campaign execution, and market positioning across channels.', ARRAY['ENTJ','ENFJ','ESFJ'], ARRAY['ISTJ','INTJ'], ARRAY['D','I'], '{"O":70,"C":60,"E":80,"A":65,"N":35}', 90000, 185000, 'High'),
('Management Consultant', 'Business', 'Diagnoses organizational challenges and designs solutions for efficiency and growth.', ARRAY['ENTJ','INTJ','ENFJ'], ARRAY['ISFP','ESFP'], ARRAY['D','I'], '{"O":80,"C":70,"E":60,"A":55,"N":40}', 85000, 200000, 'High'),
('Entrepreneur', 'Business', 'Builds and scales new ventures. Handles strategy, fundraising, hiring, and product in early stages.', ARRAY['ENTJ','ENTP','INTJ'], ARRAY['ISFJ','ISTJ'], ARRAY['D','I'], '{"O":85,"C":75,"E":75,"A":40,"N":45}', 50000, 1000000, 'Variable'),
('Operations Manager', 'Business', 'Optimizes processes, supply chains, and resource allocation to maximize efficiency.', ARRAY['ESTJ','ISTJ','ENTJ'], ARRAY['INFP','ISFP'], ARRAY['D','C'], '{"O":55,"C":85,"E":55,"A":60,"N":30}', 65000, 140000, 'Moderate'),

-- Healthcare
('Clinical Psychologist', 'Healthcare', 'Diagnoses and treats mental health conditions through therapy and assessment.', ARRAY['INFJ','INFP','ENFJ'], ARRAY['ENTJ','ESTJ'], ARRAY['I','S'], '{"O":85,"C":65,"E":55,"A":90,"N":50}', 75000, 160000, 'High'),
('Registered Nurse', 'Healthcare', 'Provides direct patient care, administers treatments, and coordinates with physicians.', ARRAY['ESFJ','ISFJ','ENFJ'], ARRAY['INTP','ENTP'], ARRAY['S','C'], '{"O":60,"C":75,"E":70,"A":85,"N":40}', 65000, 120000, 'Moderate'),
('Physical Therapist', 'Healthcare', 'Helps patients recover from injury and manage chronic pain through movement and rehabilitation.', ARRAY['ESFJ','ISFJ','ESTJ'], ARRAY['INTP','ENTP'], ARRAY['S','C'], '{"O":60,"C":70,"E":65,"A":80,"N":35}', 70000, 130000, 'Moderate'),
('Healthcare Administrator', 'Healthcare', 'Manages hospital or clinic operations, budgets, compliance, and staff coordination.', ARRAY['ENTJ','ESTJ','ISTJ'], ARRAY['INFP','ISFP'], ARRAY['D','C'], '{"O":55,"C":80,"E":55,"A":65,"N":30}', 75000, 170000, 'Moderate'),

-- Engineering
('Civil Engineer', 'Engineering', 'Designs and oversees construction of infrastructure: bridges, roads, buildings, water systems.', ARRAY['ISTJ','ESTJ','INTJ'], ARRAY['ENFP','ESFP'], ARRAY['C','D'], '{"O":55,"C":85,"E":40,"A":60,"N":30}', 70000, 155000, 'Moderate'),
('Mechanical Engineer', 'Engineering', 'Designs and builds mechanical systems: engines, machines, HVAC, manufacturing equipment.', ARRAY['ISTJ','INTP','ESTJ'], ARRAY['ENFP','ESFP'], ARRAY['C','D'], '{"O":60,"C":80,"E":40,"A":55,"N":30}', 70000, 160000, 'Moderate'),
('Electrical Engineer', 'Engineering', 'Designs and develops electrical systems: circuits, power grids, electronics, control systems.', ARRAY['INTJ','ISTJ','ENTJ'], ARRAY['ESFP','ENFP'], ARRAY['C','D'], '{"O":65,"C":80,"E":40,"A":55,"N":30}', 75000, 165000, 'Moderate'),
('Aerospace Engineer', 'Engineering', 'Designs aircraft, spacecraft, satellites, and defense systems. High-stakes, precision work.', ARRAY['INTJ','ISTJ','ENTJ'], ARRAY['ESFP','ENFP'], ARRAY['C','D'], '{"O":75,"C":80,"E":40,"A":55,"N":35}', 85000, 200000, 'Moderate'),

-- Creative
('Graphic Designer', 'Creative', 'Creates visual communication: logos, branding, ads, packaging, digital assets.', ARRAY['INFP','ENFP','ISFP'], ARRAY['ESTJ','ISTJ'], ARRAY['I','S'], '{"O":85,"C":55,"E":55,"A":65,"N":30}', 50000, 115000, 'Moderate'),
('Content Strategist', 'Creative', 'Plans and manages content across platforms to attract and engage target audiences.', ARRAY['ENFJ','INFP','ENTP'], ARRAY['ISTJ','ESTJ'], ARRAY['I','I'], '{"O":80,"C":60,"E":65,"A":70,"N":35}', 60000, 135000, 'High'),
('Film Director', 'Creative', 'Leads the creative vision and execution of film and video productions.', ARRAY['ENTP','ENFJ','INTJ'], ARRAY['ISFJ','ISTJ'], ARRAY['D','I'], '{"O":90,"C":55,"E":70,"A":55,"N":55}', 50000, 500000, 'Variable'),
('UX Researcher', 'Creative', 'Conducts user research to inform product design decisions. Combines empathy with analysis.', ARRAY['INFJ','INFP','INTJ'], ARRAY['ESTJ','ENTJ'], ARRAY['I','S'], '{"O":85,"C":55,"E":50,"A":75,"N":40}', 70000, 150000, 'High'),

-- Law & Public Service
('Attorney', 'Law', 'Represents clients in legal matters: contracts, litigation, compliance, corporate governance.', ARRAY['INTJ','ENTJ','ESTJ'], ARRAY['INFP','ENFP'], ARRAY['D','C'], '{"O":65,"C":75,"E":45,"A":60,"N":35}', 85000, 300000, 'Moderate'),
('Policy Analyst', 'Law', 'Researches and recommends public policy solutions to government and non-profit organizations.', ARRAY['INFJ','INTJ','ENFJ'], ARRAY['ESFP','ESTJ'], ARRAY['I','C'], '{"O":80,"C":65,"E":45,"A":70,"N":40}', 60000, 140000, 'Moderate'),
('Social Worker', 'Law', 'Supports individuals and families facing hardship. Connects clients to resources and advocates for change.', ARRAY['INFJ','ESFJ','ENFJ'], ARRAY['ENTJ','ESTJ'], ARRAY['S','I'], '{"O":65,"C":55,"E":65,"A":90,"N":55}', 45000, 75000, 'Moderate'),

-- Science & Research
('Research Scientist', 'Science', 'Conducts original research in labs or academia. Designs experiments, analyzes data, publishes findings.', ARRAY['INTP','INTJ','INFJ'], ARRAY['ESFJ','ESTJ'], ARRAY['C','I'], '{"O":90,"C":70,"E":40,"A":55,"N":45}', 65000, 180000, 'Moderate'),
('Biomedical Researcher', 'Science', 'Conducts life sciences research to advance medicine and healthcare treatments.', ARRAY['INTJ','INTP','INFJ'], ARRAY['ESFJ','ESTJ'], ARRAY['C','I'], '{"O":85,"C":70,"E":40,"A":60,"N":45}', 60000, 170000, 'Moderate'),

-- Education
('Professor', 'Education', 'Teaches at the university level while conducting research and publishing academic work.', ARRAY['INTJ','INFJ','ENTJ'], ARRAY['ESFP','ISFP'], ARRAY['I','S'], '{"O":85,"C":70,"E":50,"A":65,"N":35}', 65000, 180000, 'Low'),
('High School Teacher', 'Education', 'Educates adolescents in core subjects or specialized areas. Mentors and manages classrooms.', ARRAY['ENFJ','ESFJ','ISTJ'], ARRAY['INTP','ENTP'], ARRAY['S','I'], '{"O":65,"C":70,"E":70,"A":80,"N":40}', 55000, 95000, 'Low'),
('Instructional Designer', 'Education', 'Creates structured learning experiences and curricula for corporate or academic settings.', ARRAY['INFP','INTJ','INFJ'], ARRAY['ESFP','ESTJ'], ARRAY['I','C'], '{"O":80,"C":70,"E":50,"A":70,"N":35}', 60000, 125000, 'High');

-- Trait Vibes (Big Five quartile descriptions)
INSERT INTO public.trait_vibes (trait, quartile, score_min, score_max, vibe_title, vibe_desc) VALUES
-- Openness
('openness','low',0,25,'The Realist','Prefers the familiar over the novel. Comfortable with routine, concrete tasks, and practical outcomes. Focused on what works rather than what could be.',1),
('openness','low_mid',26,50,'The Traditionalist','Balances practical experience with selective curiosity. Appreciates tradition but can adapt when needed.',2),
('openness','mid_high',51,75,'The Explorer','Naturally curious and creative. Enjoys new ideas, art, and abstract thinking. Comfortable with complexity.',3),
('openness','high',76,100,'The Visionary','Deeply imaginative and novelty-seeking. Highly creative, intellectually engaged, and drawn to unconventional ideas.',4),
-- Conscientiousness
('conscientiousness','low',0,25,'The Free Spirit','Spontaneous and flexible. Prefers keeping options open rather than rigid scheduling. Comfortable with ambiguity.',5),
('conscientiousness','low_mid',26,50,'The Adapter','Balances structure with flexibility. Can meet deadlines but doesn''t obsess over precision.',6),
('conscientiousness','mid_high',51,75,'The Achiever','Organized and goal-oriented. Plans ahead and follows through reliably. Strong self-discipline.',7),
('conscientiousness','high',76,100,'The perfectionist','Extremely organized and driven. Sets high standards and works until they''re met. Highly reliable and detail-focused.',8),
-- Extraversion
('extraversion','low',0,25,'The Introvert','Draws energy from solitude. Prefers deep one-on-one connections over large groups. Deliberate and measured in social settings.',9),
('extraversion','low_mid',26,50,'The Observer','Balances social energy with meaningful alone time. Can engage in groups but doesn''t need it to recharge.',10),
('extraversion','mid_high',51,75,'The Connector','Outgoing and enthusiastic in social situations. Builds wide networks and thrives on interaction.',11),
('extraversion','high',76,100,'The Energizer','Highly enthusiastic and talkative. Draws energy from being around others. Creates momentum wherever they go.',12),
-- Agreeableness
('agreeableness','low',0,25,'The Challenger','Competitive and skeptical. Challenges authority and resists peer pressure. Prioritizes truth over harmony.',13),
('agreeableness','low_mid',26,50,'The Pragmatist','Balances harmony with directness. Can be collaborative but won''t sacrifice results for consensus.',14),
('agreeableness','mid_high',51,75,'The Collaborator','Warm and trusting. Values teamwork and avoids conflict. Good at building cooperative relationships.',15),
('agreeableness','high',76,100,'The Empath','Deeply warm and considerate. Strongly prioritizes others'' needs and maintains close, supportive relationships.',16),
-- Neuroticism
('neuroticism','low',0,25,'The Steady','Emotionally stable and resilient. Handles stress well and maintains calm under pressure.',17),
('neuroticism','low_mid',26,50,'The Balanced','Generally even-tempered with moderate emotional reactivity. Recovers quickly from setbacks.',18),
('neuroticism','mid_high',51,75,'The Sensitive','Reactive to stress and emotionally intense. Highly empathetic but can be overwhelmed by conflict.',19),
('neuroticism','high',76,100,'The Reactive','Experiences strong emotional responses. Highly sensitive to environment and social dynamics.',20);

-- Trait Combinations
INSERT INTO public.trait_combinations (trait_1, trait_1_level, trait_2, trait_2_level, combo_title, combo_desc) VALUES
('openness','high','extraversion','high','The Innovator','Creative and outgoing. Naturally generates novel ideas and rallies people around them. Thrives in dynamic, collaborative environments. Best suited for: entrepreneurship, marketing, product design.'),
('openness','high','conscientiousness','high','The Architect','Imaginative and meticulous. Creates systems and strategies that are both creative and deeply well-crafted. Thrives when given autonomy and complex problems. Best suited for: software architecture, research, strategic consulting.'),
('openness','low','conscientiousness','high','The Expert','Practical and deeply knowledgeable. Prefers depth over breadth. Masters established tools and methods with exceptional precision. Best suited for: engineering, accounting, legal specialties.'),
('extraversion','high','agreeableness','high','The Catalyst','Enthusiastic and warm. Naturally brings groups together and creates positive momentum. Highly persuasive and people-oriented. Best suited for: sales, HR, community building.'),
('extraversion','high','conscientiousness','high','The Driver','Energetic and organized. Combines social momentum with relentless follow-through. Sets big goals and drives teams to achieve them. Best suited for: executive leadership, operations, fundraising.'),
('openness','low','extraversion','low','The Specialist','Deep and focused. Prefers depth over breadth. Comfortable with routine and excels when given clear, well-defined problems. Best suited for: technical specialties, craftsmanship, data analysis.'),
('agreeableness','low','conscientiousness','high','The Enforcer','Direct and principled. Maintains high standards and isn't swayed by social pressure. Logical and systematic. Best suited for: auditing, quality assurance, engineering, law.'),
('openness','high','neuroticism','high','The Artist','Deeply creative and emotionally intense. Experiencing the world at full volume. Channeled well, produces profound creative work. Needs: creative outlets and emotional management strategies.'),
('conscientiousness','high','neuroticism','low','The Stabilizer','Reliable and emotionally steady. The person others turn to when things get hard. Practical, grounded, and consistently present. Best suited for: emergency response, healthcare, project management.'),
('extraversion','high','openness','low','The Ambassador','Outgoing and practical. Excellent at representing organizations and building external relationships without getting lost in abstract theory. Best suited for: business development, public relations, sales.'),
('agreeableness','high','neuroticism','high','The Healer','Deeply empathetic and emotionally attuned. Strong capacity for nurturing and supporting others. At risk of burnout without boundaries. Best suited for: counseling, nursing, social work.'),
('conscientiousness','low','extraversion','low','The Explorer','Independent and spontaneous. Comfortable without fixed plans. Adapts fluidly to whatever arises. Best suited for: travel, journalism, creative consulting.');