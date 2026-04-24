const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Product Model
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  image_url: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Inspection Model
const Inspection = sequelize.define('Inspection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  inspector_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT
  },
  image_url: {
    type: DataTypes.STRING
  },
  ai_analysis: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'inspections',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Defect Model
const Defect = sequelize.define('Defect', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inspection_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'inspections',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  defect_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('critical', 'high', 'medium', 'low'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  location: {
    type: DataTypes.STRING
  },
  image_url: {
    type: DataTypes.STRING
  },
  ai_analysis: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'defects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Inspection Report Model
const InspectionReport = sequelize.define('InspectionReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inspection_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'inspections',
      key: 'id'
    }
  },
  report_data: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'inspection_reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// AI Defect Classification Model
const DefectClassification = sequelize.define('DefectClassification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  defect_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'defects',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  defect_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  defect_description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sub_category: {
    type: DataTypes.STRING
  },
  confidence_score: {
    type: DataTypes.FLOAT
  },
  ai_analysis: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'defect_classifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Severity Score Model
const SeverityScore = sequelize.define('SeverityScore', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  defect_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'defects',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  issue_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issue_description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  severity_level: {
    type: DataTypes.ENUM('critical', 'high', 'medium', 'low'),
    allowNull: false
  },
  severity_score: {
    type: DataTypes.INTEGER
  },
  impact_analysis: {
    type: DataTypes.JSONB
  },
  ai_analysis: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'severity_scores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Root Cause Analysis Model
const RootCauseAnalysis = sequelize.define('RootCauseAnalysis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  defect_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'defects',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  problem_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  problem_description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  root_causes: {
    type: DataTypes.JSONB
  },
  contributing_factors: {
    type: DataTypes.JSONB
  },
  corrective_actions: {
    type: DataTypes.JSONB
  },
  preventive_measures: {
    type: DataTypes.JSONB
  },
  ai_analysis: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'root_cause_analyses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Trend Analysis Model
const TrendAnalysis = sequelize.define('TrendAnalysis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  trend_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  analysis_period: {
    type: DataTypes.STRING,
    allowNull: false
  },
  trend_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data_points: {
    type: DataTypes.JSONB
  },
  metrics: {
    type: DataTypes.JSONB
  },
  patterns: {
    type: DataTypes.JSONB
  },
  predictions: {
    type: DataTypes.JSONB
  },
  ai_analysis: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'trend_analyses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Quality Inspection Model
const QualityInspection = sequelize.define('QualityInspection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  inspection_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  batch_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  inspection_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  inspector_name: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'passed', 'failed', 'needs_review'),
    defaultValue: 'pending'
  },
  quality_score: {
    type: DataTypes.INTEGER
  },
  parameters: {
    type: DataTypes.JSONB
  },
  findings: {
    type: DataTypes.JSONB
  },
  ai_analysis: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'quality_inspections',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Packaging Optimization Model
const PackagingOptimization = sequelize.define('PackagingOptimization', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  optimization_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  current_packaging: {
    type: DataTypes.STRING,
    allowNull: false
  },
  product_dimensions: {
    type: DataTypes.JSONB
  },
  product_weight: {
    type: DataTypes.FLOAT
  },
  fragility_level: {
    type: DataTypes.STRING
  },
  shipping_requirements: {
    type: DataTypes.TEXT
  },
  optimization_goals: {
    type: DataTypes.JSONB
  },
  recommended_packaging: {
    type: DataTypes.JSONB
  },
  cost_analysis: {
    type: DataTypes.JSONB
  },
  environmental_impact: {
    type: DataTypes.JSONB
  },
  ai_analysis: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'packaging_optimizations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// AI Report Model
const AIReport = sequelize.define('AIReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  report_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  report_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  report_scope: {
    type: DataTypes.TEXT
  },
  include_data: {
    type: DataTypes.JSONB
  },
  executive_summary: {
    type: DataTypes.JSONB
  },
  sections: {
    type: DataTypes.JSONB
  },
  recommendations: {
    type: DataTypes.JSONB
  },
  ai_analysis: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'ai_reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
Product.hasMany(Inspection, { foreignKey: 'product_id', as: 'inspections' });
Inspection.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(Defect, { foreignKey: 'product_id', as: 'defects' });
Defect.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Inspection.hasMany(Defect, { foreignKey: 'inspection_id', as: 'defects' });
Defect.belongsTo(Inspection, { foreignKey: 'inspection_id', as: 'inspection' });

Inspection.hasMany(InspectionReport, { foreignKey: 'inspection_id', as: 'reports' });
InspectionReport.belongsTo(Inspection, { foreignKey: 'inspection_id', as: 'inspection' });

// New model associations
Defect.hasMany(DefectClassification, { foreignKey: 'defect_id', as: 'classifications' });
DefectClassification.belongsTo(Defect, { foreignKey: 'defect_id', as: 'defect' });
Product.hasMany(DefectClassification, { foreignKey: 'product_id', as: 'defect_classifications' });
DefectClassification.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Defect.hasMany(SeverityScore, { foreignKey: 'defect_id', as: 'severity_scores' });
SeverityScore.belongsTo(Defect, { foreignKey: 'defect_id', as: 'defect' });
Product.hasMany(SeverityScore, { foreignKey: 'product_id', as: 'severity_scores' });
SeverityScore.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Defect.hasMany(RootCauseAnalysis, { foreignKey: 'defect_id', as: 'root_cause_analyses' });
RootCauseAnalysis.belongsTo(Defect, { foreignKey: 'defect_id', as: 'defect' });
Product.hasMany(RootCauseAnalysis, { foreignKey: 'product_id', as: 'root_cause_analyses' });
RootCauseAnalysis.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(TrendAnalysis, { foreignKey: 'product_id', as: 'trend_analyses' });
TrendAnalysis.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(QualityInspection, { foreignKey: 'product_id', as: 'quality_inspections' });
QualityInspection.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(PackagingOptimization, { foreignKey: 'product_id', as: 'packaging_optimizations' });
PackagingOptimization.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(AIReport, { foreignKey: 'product_id', as: 'ai_reports' });
AIReport.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = {
  sequelize,
  User,
  Product,
  Inspection,
  Defect,
  InspectionReport,
  DefectClassification,
  SeverityScore,
  RootCauseAnalysis,
  TrendAnalysis,
  QualityInspection,
  PackagingOptimization,
  AIReport
};
