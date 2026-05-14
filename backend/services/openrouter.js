class OpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = 'anthropic/claude-3-5-sonnet-20241022';
    this.baseUrl = 'https://openrouter.ai/api/v1';
  }

  parseAIJson(text) {
    try { return JSON.parse(text); } catch (e) {}
    const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
    try { return JSON.parse(stripped); } catch (e) {}
    const start = text.indexOf('{'); const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) { try { return JSON.parse(text.slice(start, end + 1)); } catch (e) {} }
    return null;
  }

  async makeRequest(prompt, systemPrompt = null) {
    if (!this.apiKey || this.apiKey === 'your-openrouter-api-key-here') {
      throw new Error('OpenRouter API key not configured');
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI Visual QA Inspector'
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: 10000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from OpenRouter');
      }

      return this.parseJsonResponse(content);
    } catch (error) {
      console.error('OpenRouter request error:', error);
      throw error;
    }
  }

  parseJsonResponse(content) {
    const result = this.parseAIJson(content);
    if (result) return result;
    throw new Error('Failed to parse AI response as JSON');
  }

  // Defect Classification
  async classifyDefect(defectData) {
    const prompt = `You are an AI defect classification expert for manufacturing quality control.

Analyze the following defect and provide a detailed classification:

Defect Name: ${defectData.defect_name}
Description: ${defectData.defect_description}
Product: ${defectData.product_name || 'Not specified'}

Provide your analysis in the following JSON format:
{
  "classification": {
    "primary_category": "Category name (e.g., Surface Defect, Structural Defect, Electrical Defect, etc.)",
    "sub_category": "More specific classification",
    "defect_code": "Industry standard code if applicable"
  },
  "confidence_score": 85,
  "characteristics": {
    "type": "Type of defect",
    "nature": "Physical/Chemical/Electrical/etc.",
    "detectability": "Easy/Moderate/Difficult",
    "repeatability": "Isolated/Recurring/Systematic"
  },
  "severity_indication": "critical/high/medium/low",
  "affected_quality_aspects": ["List of quality aspects affected"],
  "potential_causes": ["List of potential causes"],
  "recommended_actions": ["List of recommended actions"],
  "similar_defects": ["List of similar defect types to watch for"],
  "quality_impact": {
    "functional_impact": "Description of functional impact",
    "aesthetic_impact": "Description of aesthetic impact",
    "safety_impact": "Description of safety impact"
  },
  "summary": "Brief summary of the classification"
}

Respond ONLY with valid JSON.`;

    const result = await this.makeRequest(prompt);
    return {
      success: true,
      analysis: result,
      model: this.model,
      timestamp: new Date().toISOString()
    };
  }

  // Severity Scoring
  async scoreSeverity(issueData) {
    const prompt = `You are an AI severity assessment expert for manufacturing quality control.

Analyze the following issue and provide a comprehensive severity score:

Issue Name: ${issueData.issue_name}
Description: ${issueData.issue_description}
Product: ${issueData.product_name || 'Not specified'}

Provide your analysis in the following JSON format:
{
  "severity_assessment": {
    "overall_score": 75,
    "severity_level": "critical/high/medium/low",
    "urgency_level": "immediate/urgent/normal/low"
  },
  "impact_analysis": {
    "safety_impact": {
      "score": 80,
      "description": "Description of safety impact"
    },
    "functional_impact": {
      "score": 70,
      "description": "Description of functional impact"
    },
    "financial_impact": {
      "score": 60,
      "description": "Description of financial impact"
    },
    "customer_impact": {
      "score": 65,
      "description": "Description of customer experience impact"
    },
    "production_impact": {
      "score": 55,
      "description": "Description of production line impact"
    }
  },
  "risk_factors": [
    {
      "factor": "Risk factor name",
      "weight": 0.3,
      "description": "Description"
    }
  ],
  "escalation_required": true,
  "escalation_level": "Level 1/2/3",
  "response_timeframe": "Immediate/24 hours/48 hours/1 week",
  "affected_stakeholders": ["List of stakeholders to notify"],
  "mitigation_priority": ["Ordered list of mitigation priorities"],
  "historical_context": "Context based on similar issues",
  "summary": "Brief summary of the severity assessment"
}

Respond ONLY with valid JSON.`;

    const result = await this.makeRequest(prompt);
    return {
      success: true,
      analysis: result,
      model: this.model,
      timestamp: new Date().toISOString()
    };
  }

  // Root Cause Analysis
  async analyzeRootCause(problemData) {
    const prompt = `You are an AI root cause analysis expert using methodologies like 5 Whys, Fishbone Diagram, and Fault Tree Analysis.

Analyze the following problem and identify root causes:

Problem Name: ${problemData.problem_name}
Description: ${problemData.problem_description}
Product: ${problemData.product_name || 'Not specified'}

Provide your analysis in the following JSON format:
{
  "root_cause_analysis": {
    "primary_root_cause": "The main root cause",
    "confidence_level": 85
  },
  "five_whys_analysis": [
    {
      "level": 1,
      "why": "First level why",
      "answer": "Answer to first why"
    }
  ],
  "contributing_factors": {
    "human_factors": ["List of human-related factors"],
    "machine_factors": ["List of machine-related factors"],
    "material_factors": ["List of material-related factors"],
    "method_factors": ["List of process/method factors"],
    "environment_factors": ["List of environmental factors"],
    "measurement_factors": ["List of measurement-related factors"]
  },
  "fishbone_categories": {
    "man": ["Personnel-related causes"],
    "machine": ["Equipment-related causes"],
    "material": ["Material-related causes"],
    "method": ["Process-related causes"],
    "measurement": ["Measurement-related causes"],
    "mother_nature": ["Environment-related causes"]
  },
  "corrective_actions": [
    {
      "action": "Action description",
      "priority": "high/medium/low",
      "responsible_party": "Who should implement",
      "timeline": "Implementation timeline",
      "expected_outcome": "Expected result"
    }
  ],
  "preventive_measures": [
    {
      "measure": "Preventive measure description",
      "implementation_cost": "low/medium/high",
      "effectiveness": "Expected effectiveness percentage"
    }
  ],
  "verification_methods": ["List of methods to verify root cause"],
  "lessons_learned": ["Key lessons from this analysis"],
  "summary": "Brief summary of the root cause analysis"
}

Respond ONLY with valid JSON.`;

    const result = await this.makeRequest(prompt);
    return {
      success: true,
      analysis: result,
      model: this.model,
      timestamp: new Date().toISOString()
    };
  }

  // Trend Analysis
  async analyzeTrends(trendData) {
    const prompt = `You are an AI trend analysis expert for manufacturing quality metrics.

Analyze the following trend data and provide insights:

Trend Name: ${trendData.trend_name}
Analysis Period: ${trendData.analysis_period}
Trend Type: ${trendData.trend_type}
Product: ${trendData.product_name || 'Not specified'}
Data Points: ${JSON.stringify(trendData.data_points || [])}

Provide your analysis in the following JSON format:
{
  "trend_analysis": {
    "trend_direction": "increasing/decreasing/stable/volatile",
    "trend_strength": "strong/moderate/weak",
    "confidence_level": 85
  },
  "statistical_analysis": {
    "mean": 0,
    "median": 0,
    "standard_deviation": 0,
    "variance": 0,
    "min": 0,
    "max": 0,
    "range": 0
  },
  "patterns_identified": [
    {
      "pattern_name": "Pattern name",
      "description": "Pattern description",
      "frequency": "Daily/Weekly/Monthly/etc.",
      "significance": "high/medium/low"
    }
  ],
  "anomalies_detected": [
    {
      "anomaly_type": "Type of anomaly",
      "description": "Description",
      "potential_cause": "Potential cause",
      "recommendation": "Recommended action"
    }
  ],
  "correlations": [
    {
      "factor": "Correlated factor",
      "correlation_strength": 0.75,
      "description": "Description of correlation"
    }
  ],
  "predictions": {
    "short_term": {
      "forecast": "Next period prediction",
      "confidence": 80
    },
    "medium_term": {
      "forecast": "Next quarter prediction",
      "confidence": 70
    },
    "long_term": {
      "forecast": "Next year prediction",
      "confidence": 60
    }
  },
  "recommendations": [
    {
      "recommendation": "Recommendation description",
      "priority": "high/medium/low",
      "expected_impact": "Expected impact"
    }
  ],
  "risk_indicators": ["List of risk indicators to monitor"],
  "summary": "Brief summary of the trend analysis"
}

Respond ONLY with valid JSON.`;

    const result = await this.makeRequest(prompt);
    return {
      success: true,
      analysis: result,
      model: this.model,
      timestamp: new Date().toISOString()
    };
  }

  // Quality Inspection
  async performQualityInspection(inspectionData) {
    const prompt = `You are an AI quality inspector for manufacturing operations.

Perform a comprehensive quality inspection based on the following information:

Inspection Name: ${inspectionData.inspection_name}
Product: ${inspectionData.product_name || 'Not specified'}
Batch Number: ${inspectionData.batch_number}
Inspection Type: ${inspectionData.inspection_type}
Parameters: ${JSON.stringify(inspectionData.parameters || {})}

Provide your inspection results in the following JSON format:
{
  "inspection_result": {
    "overall_status": "passed/failed/needs_review",
    "quality_score": 85,
    "grade": "A/B/C/D/F"
  },
  "parameter_results": [
    {
      "parameter": "Parameter name",
      "specification": "Expected value/range",
      "measured_value": "Measured/observed value",
      "status": "pass/fail/warning",
      "deviation": "Deviation from spec if any"
    }
  ],
  "quality_metrics": {
    "dimensional_accuracy": 95,
    "surface_quality": 90,
    "material_integrity": 92,
    "functional_performance": 88,
    "aesthetic_quality": 85
  },
  "findings": [
    {
      "finding_type": "observation/minor_issue/major_issue/critical",
      "description": "Description of finding",
      "location": "Location of finding",
      "recommendation": "Recommended action"
    }
  ],
  "compliance_check": {
    "standards_met": ["List of standards met"],
    "standards_not_met": ["List of standards not met"],
    "certifications_valid": true
  },
  "risk_assessment": {
    "quality_risk_level": "low/medium/high",
    "safety_risk_level": "low/medium/high",
    "production_risk_level": "low/medium/high"
  },
  "recommendations": [
    {
      "recommendation": "Recommendation",
      "priority": "high/medium/low",
      "category": "Quality/Safety/Process"
    }
  ],
  "next_steps": ["List of recommended next steps"],
  "summary": "Brief summary of the inspection"
}

Respond ONLY with valid JSON.`;

    const result = await this.makeRequest(prompt);
    return {
      success: true,
      analysis: result,
      model: this.model,
      timestamp: new Date().toISOString()
    };
  }

  // Packaging Optimization
  async optimizePackaging(packagingData) {
    const prompt = `You are an AI packaging optimization expert for manufacturing and logistics.

Optimize packaging based on the following product information:

Optimization Name: ${packagingData.optimization_name}
Product: ${packagingData.product_name || 'Not specified'}
Current Packaging: ${packagingData.current_packaging}
Dimensions: ${JSON.stringify(packagingData.product_dimensions || {})}
Weight: ${packagingData.product_weight || 'Not specified'} kg
Fragility Level: ${packagingData.fragility_level || 'Not specified'}
Shipping Requirements: ${packagingData.shipping_requirements || 'Standard'}
Optimization Goals: ${JSON.stringify(packagingData.optimization_goals || [])}

Provide your optimization analysis in the following JSON format:
{
  "optimization_summary": {
    "optimization_potential": "high/medium/low",
    "estimated_savings": "Percentage or amount",
    "implementation_complexity": "easy/moderate/complex"
  },
  "current_packaging_analysis": {
    "strengths": ["List of current packaging strengths"],
    "weaknesses": ["List of current packaging weaknesses"],
    "efficiency_score": 70
  },
  "recommended_packaging": {
    "primary_packaging": {
      "type": "Packaging type",
      "material": "Material recommendation",
      "dimensions": {
        "length": 0,
        "width": 0,
        "height": 0,
        "unit": "cm"
      },
      "features": ["List of features"]
    },
    "secondary_packaging": {
      "type": "Outer packaging type",
      "material": "Material recommendation",
      "quantity_per_unit": 1
    },
    "protective_elements": ["List of protective elements needed"],
    "labeling_requirements": ["List of labeling requirements"]
  },
  "cost_analysis": {
    "current_cost_per_unit": 0,
    "proposed_cost_per_unit": 0,
    "savings_per_unit": 0,
    "annual_savings_estimate": 0,
    "implementation_cost": 0,
    "payback_period": "X months"
  },
  "environmental_impact": {
    "current_footprint": "Description",
    "proposed_footprint": "Description",
    "recyclability": "Percentage recyclable",
    "sustainability_score": 75,
    "carbon_reduction": "Estimated reduction"
  },
  "logistics_optimization": {
    "units_per_pallet": 0,
    "pallets_per_container": 0,
    "shipping_efficiency_improvement": "Percentage",
    "storage_optimization": "Percentage"
  },
  "protection_analysis": {
    "drop_test_rating": "Rating",
    "vibration_resistance": "Rating",
    "moisture_protection": "Rating",
    "temperature_protection": "Rating"
  },
  "implementation_plan": [
    {
      "phase": "Phase name",
      "actions": ["List of actions"],
      "timeline": "Timeline",
      "resources_needed": ["List of resources"]
    }
  ],
  "risks_and_mitigations": [
    {
      "risk": "Risk description",
      "mitigation": "Mitigation strategy"
    }
  ],
  "summary": "Brief summary of the packaging optimization"
}

Respond ONLY with valid JSON.`;

    const result = await this.makeRequest(prompt);
    return {
      success: true,
      analysis: result,
      model: this.model,
      timestamp: new Date().toISOString()
    };
  }

  // Generate Report
  async generateReport(reportData) {
    const prompt = `You are an AI report generation expert for manufacturing quality control.

Generate a comprehensive report based on the following data:

Report Type: ${reportData.report_type}
Report Name: ${reportData.report_name}
Product: ${reportData.product_name || 'Not specified'}
Report Scope: ${reportData.report_scope || 'General quality report'}

Provide your report in the following JSON format:
{
  "report_header": {
    "title": "Report title",
    "report_type": "Type of report",
    "period_covered": "Period",
    "generated_date": "Date",
    "generated_by": "AI Report Generator"
  },
  "executive_summary": {
    "overview": "Brief overview",
    "key_findings": ["List of key findings"],
    "critical_issues": ["List of critical issues if any"],
    "achievements": ["List of achievements"]
  },
  "performance_metrics": {
    "overall_quality_score": 85,
    "defect_rate": "Percentage",
    "inspection_pass_rate": "Percentage",
    "customer_satisfaction": "Score/Percentage",
    "on_time_delivery": "Percentage"
  },
  "trend_analysis": {
    "quality_trend": "improving/stable/declining",
    "defect_trend": "Description",
    "production_trend": "Description"
  },
  "detailed_findings": [
    {
      "category": "Category name",
      "finding": "Finding description",
      "impact": "Impact level",
      "recommendation": "Recommendation"
    }
  ],
  "comparative_analysis": {
    "vs_previous_period": {
      "improvement_areas": ["List of improvements"],
      "decline_areas": ["List of declines"],
      "stable_areas": ["List of stable areas"]
    },
    "vs_targets": {
      "targets_met": ["List of met targets"],
      "targets_missed": ["List of missed targets"]
    }
  },
  "recommendations": [
    {
      "recommendation": "Recommendation",
      "priority": "high/medium/low",
      "expected_impact": "Expected impact",
      "timeline": "Implementation timeline"
    }
  ],
  "action_items": [
    {
      "action": "Action item",
      "responsible": "Responsible party",
      "deadline": "Deadline",
      "status": "pending/in_progress/completed"
    }
  ],
  "conclusion": "Conclusion paragraph",
  "appendices": {
    "data_sources": ["List of data sources"],
    "methodology": "Description of methodology used"
  }
}

Respond ONLY with valid JSON.`;

    const result = await this.makeRequest(prompt);
    return {
      success: true,
      analysis: result,
      model: this.model,
      timestamp: new Date().toISOString()
    };
  }

  // Image Analysis (existing functionality)
  getVisionPrompt() {
    return `You are a quality assurance inspector analyzing product images for defects.

Analyze this image and provide a detailed inspection report in the following JSON format:
{
  "status": "pass" or "fail",
  "confidence": 0-100 (percentage),
  "summary": "Brief overall assessment",
  "detected_issues": [
    {
      "type": "defect type (e.g., scratch, dent, discoloration, crack, misalignment)",
      "severity": "critical", "high", "medium", or "low",
      "location": "description of where the defect is located",
      "description": "detailed description of the issue"
    }
  ],
  "recommendations": [
    "actionable recommendation 1",
    "actionable recommendation 2"
  ],
  "quality_metrics": {
    "surface_quality": 0-100,
    "structural_integrity": 0-100,
    "color_consistency": 0-100,
    "dimensional_accuracy": 0-100
  }
}

If no defects are found, return status "pass" with an empty detected_issues array.
Respond ONLY with valid JSON, no additional text.`;
  }

  async makeVisionRequest(imageContent) {
    const prompt = this.getVisionPrompt();

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Visual QA Inspector'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: imageContent }
            ]
          }
        ],
        max_tokens: 10000,
        temperature: 0.2,
        provider: {
          order: ['Anthropic'],
          allow_fallbacks: true
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from OpenRouter');
    }

    const analysisResult = this.parseJsonResponse(content);
    return {
      success: true,
      analysis: analysisResult,
      model: this.model,
      timestamp: new Date().toISOString()
    };
  }

  async analyzeImage(imageBuffer, mimeType = 'image/jpeg') {
    if (!this.apiKey || this.apiKey === 'your-openrouter-api-key-here') {
      throw new Error('OpenRouter API key not configured');
    }

    // Limit image size to ~4MB base64 (roughly 3MB raw) to avoid API limits
    const MAX_RAW_SIZE = 3 * 1024 * 1024;
    let buffer = imageBuffer;
    if (buffer.length > MAX_RAW_SIZE) {
      // Downsample by reducing quality - re-encode as JPEG if possible
      try {
        const sharp = require('sharp');
        buffer = await sharp(imageBuffer)
          .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        mimeType = 'image/jpeg';
      } catch (e) {
        // sharp not available, truncate warning
        console.warn('Image is large and sharp is not installed for compression. Sending as-is.');
      }
    }

    const base64Image = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    try {
      return await this.makeVisionRequest({ url: dataUrl });
    } catch (error) {
      console.error('OpenRouter analysis error:', error);
      throw error;
    }
  }

  async analyzeImageFromUrl(imageUrl) {
    if (!this.apiKey || this.apiKey === 'your-openrouter-api-key-here') {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      return await this.makeVisionRequest({ url: imageUrl });
    } catch (error) {
      console.error('OpenRouter analysis error:', error);
      throw error;
    }
  }
}

module.exports = new OpenRouterService();
