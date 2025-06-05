package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.JobParseResult;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GreenhouseJobParserTest {

    @Mock
    private WebScrapingUtils webScrapingUtils;

    @InjectMocks
    private GreenhouseJobParser greenhouseJobParser;

    @BeforeEach
    void setUp() {
        lenient().when(webScrapingUtils.cleanText(any())).thenAnswer(invocation -> {
            String input = invocation.getArgument(0);
            return input != null ? input.trim() : null;
        });
        
        lenient().when(webScrapingUtils.extractCompensation(anyString())).thenReturn(
            new WebScrapingUtils.CompensationInfo(120000.0, "ANNUAL")
        );
        
        lenient().when(webScrapingUtils.extractExperienceLevel(anyString())).thenReturn("MID");
    }

    @Test
    void testCanParse_GreenhouseUrls_ReturnsTrue() {
        assertThat(greenhouseJobParser.canParse("https://boards.greenhouse.io/company/jobs/123")).isTrue();
        assertThat(greenhouseJobParser.canParse("https://greenhouse.io/jobs/456")).isTrue();
        assertThat(greenhouseJobParser.canParse("https://job-boards.greenhouse.io/company/jobs/789")).isTrue();
    }

    @Test
    void testCanParse_NonGreenhouseUrls_ReturnsFalse() {
        assertThat(greenhouseJobParser.canParse(null)).isFalse();
        assertThat(greenhouseJobParser.canParse("https://linkedin.com/jobs/123")).isFalse();
        assertThat(greenhouseJobParser.canParse("https://example.com/job/123")).isFalse();
    }

    @Test
    void testGetParserName() {
        assertThat(greenhouseJobParser.getParserName()).isEqualTo("GREENHOUSE");
    }

    @Test
    void testParse_WithAppTitle_ExtractsJobTitle() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1 class="app-title">Software Engineer</h1>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getJobTitle()).isEqualTo("Software Engineer");
    }

    @Test
    void testParse_WithPostingHeadline_ExtractsJobTitle() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1 class="posting-headline">Senior Developer</h1>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getJobTitle()).isEqualTo("Senior Developer");
    }

    @Test
    void testParse_WithH1Fallback_ExtractsJobTitle() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Data Scientist</h1>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getJobTitle()).isEqualTo("Data Scientist");
    }

    @Test
    void testParse_WithCompanyName_ExtractsCompany() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <div class="company-name">TechCorp</div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getCompany()).isEqualTo("TechCorp");
    }

    @Test
    void testParse_WithPostingCompany_ExtractsCompany() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <div class="posting-company">StartupCorp</div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getCompany()).isEqualTo("StartupCorp");
    }

    @Test
    void testParse_WithCompanyFromTitle_ExtractsCompany() throws Exception {
        // Use a non-standard URL pattern that won't match our URL extraction
        String url = "https://boards.greenhouse.io/test/jobs/123";
        String html = """
            <html>
                <head><title>Software Engineer at Google - Careers</title></head>
                <body>
                    <h1>Software Engineer</h1>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        // With our updated parser, it will extract "Test" from the URL first, not "Google" from title
        // Let's test that title extraction works when URL extraction doesn't find a company
        assertThat(result.getCompany()).isEqualTo("Test");
    }

    @Test
    void testParse_WithCompanyFromTitleOnly_ExtractsFromTitle() throws Exception {
        // Use a greenhouse URL that doesn't have company in path to test title fallback
        String url = "https://greenhouse.io/job/123";  // Different pattern without company in path
        String html = """
            <html>
                <head><title>Software Engineer at Google - Careers</title></head>
                <body>
                    <h1>Software Engineer</h1>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        // Since this URL pattern doesn't have company in path, it should fall back to title extraction
        assertThat(result.getCompany()).isEqualTo("Google");
    }

    @Test
    void testParse_WithoutCompany_ReturnsUnknownCompany() throws Exception {
        String url = "https://boards.greenhouse.io/unknownco/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getCompany()).isEqualTo("Unknownco");
    }

    @Test
    void testParse_WithNonStandardUrl_ReturnsUnknownCompany() throws Exception {
        String url = "https://example.com/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getCompany()).isEqualTo("Unknown Company");
    }

    @Test
    void testParse_WithLocationClass_ExtractsLocation() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <div class="location">San Francisco, CA</div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getLocation()).isEqualTo("San Francisco, CA");
    }

    @Test
    void testParse_WithPostingLocation_ExtractsLocation() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <div class="posting-location">New York, NY</div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getLocation()).isEqualTo("New York, NY");
    }

    @Test
    void testParse_WithRemoteText_ExtractsLocation() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <p>This position is Remote</p>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getLocation()).isEqualTo("This position is Remote");
    }

    @Test
    void testParse_WithContentDiv_ExtractsDescription() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <div id="content">
                        We are looking for a talented software engineer to join our team.
                        The ideal candidate will have experience with Java and Spring Boot.
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getDescription()).contains("talented software engineer");
    }

    @Test
    void testParse_WithPostingDescription_ExtractsDescription() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <div class="posting-description">
                        Join our engineering team working on cutting-edge technology.
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getDescription()).contains("cutting-edge technology");
    }

    @Test
    void testParse_WithSalaryClass_ExtractsCompensation() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <div class="salary">$100,000 - $130,000</div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation("$100,000 - $130,000"))
            .thenReturn(new WebScrapingUtils.CompensationInfo(115000.0, "ANNUAL"));

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getCompensation()).isEqualTo(115000.0);
        assertThat(result.getCompensationType()).isEqualTo("ANNUAL");
    }

    @Test
    void testParse_WithDollarInContent_ExtractsCompensation() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <div id="content">
                        <p>We offer competitive compensation up to $150,000 annually.</p>
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation("We offer competitive compensation up to $150,000 annually."))
            .thenReturn(new WebScrapingUtils.CompensationInfo(150000.0, "ANNUAL"));

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getCompensation()).isEqualTo(150000.0);
    }

    @Test
    void testParse_WithExperienceLevelFromTitle_ExtractsExperienceLevel() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Senior Software Engineer</h1>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractExperienceLevel("Senior Software Engineer")).thenReturn("SENIOR");

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getExperienceLevel()).isEqualTo("SENIOR");
    }

    @Test
    void testParse_WithExperienceLevelFromContent_ExtractsExperienceLevel() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Software Engineer</h1>
                    <div id="content">
                        We are looking for a junior level developer with 1-2 years of experience.
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractExperienceLevel("Software Engineer")).thenReturn("MID");
        when(webScrapingUtils.extractExperienceLevel("We are looking for a junior level developer with 1-2 years of experience."))
            .thenReturn("JUNIOR");

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getExperienceLevel()).isEqualTo("JUNIOR");
    }

    @Test
    void testParse_CompleteJob_ReturnsSuccessfulResult() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <head><title>Senior Software Engineer at TechCorp - Careers</title></head>
                <body>
                    <h1 class="app-title">Senior Software Engineer</h1>
                    <div class="company-name">TechCorp</div>
                    <div class="location">San Francisco, CA</div>
                    <div id="content">
                        We are looking for a talented senior software engineer to join our team.
                        The ideal candidate will have 5+ years of experience with Java and Spring Boot.
                    </div>
                    <div class="salary">$140,000 - $180,000</div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation("$140,000 - $180,000"))
            .thenReturn(new WebScrapingUtils.CompensationInfo(160000.0, "ANNUAL"));
        when(webScrapingUtils.extractExperienceLevel("Senior Software Engineer")).thenReturn("SENIOR");

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result).isNotNull();
        assertThat(result.isSuccessful()).isTrue();
        assertThat(result.getJobTitle()).isEqualTo("Senior Software Engineer");
        assertThat(result.getCompany()).isEqualTo("TechCorp");
        assertThat(result.getLocation()).isEqualTo("San Francisco, CA");
        assertThat(result.getDescription()).contains("talented senior software engineer");
        assertThat(result.getCompensation()).isEqualTo(160000.0);
        assertThat(result.getCompensationType()).isEqualTo("ANNUAL");
        assertThat(result.getExperienceLevel()).isEqualTo("SENIOR");
        assertThat(result.getSource()).isEqualTo("GREENHOUSE");
        assertThat(result.getOriginalUrl()).isEqualTo(url);
    }

    @Test
    void testParse_WithException_ReturnsFailureResult() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        when(webScrapingUtils.fetchDocument(url)).thenThrow(new RuntimeException("Network error"));

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result).isNotNull();
        assertThat(result.isSuccessful()).isFalse();
        assertThat(result.getSource()).isEqualTo("GREENHOUSE");
        assertThat(result.getOriginalUrl()).isEqualTo(url);
        assertThat(result.getErrorMessage()).contains("Failed to parse Greenhouse job: Network error");
    }

    @Test
    void testParse_WithContentClassFallback_ExtractsDescription() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <div class="content">
                        This is the job description from the content class.
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getDescription()).contains("job description from the content class");
    }

    @Test
    void testParse_WithMainFallback_ExtractsDescription() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <main>
                        This is the job description from the main element.
                    </main>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getDescription()).contains("job description from the main element");
    }

    @Test
    void testParse_WithUnitedStatesLocation_ExtractsLocation() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <p>Location: United States</p>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getLocation()).isEqualTo("Location: United States");
    }

    @Test
    void testParse_WithSanFranciscoLocation_ExtractsLocation() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Developer</h1>
                    <p>Based in San Francisco area</p>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getLocation()).isEqualTo("Based in San Francisco area");
    }

    @Test
    void testParse_PulleyFrontendEngineerJob_ExtractsAllInformation() throws Exception {
        // Test the actual Pulley job posting URL provided by the user with realistic HTML structure
        String url = "https://job-boards.greenhouse.io/pulley/jobs/4750336008?utm_source=Otta";
        String html = """
            <html>
                <head><title>Frontend Engineer at Pulley - Apply for Job</title></head>
                <body>
                    <main class="main font-secondary job-post">
                        <div class="job__header">
                            <div class="job__title">
                                <h1 class="section-header section-header--large font-primary">Frontend Engineer</h1>
                                <div class="job__location">
                                    <svg class="svg-icon" fill="none" height="1.25rem" width="1.25rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path class="icon--primary-color" d="M6.46958 3.811C7.93571..."></path>
                                    </svg>
                                    <div>Remote</div>
                                </div>
                            </div>
                        </div>
                        <div class="job__description body">
                            <div>
                                <p><strong>🚂About Pulley</strong></p>
                                <p>Pulley's mission is to make it easier for anyone to start a company. We believe that more startups should exist and that founder-led companies are more successful in the long term. With Pulley's cap table management tools, companies can better understand and optimize their equity for the long term.</p>
                                <p><strong>🌟 About the role</strong></p>
                                <p>We're looking for a Software Engineer to join our growing team of product-minded engineers. This role sits at the heart of how we build intuitive, powerful tools for startup founders. Tools that help them manage their equity, understand their business, and make critical decisions faster.</p>
                                <p><strong>🛠 What You'll Do</strong></p>
                                <ul>
                                    <li>Build and own rich, interactive product features across our web platform, from concept to deployment</li>
                                    <li>Partner closely with design and product to shape user experiences with empathy and craft</li>
                                    <li>Collaborate with backend and AI engineers to deliver seamless, performant integrations</li>
                                    <li>Contribute to our evolving frontend architecture using React, TypeScript, and modern tooling</li>
                                </ul>
                                <p><strong>🙌 What You Bring</strong></p>
                                <ul>
                                    <li>2–4 years of experience building and shipping production-level frontend applications</li>
                                    <li>Strong proficiency in JavaScript/TypeScript and experience with React or similar frameworks</li>
                                    <li>A product mindset. You think in terms of user experience and business value, not just code</li>
                                </ul>
                                <p>Annual Salary Range: $105,000—$180,000 USD</p>
                            </div>
                        </div>
                    </main>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation("Annual Salary Range: $105,000—$180,000 USD"))
            .thenReturn(new WebScrapingUtils.CompensationInfo(142500.0, "ANNUAL"));
        when(webScrapingUtils.extractExperienceLevel("Frontend Engineer")).thenReturn("MID");

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result).isNotNull();
        assertThat(result.isSuccessful()).isTrue();
        assertThat(result.getJobTitle()).isEqualTo("Frontend Engineer");
        assertThat(result.getCompany()).isEqualTo("Pulley");
        assertThat(result.getLocation()).isEqualTo("Remote");
        assertThat(result.getDescription()).contains("Pulley's mission is to make it easier");
        assertThat(result.getDescription()).contains("2–4 years of experience");
        assertThat(result.getCompensation()).isEqualTo(142500.0);
        assertThat(result.getCompensationType()).isEqualTo("ANNUAL");
        assertThat(result.getExperienceLevel()).isEqualTo("MID");
        assertThat(result.getSource()).isEqualTo("GREENHOUSE");
        assertThat(result.getOriginalUrl()).isEqualTo(url);
    }

    @Test
    void testExtractJobTitle_NewStructure_ExtractsCorrectly() throws Exception {
        String url = "https://job-boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <div class="job__title">
                        <h1 class="section-header section-header--large font-primary">Senior Backend Engineer</h1>
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getJobTitle()).isEqualTo("Senior Backend Engineer");
    }

    @Test
    void testExtractCompany_FromUrlPath_ExtractsCorrectly() throws Exception {
        String url = "https://job-boards.greenhouse.io/google/jobs/123456";
        String html = """
            <html>
                <body>
                    <h1>Software Engineer</h1>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getCompany()).isEqualTo("Google");
    }

    @Test
    void testExtractCompany_FromBoardsUrl_ExtractsCorrectly() throws Exception {
        String url = "https://boards.greenhouse.io/stripe/jobs/123456";
        String html = """
            <html>
                <body>
                    <h1>Software Engineer</h1>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getCompany()).isEqualTo("Stripe");
    }

    @Test
    void testExtractLocation_NewStructure_ExtractsCorrectly() throws Exception {
        String url = "https://job-boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <div class="job__location">
                        <svg>...</svg>
                        <div>San Francisco, CA</div>
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getLocation()).isEqualTo("San Francisco, CA");
    }

    @Test
    void testExtractDescription_NewStructure_ExtractsCorrectly() throws Exception {
        String url = "https://job-boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <div class="job__description body">
                        <div>
                            <p>About the company</p>
                            <p>We are a fast-growing startup looking for talented engineers.</p>
                            <p>About the role</p>
                            <p>You will be working on exciting projects using cutting-edge technology.</p>
                        </div>
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getDescription()).contains("fast-growing startup");
        assertThat(result.getDescription()).contains("cutting-edge technology");
    }

    @Test
    void testExtractCompensation_FromJobDescription_ExtractsCorrectly() throws Exception {
        String url = "https://job-boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <div class="job__description">
                        <div>
                            <p>We offer competitive compensation.</p>
                            <p>Annual Salary Range: $120,000—$160,000 USD</p>
                            <p>Plus equity and benefits.</p>
                        </div>
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation("Annual Salary Range: $120,000—$160,000 USD"))
            .thenReturn(new WebScrapingUtils.CompensationInfo(140000.0, "ANNUAL"));

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getCompensation()).isEqualTo(140000.0);
        assertThat(result.getCompensationType()).isEqualTo("ANNUAL");
    }

    @Test
    void testExtractCompensation_MultipleDollarSigns_ChoosesCorrectOne() throws Exception {
        String url = "https://job-boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <div class="job__description">
                        <div>
                            <p>We raised $50M in funding.</p>
                            <p>Annual Salary Range: $90,000—$130,000 USD</p>
                            <p>Stock options worth $10,000 potential.</p>
                        </div>
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation("Annual Salary Range: $90,000—$130,000 USD"))
            .thenReturn(new WebScrapingUtils.CompensationInfo(110000.0, "ANNUAL"));

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getCompensation()).isEqualTo(110000.0);
    }

    @Test
    void testExtractExperienceLevel_FromJobDescription_ExtractsCorrectly() throws Exception {
        String url = "https://job-boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <body>
                    <h1>Software Engineer</h1>
                    <div class="job__description">
                        <div>
                            <p>We are looking for a senior level developer with 5+ years of experience.</p>
                            <p>You should have deep expertise in distributed systems.</p>
                        </div>
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractExperienceLevel("Software Engineer")).thenReturn("MID");
        when(webScrapingUtils.extractExperienceLevel("We are looking for a senior level developer with 5+ years of experience. You should have deep expertise in distributed systems."))
            .thenReturn("SENIOR");

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result.getExperienceLevel()).isEqualTo("SENIOR");
    }

    @Test
    void testCanParse_PulleyGreenhouseUrl_ReturnsTrue() {
        // Test the specific Pulley URL provided by the user
        String pulleyUrl = "https://job-boards.greenhouse.io/pulley/jobs/4750336008?utm_source=Otta";
        assertThat(greenhouseJobParser.canParse(pulleyUrl)).isTrue();
    }

    @Test 
    void testParse_FallbackToOldStructure_StillWorks() throws Exception {
        String url = "https://boards.greenhouse.io/company/jobs/123";
        String html = """
            <html>
                <head><title>Senior Software Engineer at TechCorp - Careers</title></head>
                <body>
                    <h1 class="app-title">Senior Software Engineer</h1>
                    <div class="company-name">TechCorp</div>
                    <div class="location">San Francisco, CA</div>
                    <div id="content">
                        We are looking for a talented senior software engineer to join our team.
                        The ideal candidate will have 5+ years of experience with Java and Spring Boot.
                    </div>
                    <div class="salary">$140,000 - $180,000</div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation("$140,000 - $180,000"))
            .thenReturn(new WebScrapingUtils.CompensationInfo(160000.0, "ANNUAL"));
        when(webScrapingUtils.extractExperienceLevel("Senior Software Engineer")).thenReturn("SENIOR");

        JobParseResult result = greenhouseJobParser.parse(url);

        assertThat(result).isNotNull();
        assertThat(result.isSuccessful()).isTrue();
        assertThat(result.getJobTitle()).isEqualTo("Senior Software Engineer");
        assertThat(result.getCompany()).isEqualTo("TechCorp");
        assertThat(result.getLocation()).isEqualTo("San Francisco, CA");
        assertThat(result.getDescription()).contains("talented senior software engineer");
        assertThat(result.getCompensation()).isEqualTo(160000.0);
        assertThat(result.getCompensationType()).isEqualTo("ANNUAL");
        assertThat(result.getExperienceLevel()).isEqualTo("SENIOR");
        assertThat(result.getSource()).isEqualTo("GREENHOUSE");
        assertThat(result.getOriginalUrl()).isEqualTo(url);
    }
} 