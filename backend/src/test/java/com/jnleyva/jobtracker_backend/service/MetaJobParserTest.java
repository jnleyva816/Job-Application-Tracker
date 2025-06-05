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

import java.io.IOException;

@ExtendWith(MockitoExtension.class)
class MetaJobParserTest {

    @Mock
    private WebScrapingUtils webScrapingUtils;

    @InjectMocks
    private MetaJobParser metaJobParser;

    @BeforeEach
    void setUp() {
        lenient().when(webScrapingUtils.cleanText(any())).thenAnswer(invocation -> {
            String input = invocation.getArgument(0);
            return input != null ? input.trim() : null;
        });
        
        lenient().when(webScrapingUtils.extractExperienceLevel(anyString())).thenReturn("MID");
    }

    @Test
    void testCanParse_MetaCareersUrl() {
        String url = "https://metacareers.com/jobs/123456";
        assertThat(metaJobParser.canParse(url)).isTrue();
    }

    @Test
    void testCanParse_FacebookCareersUrl() {
        String url = "https://facebook.com/careers/jobs/123456";
        assertThat(metaJobParser.canParse(url)).isTrue();
    }

    @Test
    void testCanParse_MetaCareersUrlWithSubdomain() {
        String url = "https://www.metacareers.com/jobs/v2/123456";
        assertThat(metaJobParser.canParse(url)).isTrue();
    }

    @Test
    void testCanParse_NonMetaUrl() {
        String url = "https://google.com/careers/jobs/123456";
        assertThat(metaJobParser.canParse(url)).isFalse();
    }

    @Test
    void testCanParse_NullUrl() {
        assertThat(metaJobParser.canParse(null)).isFalse();
    }

    @Test
    void testCanParse_EmptyUrl() {
        assertThat(metaJobParser.canParse("")).isFalse();
    }

    @Test
    void testGetParserName() {
        assertThat(metaJobParser.getParserName()).isEqualTo("META");
    }

    @Test
    void testParse_MetaJobTitle_ExtractsCorrectly() throws IOException {
        String url = "https://metacareers.com/jobs/123456";
        String html = """
            <html>
                <body>
                    <div class="_army">Software Engineer, Infrastructure</div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation(anyString())).thenReturn(
            new WebScrapingUtils.CompensationInfo(null, null)
        );

        JobParseResult result = metaJobParser.parse(url);

        assertThat(result.isSuccessful()).isTrue();
        assertThat(result.getJobTitle()).isEqualTo("Software Engineer, Infrastructure");
        assertThat(result.getCompany()).isEqualTo("Meta");
    }

    @Test
    void testParse_MetaLocations_ExtractsMultipleLocations() throws IOException {
        String url = "https://metacareers.com/jobs/123456";
        String html = """
            <html>
                <body>
                    <div class="_army">Software Engineer</div>
                    <span class="_careersV2RefreshJobDetailPage__location2024">
                        <span>Sunnyvale, CA<span class="_8ois _armd"> • </span></span>
                    </span>
                    <span class="_careersV2RefreshJobDetailPage__location2024">
                        <span>Los Angeles, CA<span class="_8ois _armd"> • </span></span>
                    </span>
                    <span class="_careersV2RefreshJobDetailPage__location2024">
                        <span>Remote, US<span class="_8ois _armd"> • </span></span>
                    </span>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation(anyString())).thenReturn(
            new WebScrapingUtils.CompensationInfo(null, null)
        );

        JobParseResult result = metaJobParser.parse(url);

        assertThat(result.isSuccessful()).isTrue();
        assertThat(result.getLocation()).contains("Sunnyvale, CA");
        assertThat(result.getLocation()).contains("Los Angeles, CA");
        assertThat(result.getLocation()).contains("Remote, US");
    }

    @Test
    void testParse_MetaDescription_ExtractsStructuredContent() throws IOException {
        String url = "https://metacareers.com/jobs/123456";
        String html = """
            <html>
                <body>
                    <div class="_army">Software Engineer</div>
                    <div class="_8muv _ar_h">
                        <div class="_1n-_ _6hy- _94t2">We are the teams who create all of Meta's products used by billions of people around the world.</div>
                        <div class="_1n-z _6hy- _8lfs">Software Engineer, Infrastructure Responsibilities</div>
                        <div>
                            <div class="_1n-_ _6hy- _8lf-">Design core, backend software components</div>
                            <div class="_1n-_ _6hy- _8lf-">Code using primarily C/C++, Java, PHP and Hack</div>
                        </div>
                        <div class="_1n-z _6hy- _8lfs">Minimum Qualifications</div>
                        <div>
                            <div class="_1n-_ _6hy- _8lf-">6+ years of programming experience in a relevant programming language</div>
                            <div class="_1n-_ _6hy- _8lf-">Experience with scripting languages such as Python, Javascript or Hack</div>
                        </div>
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation(anyString())).thenReturn(
            new WebScrapingUtils.CompensationInfo(null, null)
        );

        JobParseResult result = metaJobParser.parse(url);

        assertThat(result.isSuccessful()).isTrue();
        assertThat(result.getDescription()).contains("We are the teams who create all of Meta's products");
        assertThat(result.getDescription()).contains("Responsibilities:");
        assertThat(result.getDescription()).contains("Design core, backend software components");
        assertThat(result.getDescription()).contains("Minimum Qualifications:");
        assertThat(result.getDescription()).contains("6+ years of programming experience");
    }

    @Test
    void testParse_MetaCompensation_ExtractsFromContent() throws IOException {
        String url = "https://metacareers.com/jobs/123456";
        String html = """
            <html>
                <body>
                    <div class="_army">Software Engineer</div>
                    <div class="_8muv _ar_h">
                        <div>Some description text here.</div>
                        <div>$70.67/hour to $208,000/year + bonus + equity + benefits</div>
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation("Some description text here. $70.67/hour to $208,000/year + bonus + equity + benefits"))
            .thenReturn(new WebScrapingUtils.CompensationInfo(139000.0, "ANNUAL"));

        JobParseResult result = metaJobParser.parse(url);

        assertThat(result.isSuccessful()).isTrue();
        assertThat(result.getCompensation()).isEqualTo(139000.0);
        assertThat(result.getCompensationType()).isEqualTo("ANNUAL");
    }

    @Test
    void testParse_ExperienceLevel_ExtractsFromDescription() throws IOException {
        String url = "https://metacareers.com/jobs/123456";
        String html = """
            <html>
                <body>
                    <div class="_army">Senior Software Engineer</div>
                    <div class="_8muv _ar_h">
                        <div>We are looking for a senior engineer with 5+ years of experience.</div>
                    </div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractExperienceLevel("Senior Software Engineer")).thenReturn("SENIOR");
        when(webScrapingUtils.extractCompensation(anyString())).thenReturn(
            new WebScrapingUtils.CompensationInfo(null, null)
        );

        JobParseResult result = metaJobParser.parse(url);

        assertThat(result.isSuccessful()).isTrue();
        assertThat(result.getExperienceLevel()).isEqualTo("SENIOR");
    }

    @Test
    void testParse_FallbackSelectors_WorksWhenMetaSelectorsNotFound() throws IOException {
        String url = "https://metacareers.com/jobs/123456";
        String html = """
            <html>
                <body>
                    <h1 data-testid="job-title">Product Manager</h1>
                    <div data-testid="job-location">Menlo Park, CA</div>
                    <div data-testid="job-description">We are looking for a talented product manager.</div>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation(anyString())).thenReturn(
            new WebScrapingUtils.CompensationInfo(null, null)
        );

        JobParseResult result = metaJobParser.parse(url);

        assertThat(result.isSuccessful()).isTrue();
        assertThat(result.getJobTitle()).isEqualTo("Product Manager");
        assertThat(result.getLocation()).isEqualTo("Menlo Park, CA");
        assertThat(result.getDescription()).isEqualTo("We are looking for a talented product manager.");
    }

    @Test
    void testParse_NetworkError() throws IOException {
        String url = "https://metacareers.com/jobs/123456";
        
        when(webScrapingUtils.fetchDocument(url)).thenThrow(new IOException("Network error"));
        
        JobParseResult result = metaJobParser.parse(url);
        
        assertThat(result.isSuccessful()).isFalse();
        assertThat(result.getSource()).isEqualTo("META");
        assertThat(result.getOriginalUrl()).isEqualTo(url);
        assertThat(result.getErrorMessage()).contains("Network error");
    }

    @Test 
    void testParse_GeneralException() throws IOException {
        String url = "https://metacareers.com/jobs/123456";
        
        when(webScrapingUtils.fetchDocument(url)).thenThrow(new RuntimeException("Test exception"));
        
        JobParseResult result = metaJobParser.parse(url);
        
        assertThat(result.isSuccessful()).isFalse();
        assertThat(result.getSource()).isEqualTo("META");
        assertThat(result.getOriginalUrl()).isEqualTo(url);
        assertThat(result.getErrorMessage()).isNotNull();
    }

    @Test
    void testParse_EmptyHtml_ReturnsSuccessWithNullFields() throws IOException {
        String url = "https://metacareers.com/jobs/123456";
        String html = "<html><body></body></html>";
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation(anyString())).thenReturn(
            new WebScrapingUtils.CompensationInfo(null, null)
        );

        JobParseResult result = metaJobParser.parse(url);

        assertThat(result.isSuccessful()).isTrue();
        assertThat(result.getJobTitle()).isNull();
        assertThat(result.getLocation()).isNull();
        assertThat(result.getDescription()).isNull();
        assertThat(result.getCompany()).isEqualTo("Meta"); // Always set to Meta
    }

    @Test
    void testParse_LocationCleanup_RemovesSeparators() throws IOException {
        String url = "https://metacareers.com/jobs/123456";
        String html = """
            <html>
                <body>
                    <div class="_army">Software Engineer</div>
                    <span class="_careersV2RefreshJobDetailPage__location2024">
                        <span>Seattle, WA<span class="_8ois _armd"> • </span></span>
                    </span>
                    <span class="_careersV2RefreshJobDetailPage__location2024">
                        <span>New York, NY<span class="_8ois _armd"> • </span></span>
                    </span>
                </body>
            </html>
            """;
        
        Document doc = Jsoup.parse(html);
        when(webScrapingUtils.fetchDocument(url)).thenReturn(doc);
        when(webScrapingUtils.extractCompensation(anyString())).thenReturn(
            new WebScrapingUtils.CompensationInfo(null, null)
        );

        JobParseResult result = metaJobParser.parse(url);

        assertThat(result.isSuccessful()).isTrue();
        assertThat(result.getLocation()).isEqualTo("Seattle, WA, New York, NY");
        assertThat(result.getLocation()).doesNotContain("•");
    }
} 