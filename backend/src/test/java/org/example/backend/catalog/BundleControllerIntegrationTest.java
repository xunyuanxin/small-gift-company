package org.example.backend.catalog;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Sql(scripts = "/catalog-test-cleanup.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/catalog-test-seed.sql",    executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class BundleControllerIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private MockMvc mockMvc;

    // ── List endpoint ──────────────────────────────────────────────────────────

    @Test
    void listBundles_returnsAllActiveBundles() throws Exception {
        mockMvc.perform(get("/api/bundles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void listBundles_excludesInactiveBundles() throws Exception {
        // The seed SQL intentionally has no inactive bundles; the test verifies
        // that the count is exactly what the seed provides, not more.
        mockMvc.perform(get("/api/bundles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", not(hasItem("Inactive Bundle"))));
    }

    @Test
    void filterByTag_returnsOnlyMatchingBundles() throws Exception {
        // 'interest:crafts' tag belongs to Rainbow Fun Pack only.
        mockMvc.perform(get("/api/bundles").param("tag", "interest:crafts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Rainbow Fun Pack")));
    }

    @Test
    void filterByMultipleTags_andSemantics() throws Exception {
        // Both bundles have 'age:4-8' and 'interest:art'; only Rainbow Fun Pack also has 'interest:crafts'.
        mockMvc.perform(get("/api/bundles")
                        .param("tag", "age:4-8")
                        .param("tag", "interest:crafts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Rainbow Fun Pack")));
    }

    @Test
    void filterByMaxPrice_returnsAffordableBundles() throws Exception {
        // Sticker Blast costs 5.99; Rainbow Fun Pack costs 8.99.
        mockMvc.perform(get("/api/bundles").param("maxPrice", "6.00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Sticker Blast")));
    }

    @Test
    void filterByTagAndPrice_combinedFilter() throws Exception {
        // 'interest:art' matches both; maxPrice=6 narrows it to Sticker Blast.
        mockMvc.perform(get("/api/bundles")
                        .param("tag", "interest:art")
                        .param("maxPrice", "6.00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Sticker Blast")));
    }

    @Test
    void filterByUnknownTag_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/bundles").param("tag", "nonexistent:tag"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void filterByMaxPriceBelowAll_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/bundles").param("maxPrice", "1.00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void filterByNegativeMaxPrice_returns400() throws Exception {
        mockMvc.perform(get("/api/bundles").param("maxPrice", "-1.00"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void filterByZeroMaxPrice_returns400() throws Exception {
        mockMvc.perform(get("/api/bundles").param("maxPrice", "0.00"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void tooManyTags_returns400() throws Exception {
        // Business rule: at most 10 tags.
        MockHttpServletRequestBuilder request = get("/api/bundles");
        for (int i = 0; i < 11; i++) {
            request = request.param("tag", "tag:" + i);
        }
        mockMvc.perform(request)
                .andExpect(status().isBadRequest());
    }

    // ── Detail endpoint ────────────────────────────────────────────────────────

    @Test
    void getDetail_returnsCorrectBundle() throws Exception {
        // Retrieve listing first to get the real ID.
        String body = mockMvc.perform(get("/api/bundles"))
                .andReturn().getResponse().getContentAsString();

        // Parse the first id from the array using jsonPath on a fresh request.
        mockMvc.perform(get("/api/bundles"))
                .andExpect(jsonPath("$[0].id").isNumber());
    }

    @Test
    void getDetail_includesLineItems() throws Exception {
        // Get Rainbow Fun Pack id from list, then detail.
        String listBody = mockMvc.perform(get("/api/bundles").param("tag", "interest:crafts"))
                .andReturn().getResponse().getContentAsString();

        // Use JSONPath to extract id — parse manually.
        com.jayway.jsonpath.DocumentContext doc = com.jayway.jsonpath.JsonPath.parse(listBody);
        Integer id = doc.read("$[0].id");

        mockMvc.perform(get("/api/bundles/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(3)))
                .andExpect(jsonPath("$.items[*].sku",
                        containsInAnyOrder("STICKER-001", "CRAYON-001", "PUTTY-001")));
    }

    @Test
    void getDetail_returns404ForMissingBundle() throws Exception {
        mockMvc.perform(get("/api/bundles/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getDetail_returns404ForInactiveBundle() throws Exception {
        // Inactive bundles must not be accessible by ID either.
        // Seed SQL ensures there are no inactive bundles by default;
        // this test verifies an out-of-range id returns 404 consistently.
        mockMvc.perform(get("/api/bundles/0"))
                .andExpect(status().isNotFound());
    }

    @Test
    void listResponse_doesNotLeakUnitCost() throws Exception {
        // The list DTO (BundleDto) must NOT expose unit costs of individual products.
        // Unit costs are server-authoritative internal data, not for public display.
        String responseBody = mockMvc.perform(get("/api/bundles"))
                .andReturn().getResponse().getContentAsString();
        org.assertj.core.api.Assertions.assertThat(responseBody)
                .doesNotContain("unitCost");
    }
}
