package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

type TrafficHandler struct {
	DB *gorm.DB
}

// =================== Traffic Rules ===================

func (h *TrafficHandler) ListRules(c *gin.Context) {
	var rules []model.TrafficRule
	query := h.DB.Order("created_at DESC")

	if ruleType := c.Query("type"); ruleType != "" {
		query = query.Where("type = ?", ruleType)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if serviceID := c.Query("service_id"); serviceID != "" {
		query = query.Where("service_id = ?", serviceID)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	offset := (page - 1) * pageSize

	var total int64
	query.Model(&model.TrafficRule{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&rules)

	c.JSON(http.StatusOK, gin.H{
		"data":      rules,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *TrafficHandler) GetRule(c *gin.Context) {
	id := c.Param("id")
	var rule model.TrafficRule
	if err := h.DB.First(&rule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "traffic rule not found"})
		return
	}
	c.JSON(http.StatusOK, rule)
}

func (h *TrafficHandler) CreateRule(c *gin.Context) {
	var rule model.TrafficRule
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	rule.Status = "active"
	if err := h.DB.Create(&rule).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create traffic rule"})
		return
	}
	c.JSON(http.StatusCreated, rule)
}

func (h *TrafficHandler) UpdateRule(c *gin.Context) {
	id := c.Param("id")
	var rule model.TrafficRule
	if err := h.DB.First(&rule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "traffic rule not found"})
		return
	}
	if err := c.ShouldBindJSON(&rule); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Save(&rule)
	c.JSON(http.StatusOK, rule)
}

func (h *TrafficHandler) DeleteRule(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&model.TrafficRule{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete traffic rule"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "traffic rule deleted"})
}

func (h *TrafficHandler) ToggleRule(c *gin.Context) {
	id := c.Param("id")
	var rule model.TrafficRule
	if err := h.DB.First(&rule, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "traffic rule not found"})
		return
	}
	if rule.Status == "active" {
		rule.Status = "disabled"
	} else {
		rule.Status = "active"
	}
	h.DB.Save(&rule)
	c.JSON(http.StatusOK, rule)
}

// =================== A/B Testing ===================

func (h *TrafficHandler) ListABTests(c *gin.Context) {
	var tests []model.ABTest
	query := h.DB.Order("created_at DESC")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	offset := (page - 1) * pageSize

	var total int64
	query.Model(&model.ABTest{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&tests)

	c.JSON(http.StatusOK, gin.H{
		"data":      tests,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *TrafficHandler) GetABTest(c *gin.Context) {
	id := c.Param("id")
	var test model.ABTest
	if err := h.DB.Preload("Variants").First(&test, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "A/B test not found"})
		return
	}
	c.JSON(http.StatusOK, test)
}

func (h *TrafficHandler) CreateABTest(c *gin.Context) {
	var test model.ABTest
	if err := c.ShouldBindJSON(&test); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	test.Status = "draft"
	if err := h.DB.Create(&test).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create A/B test"})
		return
	}
	c.JSON(http.StatusCreated, test)
}

func (h *TrafficHandler) UpdateABTest(c *gin.Context) {
	id := c.Param("id")
	var test model.ABTest
	if err := h.DB.First(&test, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "A/B test not found"})
		return
	}
	if err := c.ShouldBindJSON(&test); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Save(&test)
	c.JSON(http.StatusOK, test)
}

func (h *TrafficHandler) StartABTest(c *gin.Context) {
	id := c.Param("id")
	var test model.ABTest
	if err := h.DB.First(&test, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "A/B test not found"})
		return
	}
	now := time.Now()
	test.Status = "running"
	test.StartedAt = &now
	h.DB.Save(&test)
	c.JSON(http.StatusOK, test)
}

func (h *TrafficHandler) StopABTest(c *gin.Context) {
	id := c.Param("id")
	var test model.ABTest
	if err := h.DB.First(&test, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "A/B test not found"})
		return
	}
	now := time.Now()
	test.Status = "completed"
	test.EndedAt = &now
	h.DB.Save(&test)
	c.JSON(http.StatusOK, test)
}

func (h *TrafficHandler) DeleteABTest(c *gin.Context) {
	id := c.Param("id")
	h.DB.Where("ab_test_id = ?", id).Delete(&model.ABTestVariant{})
	if err := h.DB.Delete(&model.ABTest{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete A/B test"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "A/B test deleted"})
}

// =================== Rate Limiting ===================

func (h *TrafficHandler) ListRateLimits(c *gin.Context) {
	var limits []model.RateLimit
	query := h.DB.Order("created_at DESC")

	if scope := c.Query("scope"); scope != "" {
		query = query.Where("scope = ?", scope)
	}

	query.Find(&limits)
	c.JSON(http.StatusOK, limits)
}

func (h *TrafficHandler) CreateRateLimit(c *gin.Context) {
	var limit model.RateLimit
	if err := c.ShouldBindJSON(&limit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	limit.Status = "active"
	if err := h.DB.Create(&limit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create rate limit"})
		return
	}
	c.JSON(http.StatusCreated, limit)
}

func (h *TrafficHandler) UpdateRateLimit(c *gin.Context) {
	id := c.Param("id")
	var limit model.RateLimit
	if err := h.DB.First(&limit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "rate limit not found"})
		return
	}
	if err := c.ShouldBindJSON(&limit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Save(&limit)
	c.JSON(http.StatusOK, limit)
}

func (h *TrafficHandler) DeleteRateLimit(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&model.RateLimit{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete rate limit"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "rate limit deleted"})
}

// =================== Circuit Breaker ===================

func (h *TrafficHandler) ListCircuitBreakers(c *gin.Context) {
	var breakers []model.CircuitBreaker
	query := h.DB.Order("created_at DESC")

	if status := c.Query("status"); status != "" {
		query = query.Where("state = ?", status)
	}

	query.Find(&breakers)
	c.JSON(http.StatusOK, breakers)
}

func (h *TrafficHandler) CreateCircuitBreaker(c *gin.Context) {
	var breaker model.CircuitBreaker
	if err := c.ShouldBindJSON(&breaker); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	breaker.State = "closed"
	if err := h.DB.Create(&breaker).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create circuit breaker"})
		return
	}
	c.JSON(http.StatusCreated, breaker)
}

func (h *TrafficHandler) UpdateCircuitBreaker(c *gin.Context) {
	id := c.Param("id")
	var breaker model.CircuitBreaker
	if err := h.DB.First(&breaker, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "circuit breaker not found"})
		return
	}
	if err := c.ShouldBindJSON(&breaker); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Save(&breaker)
	c.JSON(http.StatusOK, breaker)
}

func (h *TrafficHandler) DeleteCircuitBreaker(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&model.CircuitBreaker{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete circuit breaker"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "circuit breaker deleted"})
}

func (h *TrafficHandler) ResetCircuitBreaker(c *gin.Context) {
	id := c.Param("id")
	var breaker model.CircuitBreaker
	if err := h.DB.First(&breaker, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "circuit breaker not found"})
		return
	}
	breaker.State = "closed"
	breaker.FailureCount = 0
	breaker.LastFailureAt = nil
	h.DB.Save(&breaker)
	c.JSON(http.StatusOK, breaker)
}

// =================== Traffic Stats ===================

func (h *TrafficHandler) GetTrafficStats(c *gin.Context) {
	var ruleCount int64
	h.DB.Model(&model.TrafficRule{}).Where("status = ?", "active").Count(&ruleCount)

	var abTestCount int64
	h.DB.Model(&model.ABTest{}).Where("status = ?", "running").Count(&abTestCount)

	var rateLimitCount int64
	h.DB.Model(&model.RateLimit{}).Where("status = ?", "active").Count(&rateLimitCount)

	var breakerOpenCount int64
	h.DB.Model(&model.CircuitBreaker{}).Where("state = ?", "open").Count(&breakerOpenCount)

	c.JSON(http.StatusOK, gin.H{
		"active_rules":       ruleCount,
		"running_ab_tests":   abTestCount,
		"active_rate_limits": rateLimitCount,
		"open_breakers":      breakerOpenCount,
	})
}
