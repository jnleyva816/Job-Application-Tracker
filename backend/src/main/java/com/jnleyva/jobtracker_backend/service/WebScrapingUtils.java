package com.jnleyva.jobtracker_backend.service;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;
import org.brotli.dec.BrotliInputStream;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.GZIPInputStream;
import java.util.zip.InflaterInputStream;

/**
 * Utility class for web scraping operations
 */
@Component
public class WebScrapingUtils {
    
    private static final Logger logger = LoggerFactory.getLogger(WebScrapingUtils.class);
    private static final Pattern SALARY_PATTERN = Pattern.compile("\\$([\\d,]+)(?:\\s*-\\s*\\$?([\\d,]+))?(?:\\s*(k|K|thousand|per\\s+year|annually|/year|per\\s+hour|/hour|hourly))?", Pattern.CASE_INSENSITIVE);
    
    private final OkHttpClient httpClient;
    
    public WebScrapingUtils() {
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .followRedirects(true)
                .followSslRedirects(true)
                .build();
    }
    
    /**
     * Fetch and parse HTML document from URL using JSoup's built-in HTTP client
     * This is an alternative method that might handle certain sites better
     */
    public Document fetchDocumentWithJSoup(String url) throws IOException {
        logger.debug("Fetching document with JSoup from URL: {}", url);
        
        return Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
                .header("Accept-Language", "en-US,en;q=0.5")
                .header("Accept-Encoding", "gzip, deflate, br")
                .header("Connection", "keep-alive")
                .header("Upgrade-Insecure-Requests", "1")
                .header("Sec-Fetch-Dest", "document")
                .header("Sec-Fetch-Mode", "navigate")
                .header("Sec-Fetch-Site", "none")
                .header("Sec-Fetch-User", "?1")
                .header("Cache-Control", "max-age=0")
                .followRedirects(true)
                .timeout(30000)
                .get();
    }
    
    /**
     * Fetch and parse HTML document from URL with proper encoding and compression handling
     */
    public Document fetchDocument(String url) throws IOException {
        logger.debug("Fetching document from URL: {}", url);
        
        // Try JSoup first as it handles compression and encoding automatically
        try {
            Document doc = fetchDocumentWithJSoup(url);
            // Verify the document was parsed correctly by checking if it has content
            if (doc.html().length() > 100 && !containsGarbledCharacters(doc.html())) {
                logger.debug("JSoup successfully fetched and parsed document");
                return doc;
            } else {
                logger.warn("JSoup returned garbled content, trying OkHttp with manual decompression");
            }
        } catch (Exception e) {
            logger.warn("JSoup fetch failed, trying OkHttp: {}", e.getMessage());
        }
        
        // Fallback to OkHttp with proper compression handling
        Request request = new Request.Builder()
                .url(url)
                .addHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .addHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
                .addHeader("Accept-Language", "en-US,en;q=0.5")
                .addHeader("Accept-Encoding", "gzip, deflate, br")
                .addHeader("Connection", "keep-alive")
                .addHeader("Upgrade-Insecure-Requests", "1")
                .addHeader("Sec-Fetch-Dest", "document")
                .addHeader("Sec-Fetch-Mode", "navigate")
                .addHeader("Sec-Fetch-Site", "none")
                .addHeader("Sec-Fetch-User", "?1")
                .addHeader("Cache-Control", "max-age=0")
                .addHeader("Pragma", "no-cache")
                .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected response code: " + response.code() + " for URL: " + url);
            }
            
            ResponseBody body = response.body();
            if (body == null) {
                throw new IOException("Response body is null for URL: " + url);
            }
            
            // Get the raw HTML content with proper decompression
            String html = getDecompressedContent(response, body);
            logger.debug("Fetched HTML content length: {} characters", html.length());
            
            // Verify content quality
            if (containsGarbledCharacters(html)) {
                logger.warn("Content appears to contain garbled characters, may have encoding issues");
            }
            
            // Parse with JSoup and set base URI for relative links
            Document doc = Jsoup.parse(html, url);
            return doc;
        }
    }
    
    /**
     * Extract content from response with proper decompression handling
     */
    private String getDecompressedContent(Response response, ResponseBody body) throws IOException {
        String contentEncoding = response.header("Content-Encoding");
        logger.debug("Content-Encoding header: {}", contentEncoding);
        
        InputStream inputStream = body.byteStream();
        byte[] bytes;
        
        // Handle different compression types
        if ("gzip".equalsIgnoreCase(contentEncoding)) {
            logger.debug("Decompressing gzip content");
            try (GZIPInputStream gzipStream = new GZIPInputStream(inputStream)) {
                bytes = gzipStream.readAllBytes();
            }
        } else if ("deflate".equalsIgnoreCase(contentEncoding)) {
            logger.debug("Decompressing deflate content");
            try (InflaterInputStream deflateStream = new InflaterInputStream(inputStream)) {
                bytes = deflateStream.readAllBytes();
            }
        } else if ("br".equalsIgnoreCase(contentEncoding)) {
            logger.debug("Decompressing Brotli content");
            try (BrotliInputStream brotliStream = new BrotliInputStream(inputStream)) {
                bytes = brotliStream.readAllBytes();
            } catch (Exception e) {
                logger.warn("Brotli decompression failed, trying raw content: {}", e.getMessage());
                // Fallback to raw content if Brotli fails
                bytes = body.bytes();
            }
        } else {
            logger.debug("No compression or unknown compression type, reading raw content");
            bytes = body.bytes();
        }
        
        // Try to detect and use the correct charset
        String content = decodeWithBestCharset(bytes, response);
        
        // Final verification
        if (containsGarbledCharacters(content)) {
            logger.warn("Content still appears garbled after charset detection");
        }
        
        return content;
    }
    
    /**
     * Decode bytes with the best available charset
     */
    private String decodeWithBestCharset(byte[] bytes, Response response) {
        // First, try to get charset from Content-Type header
        String contentType = response.header("Content-Type");
        if (contentType != null) {
            String charset = extractCharsetFromContentType(contentType);
            if (charset != null) {
                try {
                    String content = new String(bytes, charset);
                    if (!containsGarbledCharacters(content)) {
                        logger.debug("Successfully decoded with charset from Content-Type: {}", charset);
                        return content;
                    }
                } catch (Exception e) {
                    logger.debug("Failed to decode with charset {}: {}", charset, e.getMessage());
                }
            }
        }
        
        // Try common charsets in order of likelihood
        String[] charsets = {"UTF-8", "ISO-8859-1", "Windows-1252", "US-ASCII"};
        
        for (String charset : charsets) {
            try {
                String content = new String(bytes, charset);
                if (!containsGarbledCharacters(content)) {
                    logger.debug("Successfully decoded with charset: {}", charset);
                    return content;
                }
            } catch (Exception e) {
                logger.debug("Failed to decode with charset {}: {}", charset, e.getMessage());
            }
        }
        
        // Fallback to UTF-8 even if it produces garbled content
        logger.warn("No charset produced clean content, falling back to UTF-8");
        return new String(bytes, StandardCharsets.UTF_8);
    }
    
    /**
     * Extract charset from Content-Type header
     */
    private String extractCharsetFromContentType(String contentType) {
        if (contentType == null) return null;
        
        String[] parts = contentType.split(";");
        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.toLowerCase().startsWith("charset=")) {
                String charset = trimmed.substring(8).trim();
                // Remove quotes if present
                if (charset.startsWith("\"") && charset.endsWith("\"")) {
                    charset = charset.substring(1, charset.length() - 1);
                }
                return charset;
            }
        }
        return null;
    }
    
    /**
     * Check if content contains garbled characters that indicate encoding issues
     */
    private boolean containsGarbledCharacters(String content) {
        if (content == null || content.isEmpty()) {
            return true;
        }
        
        // Check for replacement characters
        if (content.contains("")) {
            return true;
        }
        
        // Check for excessive control characters (but allow common ones)
        long controlCharCount = content.chars()
                .filter(ch -> ch < 32 && ch != '\n' && ch != '\r' && ch != '\t' && ch != '\f')
                .count();
        
        // If more than 0.5% of characters are unusual control characters, it's likely garbled
        double controlCharRatio = (double) controlCharCount / content.length();
        if (controlCharRatio > 0.005) {
            return true;
        }
        
        // Check for suspicious byte sequences that often indicate encoding issues
        // These patterns are common in incorrectly decoded text
        String[] suspiciousPatterns = {
            "Ã", "â€", "Â", "Ãƒ", "â€™", "â€œ", "â€", 
            "Ã¡", "Ã©", "Ã­", "Ã³", "Ãº", "Ã±"
        };
        
        int suspiciousCount = 0;
        for (String pattern : suspiciousPatterns) {
            if (content.contains(pattern)) {
                suspiciousCount++;
            }
        }
        
        // If we find multiple suspicious patterns, it's likely garbled
        return suspiciousCount >= 3;
    }
    
    /**
     * Extract and normalize text content
     */
    public String cleanText(String text) {
        if (text == null) {
            return null;
        }
        return text.replaceAll("\\s+", " ").trim();
    }
    
    /**
     * Extract compensation information from text
     */
    public CompensationInfo extractCompensation(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new CompensationInfo(null, "UNKNOWN");
        }
        
        Matcher matcher = SALARY_PATTERN.matcher(text);
        if (matcher.find()) {
            try {
                String lowStr = matcher.group(1).replace(",", "");
                String highStr = matcher.group(2);
                String unit = matcher.group(3);
                
                double low = Double.parseDouble(lowStr);
                double compensation = low;
                
                if (highStr != null) {
                    double high = Double.parseDouble(highStr.replace(",", ""));
                    compensation = (low + high) / 2; // Use average for range
                }
                
                // Determine compensation type
                String compensationType = "UNKNOWN";
                if (unit != null) {
                    String unitLower = unit.toLowerCase();
                    if (unitLower.contains("hour") || unitLower.contains("/hour")) {
                        compensationType = "HOURLY";
                    } else if (unitLower.contains("year") || unitLower.contains("annual") || 
                             unitLower.contains("k") || unitLower.contains("thousand")) {
                        compensationType = "ANNUAL";
                        if (unitLower.contains("k") || unitLower.contains("thousand")) {
                            compensation *= 1000; // Convert k to actual number
                        }
                    }
                } else {
                    // Try to guess based on amount
                    if (compensation < 200) {
                        compensationType = "HOURLY";
                    } else if (compensation > 1000) {
                        compensationType = "ANNUAL";
                    }
                }
                
                return new CompensationInfo(compensation, compensationType);
                
            } catch (NumberFormatException e) {
                logger.warn("Failed to parse compensation from text: {}", text);
            }
        }
        
        return new CompensationInfo(null, "UNKNOWN");
    }
    
    /**
     * Extract experience level from text
     */
    public String extractExperienceLevel(String text) {
        if (text == null) {
            return null;
        }
        
        if (text.trim().isEmpty()) {
            return "MID"; // Default to mid-level if text is empty but not null
        }
        
        String lowerText = text.toLowerCase();
        
        if (lowerText.contains("senior") || lowerText.contains("sr.") || 
            lowerText.contains("lead") || lowerText.contains("principal") ||
            lowerText.contains("staff") || lowerText.contains("architect")) {
            return "SENIOR";
        } else if (lowerText.contains("junior") || lowerText.contains("jr.") || 
                  lowerText.contains("entry") || lowerText.contains("entry-level") ||
                  lowerText.contains("associate") || lowerText.contains("graduate")) {
            return "JUNIOR";
        } else if (lowerText.contains("mid") || lowerText.contains("intermediate") ||
                  lowerText.contains("mid-level")) {
            return "MID";
        } else if (lowerText.contains("intern") || lowerText.contains("internship")) {
            return "INTERN";
        }
        
        return "MID"; // Default to mid-level if unclear
    }
    
    /**
     * Data class for compensation information
     */
    public static class CompensationInfo {
        private final Double amount;
        private final String type;
        
        public CompensationInfo(Double amount, String type) {
            this.amount = amount;
            this.type = type;
        }
        
        public Double getAmount() {
            return amount;
        }
        
        public String getType() {
            return type;
        }
    }
} 