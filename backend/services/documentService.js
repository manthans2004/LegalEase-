const LegalTemplate = require('../models/LegalTemplate');

class DocumentService {
  async getAllTemplates() {
    try {
      return await LegalTemplate.find({ isActive: true }).select('-template');
    } catch (error) {
      throw new Error('Failed to fetch templates');
    }
  }

  async getTemplateById(templateId) {
    try {
      return await LegalTemplate.findById(templateId);
    } catch (error) {
      throw new Error('Template not found');
    }
  }

  async generateDocument(templateId, variables) {
    try {
      const template = await LegalTemplate.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Validate required variables
      const missingVariables = template.variables
        .filter(v => v.required && !variables[v.name])
        .map(v => v.label);

      if (missingVariables.length > 0) {
        throw new Error(`Missing required fields: ${missingVariables.join(', ')}`);
      }

      // Generate document
      const generatedContent = template.generateDocument(variables);
      
      return {
        success: true,
        content: generatedContent,
        templateName: template.name,
        variables: template.variables
      };

    } catch (error) {
      throw new Error(`Document generation failed: ${error.message}`);
    }
  }

  // Extract variables from transcription (basic version)
  extractVariablesFromTranscription(transcriptionText) {
    // This is a simplified version - in real world, you'd use NLP here
    const variables = {};
    
    // Extract basic information patterns
    const patterns = {
      name: /(?:my name is|I am|name)(?:\s+is)?\s+([A-Za-z\s]+)/i,
      date: /(?:date|on)\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
      amount: /(?:₹|rs|rupees?)\s*(\d+,?\d*)/i,
      address: /(?:address|at|live in)\s+([A-Za-z0-9\s,.-]+)/i
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = transcriptionText.match(pattern);
      if (match) {
        variables[key] = match[1].trim();
      }
    }

    return variables;
  }
}

module.exports = new DocumentService();