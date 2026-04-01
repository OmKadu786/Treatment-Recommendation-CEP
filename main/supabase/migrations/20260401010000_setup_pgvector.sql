-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table to store the scraped document chunks
CREATE TABLE public.knowledge_base (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  url TEXT,
  embedding VECTOR(768) -- Gemini text-embedding-004 uses 768 dimensions
);

-- Create an RLS policy so edge functions / users can read
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read of knowledge base" ON public.knowledge_base FOR SELECT USING (true);
CREATE POLICY "Allow service role insert" ON public.knowledge_base FOR ALL USING (true); -- simplify for scraper script

-- Create a similarity search function (Cosine Similarity)
CREATE OR REPLACE FUNCTION match_knowledge_base (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  url TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.url,
    1 - (knowledge_base.embedding <=> query_embedding) AS similarity
  FROM knowledge_base
  WHERE 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
$$;
