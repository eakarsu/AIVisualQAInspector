'use strict';
const router = require('express').Router();
const { sequelize } = require('../models');
const openRouter = require('../services/openrouter');

router.post('/quality-advice', async (req, res) => {
  try {
    const input = req.body || {};
    if (!input.productLine) return res.status(400).json({ error: 'productLine is required' });
    const result = await openRouter.makeRequest(
      `Assess this production-quality scenario and return valid JSON with summary, likelyDefects, inspectionPriorities, and nextActions: ${JSON.stringify(input)}`,
      'You are a manufacturing visual-quality analyst. Do not invent observations that are absent from the supplied scenario.'
    );
    await sequelize.query(
      `INSERT INTO visual_ai_results(user_id,tenant_id,feature_type,input_data,result,model_used)
       VALUES(:userId,:tenantId,'quality-advice',CAST(:input AS jsonb),CAST(:result AS jsonb),:model)`,
      { replacements: { userId: req.user.id, tenantId: req.user.tenantId, input: JSON.stringify(input), result: JSON.stringify(result), model: openRouter.model } }
    );
    res.json({ success: true, result, model: openRouter.model });
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

module.exports = router;
