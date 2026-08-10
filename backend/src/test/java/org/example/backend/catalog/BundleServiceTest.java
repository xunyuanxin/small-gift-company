package org.example.backend.catalog;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BundleServiceTest {

    @Mock BundleRepository repo;

    BundleService service;

    @BeforeEach
    void setUp() {
        service = new BundleService(repo);
    }

    // ── search dispatch ────────────────────────────────────────────────────────

    @Test
    void search_noFilters_callsFindAllActive() {
        when(repo.findAllActive()).thenReturn(Collections.emptyList());
        service.search(null, null);
        verify(repo).findAllActive();
        verifyNoMoreInteractions(repo);
    }

    @Test
    void search_emptyTagList_treatedAsNoTagFilter() {
        when(repo.findAllActive()).thenReturn(Collections.emptyList());
        service.search(Collections.emptyList(), null);
        verify(repo).findAllActive();
    }

    @Test
    void search_tagsOnly_callsFindActiveByAllTags() {
        when(repo.findActiveByAllTags(any(), anyLong())).thenReturn(Collections.emptyList());
        service.search(List.of("age:4-8"), null);
        verify(repo).findActiveByAllTags(List.of("age:4-8"), 1L);
    }

    @Test
    void search_priceOnly_callsFindActiveByMaxPrice() {
        when(repo.findActiveByMaxPrice(any())).thenReturn(Collections.emptyList());
        service.search(null, new BigDecimal("10.00"));
        verify(repo).findActiveByMaxPrice(new BigDecimal("10.00"));
    }

    @Test
    void search_tagsAndPrice_callsCombinedQuery() {
        when(repo.findActiveByAllTagsAndMaxPrice(any(), anyLong(), any()))
                .thenReturn(Collections.emptyList());
        service.search(List.of("age:4-8", "interest:art"), new BigDecimal("15.00"));
        verify(repo).findActiveByAllTagsAndMaxPrice(
                List.of("age:4-8", "interest:art"), 2L, new BigDecimal("15.00"));
    }

    @Test
    void search_duplicateTags_deduplicatedBeforeQuery() {
        // Passing the same tag twice must not inflate tagCount — duplicates are stripped
        // before the correlated subquery count is computed.
        when(repo.findActiveByAllTags(any(), anyLong())).thenReturn(Collections.emptyList());
        service.search(List.of("age:4-8", "age:4-8"), null);
        // Must be called with deduplicated list (size 1), not the raw list (size 2).
        verify(repo).findActiveByAllTags(List.of("age:4-8"), 1L);
    }

    // ── getDetail ─────────────────────────────────────────────────────────────

    @Test
    void getDetail_notFound_throws404() {
        when(repo.findByIdAndActiveTrue(anyLong())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getDetail(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not found");
    }
}
