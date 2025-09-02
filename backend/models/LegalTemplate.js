const mongoose = require('mongoose');

const LegalTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['agreement', 'affidavit', 'notice', 'contract', 'application']
  },
  description: {
    type: String,
    required: true
  },
  template: {
    type: String,
    required: true
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'date', 'number', 'address', 'person'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Example method to generate document
LegalTemplateSchema.methods.generateDocument = function(variables) {
  let generatedDoc = this.template;
  
  // Replace variables in template
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    generatedDoc = generatedDoc.replace(new RegExp(placeholder, 'g'), value || '');
  }
  
  return generatedDoc;
};

module.exports = mongoose.model('LegalTemplate', LegalTemplateSchema);