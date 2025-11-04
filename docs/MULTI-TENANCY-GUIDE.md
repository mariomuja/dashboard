# Multi-Tenancy & White-Label Guide

## 🏢 Multi-Tenancy Implementation

This KPI Dashboard supports full multi-tenancy with hierarchical organizations, white-labeling, and tenant isolation.

---

## 🌟 Features

### **Organization Hierarchy**
- Company → Division → Department → Team
- Unlimited nesting levels
- Parent-child relationships
- Isolated data per organization

### **White-Labeling**
- Custom logo upload
- Brand colors (primary & secondary)
- Company name customization
- Theme preferences (light/dark/auto)
- Real-time preview

### **Feature Control**
- Enable/disable features per organization
- Dashboards, exports, email reports
- Customization, AI insights
- Fine-grained permissions

### **Resource Limits**
- Max users per organization
- Max dashboards
- Data retention policies
- Storage quotas

---

## 🚀 Usage

### **Switch Organizations**

1. Click the organization selector in the header
2. See all available organizations
3. Click to switch
4. Branding applies automatically

### **Configure Branding**

1. Go to Admin → Branding
2. Upload logo (< 1MB, PNG/JPG)
3. Choose brand colors
4. Set company name
5. Select default theme
6. Preview changes
7. Save & apply

---

## 📊 Organization Structure Example

```
Acme Corporation (Company)
├── Sales Division
│   ├── North America Team
│   └── Europe Team
├── Marketing Division
│   ├── Digital Marketing
│   └── Content Team
└── Engineering Division
    ├── Frontend Team
    └── Backend Team
```

---

## 🎨 Branding Capabilities

### **Visual Customization**
- Logo in header and reports
- Primary color for buttons, links
- Secondary color for accents
- Company name in page title
- Theme preference

### **Example Configurations**

#### **Executive Dashboard**
```json
{
  "primaryColor": "#3b82f6",
  "secondaryColor": "#10b981",
  "companyName": "Acme Corporation",
  "theme": "auto"
}
```

#### **Sales Team**
```json
{
  "primaryColor": "#10b981",
  "secondaryColor": "#3b82f6",
  "companyName": "Sales Division",
  "theme": "light"
}
```

#### **Marketing Team**
```json
{
  "primaryColor": "#8b5cf6",
  "secondaryColor": "#ec4899",
  "companyName": "Marketing Team",
  "theme": "dark"
}
```

---

## 🔐 Data Isolation

### **Organization-Level Data**
- Each org has separate dashboard data
- User access limited to org membership
- No cross-org data leakage
- Audit trails per organization

### **Feature Flags**
```typescript
// Check if feature is enabled
orgService.hasFeature('dashboards')  // true/false
orgService.hasFeature('exports')     // true/false
orgService.hasFeature('emailReports')  // true/false
```

### **Resource Limits**
```typescript
// Check against limits
orgService.isWithinLimit('maxUsers', currentUserCount)
orgService.isWithinLimit('maxDashboards', dashboardCount)
```

---

## 💼 Enterprise Use Cases

### **Use Case 1: SaaS Platform**
- Each customer is an organization
- Isolated data and branding
- Different feature tiers
- Usage-based billing

### **Use Case 2: Large Corporation**
- Division-specific dashboards
- Department-level access
- Centralized administration
- Unified reporting

### **Use Case 3: Agency**
- One organization per client
- Client-branded dashboards
- Project-specific metrics
- White-label reports

---

## 🛠️ Technical Implementation

### **Organization Service**

```typescript
// Get current organization
const org = orgService.getCurrentOrganization();

// Switch organization
orgService.setOrganization('org-id');

// Check feature
if (orgService.hasFeature('exports')) {
  // Show export button
}

// Apply custom branding
orgService.updateBranding({
  primaryColor: '#6366f1',
  companyName: 'My Company'
});
```

### **Organization Model**

```typescript
interface Organization {
  id: string;
  name: string;
  parentId?: string;
  type: 'company' | 'division' | 'department' | 'team';
  settings: {
    branding: {
      logo?: string;
      primaryColor: string;
      secondaryColor: string;
      companyName: string;
      theme: 'light' | 'dark' | 'auto';
    };
    features: {
      dashboards: boolean;
      exports: boolean;
      emailReports: boolean;
      customization: boolean;
      aiInsights: boolean;
    };
    limits: {
      maxUsers: number;
      maxDashboards: number;
      dataRetentionDays: number;
      storageGB: number;
    };
  };
  members: string[];
  createdAt: Date;
}
```

---

## 📱 UI Components

### **Organization Selector**
- Dropdown in header
- Shows all accessible orgs
- Hierarchical display
- Active org highlighted
- One-click switching

### **Branding Settings Page**
- Logo upload with preview
- Color pickers
- Text inputs
- Live preview
- Save & apply

---

## 🎯 Material Design Integration

### **Beautiful Buttons**
- Text buttons (minimal)
- Outlined buttons (borders)
- Filled buttons (solid)
- Icon buttons (circular)
- Ripple effects
- Hover states

### **Clean UI**
- Minimal backgrounds
- Subtle borders
- Proper spacing
- Focus states
- Smooth transitions

---

## 🚀 Production Considerations

### **Database Schema**
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  parent_id UUID REFERENCES organizations(id),
  type VARCHAR(50),
  settings JSONB,
  created_at TIMESTAMP
);

CREATE TABLE organization_members (
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(50),
  PRIMARY KEY (org_id, user_id)
);
```

### **Security**
- Row-level security (RLS)
- Organization context in JWT
- API middleware for tenant isolation
- Audit logging per organization

### **Performance**
- Cache organization settings
- Index on parent_id for hierarchy
- Materialized views for reports
- CDN for logo assets

---

## 📊 Migration Path

### **Step 1: Single Tenant → Multi-Tenant**
1. Create root organization
2. Migrate existing data
3. Assign all users to root org
4. Test isolation

### **Step 2: Add Child Organizations**
1. Create divisions/departments
2. Migrate users to appropriate orgs
3. Set up feature flags
4. Configure branding

### **Step 3: Enable White-Labeling**
1. Allow logo uploads
2. Enable color customization
3. Set up domain mapping (optional)
4. Test email branding

---

## 🔍 Troubleshooting

### **Branding Not Applying?**
1. Check organization is selected
2. Clear browser cache
3. Verify CSS variables are set
4. Check localStorage

### **Can't Switch Organizations?**
1. Verify user is member of target org
2. Check authentication
3. Refresh organization list
4. Check console for errors

### **Logo Not Showing?**
1. Check file size < 1MB
2. Verify image format (PNG/JPG)
3. Check localStorage space
4. Try different browser

---

## 📈 Future Enhancements

- [ ] Domain-based organization detection
- [ ] Custom CSS injection
- [ ] White-label email templates
- [ ] Organization-specific integrations
- [ ] Billing per organization
- [ ] Usage analytics per org
- [ ] SSO integration
- [ ] API keys per organization

---

**Status:** ✅ Multi-Tenancy & White-Label Complete  
**Last Updated:** November 3, 2025

