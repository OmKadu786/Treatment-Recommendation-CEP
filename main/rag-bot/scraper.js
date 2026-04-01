import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

// Load environment variables. Create a .env file locally in this rag-bot folder.
dotenv.config();

// Put the same API key the user provided in .env or hardcode it safely for local scripts
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDNjzAvZLuYXHtk888dt3B9PVYQg1Dn54Y";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * Splits text into chunks of roughly ~500-1000 characters to prevent overflow.
 */
function chunkText(text, maxChars = 1000) {
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
  const chunks = [];
  let currentChunk = "";

  for (const p of paragraphs) {
    if (currentChunk.length + p.length > maxChars) {
      chunks.push(currentChunk.trim());
      currentChunk = p;
    } else {
      currentChunk += " \n" + p;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

/**
 * Pings Google's text-embedding-004 to vectorize the chunk.
 */
async function generateEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
  try {
    const res = await axios.post(url, {
      content: { parts: [{ text }] }
    });
    return res.data.embedding.values; // Returns an array of 768 floats
  } catch (error) {
    console.error("❌ Failed to embed chunk", error?.response?.data || error.message);
    return null;
  }
}

/**
 * Master Scraper Function
 */
async function scrapeAndEmbed(url) {
  console.log(`\n🔍 Scraping URL: ${url}`);
  try {
    // 1. Scrape the URL
    const { data: html } = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36"
        }
    });

    const $ = cheerio.load(html);
    
    // Scrape clean article text (adjust selectors based on target website structure)
    // usually 'p', 'h1', 'h2', 'h3', 'article' or 'div.content'
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    
    console.log(`✅ Text Extracted. Length: ${textContent.length} characters.`);
    
    // 2. Chunk Data
    const chunks = chunkText(textContent);
    console.log(`🔪 Split into ${chunks.length} chunks.`);

    // 3. For each chunk -> Generate Embedding & Upload to Supabase Vector DB
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (chunk.length < 50) continue; // Skip useless snippets
      
      console.log(`   ► Embedding Chunk ${i + 1}/${chunks.length}...`);
      const embedding = await generateEmbedding(chunk);
      
      if (embedding) {
        const { error } = await supabase
          .from('knowledge_base')
          .insert({
            url: url,
            content: chunk,
            embedding: embedding
          });
          
        if (error) {
          console.error(`   ❌ Supabase Insert Error: ${error.message}`);
        } else {
          console.log(`   ✅ DB Upload Successful.`);
        }
      }
    }
    
    console.log(`\n🎉 Finished pipeline for URL!`);

  } catch (error) {
    console.error(`❌ Scraping failed completely for ${url}:`, error.message);
  }
}

// ──────────────────────────────────────────────
// ENTRY POINT
// ──────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);
    const targetUrl = args[0] || "https://en.wikipedia.org/wiki/Transurethral_resection_of_the_prostate";
    
    console.log("=========================================");
    console.log("🤖 MIST-AI RAG Web Scraper & Embedder");
    console.log("=========================================");
    
    await scrapeAndEmbed(targetUrl);
}

main();
