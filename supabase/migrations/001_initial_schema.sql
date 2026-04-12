-- ============================================================
-- AI Daily Terms — Initial Schema Migration
-- ============================================================

-- TERMS
create table if not exists public.terms (
  id uuid primary key default gen_random_uuid(),
  vertical_id text not null default 'general',
  slug text not null,
  term text not null,
  definition text not null,
  example_sentence text,
  category text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  published boolean default false,
  publish_date date,
  created_at timestamptz default now(),
  unique(slug, vertical_id)
);

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  vertical_id text not null default 'general',
  email text,
  full_name text,
  tier text default 'free' check (tier in ('free', 'pro', 'lifetime')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- DAILY_VIEWS
create table if not exists public.daily_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  term_id uuid references public.terms(id) on delete cascade,
  vertical_id text not null default 'general',
  viewed_at date default current_date,
  unique(user_id, viewed_at, vertical_id)
);

-- USER_PROGRESS
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  term_id uuid references public.terms(id) on delete cascade,
  vertical_id text not null default 'general',
  status text check (status in ('seen', 'saved', 'mastered')),
  updated_at timestamptz default now(),
  unique(user_id, term_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.terms enable row level security;
alter table public.profiles enable row level security;
alter table public.daily_views enable row level security;
alter table public.user_progress enable row level security;

-- TERMS: Anyone can read published terms; only service role writes
create policy "Published terms are public"
  on public.terms for select
  using (published = true);

-- PROFILES: Users can only read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- DAILY_VIEWS: Users manage their own views
create policy "Users can view own daily views"
  on public.daily_views for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily views"
  on public.daily_views for insert
  with check (auth.uid() = user_id);

-- USER_PROGRESS: Users manage their own progress
create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can upsert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: Auto-create profile on sign-up
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, vertical_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'vertical_id', 'general')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SEED: 10 sample terms for "general" vertical
-- ============================================================

insert into public.terms (vertical_id, slug, term, definition, example_sentence, category, difficulty, published, publish_date) values
('general', 'large-language-model', 'Large Language Model (LLM)', 'A type of AI model trained on vast amounts of text data that can generate, summarize, translate, and reason about language at a human-like level.', 'GPT-4 and Claude are examples of large language models used in consumer products.', 'Models', 'beginner', true, current_date - interval '9 days'),
('general', 'prompt-engineering', 'Prompt Engineering', 'The practice of designing and refining text inputs (prompts) to guide an AI model toward producing desired outputs.', 'She used prompt engineering techniques like chain-of-thought to improve the model''s reasoning accuracy.', 'Techniques', 'beginner', true, current_date - interval '8 days'),
('general', 'retrieval-augmented-generation', 'Retrieval-Augmented Generation (RAG)', 'A technique that combines an LLM with a retrieval system so the model can look up external documents before generating a response, reducing hallucinations.', 'The customer support bot uses RAG to pull relevant help articles before answering user questions.', 'Architecture', 'intermediate', true, current_date - interval '7 days'),
('general', 'hallucination', 'Hallucination', 'When an AI model confidently generates factually incorrect or entirely fabricated information not supported by its training data or context.', 'The chatbot''s hallucination led it to cite a research paper that doesn''t exist.', 'Concepts', 'beginner', true, current_date - interval '6 days'),
('general', 'fine-tuning', 'Fine-Tuning', 'The process of further training a pre-trained model on a smaller, task-specific dataset to adapt it for a particular use case.', 'The team fine-tuned an open-source LLM on medical notes to improve clinical documentation.', 'Training', 'intermediate', true, current_date - interval '5 days'),
('general', 'embeddings', 'Embeddings', 'Numerical vector representations of text (or other data) that capture semantic meaning, enabling similarity search and clustering.', 'The search engine converts queries into embeddings to find semantically similar documents.', 'Concepts', 'intermediate', true, current_date - interval '4 days'),
('general', 'tokens', 'Tokens', 'The basic units of text that LLMs process — roughly a word or subword. Models have a maximum context window measured in tokens.', 'GPT-4 can process up to 128,000 tokens, roughly equivalent to a short novel.', 'Fundamentals', 'beginner', true, current_date - interval '3 days'),
('general', 'inference', 'Inference', 'The process of running a trained AI model on new input data to generate predictions or outputs, as opposed to the training phase.', 'Inference costs decrease as hardware improves, making AI products cheaper to operate.', 'Fundamentals', 'beginner', true, current_date - interval '2 days'),
('general', 'agent', 'AI Agent', 'An AI system that can autonomously plan and execute multi-step tasks by calling tools, browsing the web, writing code, or interacting with external services.', 'The AI agent booked the flight, sent the calendar invite, and drafted the packing list without human input.', 'Architecture', 'intermediate', true, current_date - interval '1 day'),
('general', 'context-window', 'Context Window', 'The maximum amount of text (measured in tokens) an LLM can process in a single interaction — both the input and the generated output combined.', 'With a 200K context window, the model can analyze an entire codebase in one prompt.', 'Fundamentals', 'beginner', true, current_date)
on conflict (slug, vertical_id) do nothing;
