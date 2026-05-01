package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/stacklane/stacklane/internal/model"
)

type TenantHandler struct {
	DB *gorm.DB
}

// =================== Tenant CRUD ===================

func (h *TenantHandler) ListTenants(c *gin.Context) {
	var tenants []model.Tenant
	query := h.DB.Order("created_at DESC")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if name := c.Query("name"); name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	offset := (page - 1) * pageSize

	var total int64
	query.Model(&model.Tenant{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&tenants)

	c.JSON(http.StatusOK, gin.H{
		"data":      tenants,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *TenantHandler) GetTenant(c *gin.Context) {
	id := c.Param("id")
	var tenant model.Tenant
	if err := h.DB.First(&tenant, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "tenant not found"})
		return
	}
	c.JSON(http.StatusOK, tenant)
}

func (h *TenantHandler) CreateTenant(c *gin.Context) {
	var tenant model.Tenant
	if err := c.ShouldBindJSON(&tenant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	tenant.Status = "active"
	if err := h.DB.Create(&tenant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create tenant"})
		return
	}
	c.JSON(http.StatusCreated, tenant)
}

func (h *TenantHandler) UpdateTenant(c *gin.Context) {
	id := c.Param("id")
	var tenant model.Tenant
	if err := h.DB.First(&tenant, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "tenant not found"})
		return
	}
	if err := c.ShouldBindJSON(&tenant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.DB.Save(&tenant)
	c.JSON(http.StatusOK, tenant)
}

func (h *TenantHandler) DeleteTenant(c *gin.Context) {
	id := c.Param("id")
	// Check if tenant has active members
	var memberCount int64
	h.DB.Model(&model.User{}).Where("tenant_id = ?", id).Count(&memberCount)
	if memberCount > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "cannot delete tenant with active members"})
		return
	}
	if err := h.DB.Delete(&model.Tenant{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete tenant"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "tenant deleted"})
}

// =================== Quota Management ===================

func (h *TenantHandler) GetQuota(c *gin.Context) {
	id := c.Param("id")
	var tenant model.Tenant
	if err := h.DB.First(&tenant, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "tenant not found"})
		return
	}

	// Count usage
	var serviceCount int64
	h.DB.Model(&model.Service{}).Where("tenant_id = ?", id).Count(&serviceCount)

	var modelCount int64
	h.DB.Model(&model.ModelAsset{}).Where("tenant_id = ?", id).Count(&modelCount)

	var memberCount int64
	h.DB.Model(&model.User{}).Where("tenant_id = ?", id).Count(&memberCount)

	c.JSON(http.StatusOK, gin.H{
		"tenant_id":       tenant.ID,
		"tenant_name":     tenant.Name,
		"gpu_quota":       tenant.Quota,
		"gpu_used":        serviceCount, // simplified
		"service_quota":   tenant.Quota * 2,
		"service_used":    serviceCount,
		"model_quota":     tenant.Quota * 5,
		"model_used":      modelCount,
		"member_quota":    tenant.Quota * 3,
		"member_used":     memberCount,
	})
}

func (h *TenantHandler) UpdateQuota(c *gin.Context) {
	id := c.Param("id")
	var tenant model.Tenant
	if err := h.DB.First(&tenant, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "tenant not found"})
		return
	}

	var req struct {
		Quota int `json:"quota"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tenant.Quota = req.Quota
	h.DB.Save(&tenant)
	c.JSON(http.StatusOK, tenant)
}

// =================== Member Management ===================

func (h *TenantHandler) ListMembers(c *gin.Context) {
	id := c.Param("id")
	var members []model.User
	query := h.DB.Where("tenant_id = ?", id).Order("created_at DESC")

	if role := c.Query("role"); role != "" {
		query = query.Where("role = ?", role)
	}

	query.Find(&members)

	// Remove passwords
	type SafeUser struct {
		ID        uint   `json:"id"`
		Username  string `json:"username"`
		Email     string `json:"email"`
		Role      string `json:"role"`
		TenantID  uint   `json:"tenant_id"`
		Locale    string `json:"locale"`
	}

	var safeMembers []SafeUser
	for _, m := range members {
		safeMembers = append(safeMembers, SafeUser{
			ID: m.ID, Username: m.Username, Email: m.Email,
			Role: m.Role, TenantID: m.TenantID, Locale: m.Locale,
		})
	}

	c.JSON(http.StatusOK, safeMembers)
}

func (h *TenantHandler) AddMember(c *gin.Context) {
	id := c.Param("id")
	tenantID, _ := strconv.ParseUint(id, 10, 32)

	var req struct {
		UserID uint   `json:"user_id" binding:"required"`
		Role   string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user model.User
	if err := h.DB.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	user.TenantID = uint(tenantID)
	user.Role = req.Role
	h.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{
		"message":   "member added",
		"user_id":   user.ID,
		"tenant_id": tenantID,
		"role":      req.Role,
	})
}

func (h *TenantHandler) RemoveMember(c *gin.Context) {
	memberID := c.Param("member_id")
	var user model.User
	if err := h.DB.First(&user, memberID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "member not found"})
		return
	}
	user.TenantID = 0
	h.DB.Save(&user)
	c.JSON(http.StatusOK, gin.H{"message": "member removed"})
}

func (h *TenantHandler) UpdateMemberRole(c *gin.Context) {
	memberID := c.Param("member_id")
	var user model.User
	if err := h.DB.First(&user, memberID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "member not found"})
		return
	}

	var req struct {
		Role string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.Role = req.Role
	h.DB.Save(&user)
	c.JSON(http.StatusOK, gin.H{"message": "role updated", "user_id": user.ID, "role": req.Role})
}

// =================== Tenant Stats ===================

func (h *TenantHandler) GetTenantStats(c *gin.Context) {
	var totalTenants int64
	h.DB.Model(&model.Tenant{}).Count(&totalTenants)

	var activeTenants int64
	h.DB.Model(&model.Tenant{}).Where("status = ?", "active").Count(&activeTenants)

	var totalMembers int64
	h.DB.Model(&model.User{}).Count(&totalMembers)

	c.JSON(http.StatusOK, gin.H{
		"total_tenants":  totalTenants,
		"active_tenants": activeTenants,
		"total_members":  totalMembers,
	})
}
