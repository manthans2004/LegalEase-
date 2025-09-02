const LegalTemplate = require('../models/LegalTemplate');
const mongoose = require('mongoose');

const sampleTemplates = [
  {
    name: "rental_agreement",
    category: "agreement",
    description: "Standard residential rental agreement",
    template: `RENTAL AGREEMENT

This Rental Agreement is made on {{date}} between:

LANDLORD:
Name: {{landlord_name}}
Address: {{landlord_address}}
Phone: {{landlord_phone}}

TENANT:
Name: {{tenant_name}}
Address: {{tenant_address}}
Phone: {{tenant_phone}}

PROPERTY:
Address: {{property_address}}
Type: {{property_type}}
Rent: ₹{{monthly_rent}} per month
Security Deposit: ₹{{security_deposit}}

TERMS:
1. The tenant shall pay rent monthly on the {{rent_due_day}} of each month.
2. The security deposit shall be refundable upon termination of this agreement.
3. This agreement is valid from {{start_date}} to {{end_date}}.

Signed by both parties on {{signature_date}}.

Landlord Signature: _________________
Tenant Signature: ___________________`,

    variables: [
      { name: 'date', label: 'Agreement Date', type: 'date', required: true },
      { name: 'landlord_name', label: 'Landlord Name', type: 'text', required: true },
      { name: 'landlord_address', label: 'Landlord Address', type: 'address', required: true },
      { name: 'landlord_phone', label: 'Landlord Phone', type: 'text', required: true },
      { name: 'tenant_name', label: 'Tenant Name', type: 'text', required: true },
      { name: 'tenant_address', label: 'Tenant Address', type: 'address', required: true },
      { name: 'tenant_phone', label: 'Tenant Phone', type: 'text', required: true },
      { name: 'property_address', label: 'Property Address', type: 'address', required: true },
      { name: 'property_type', label: 'Property Type', type: 'text', required: true },
      { name: 'monthly_rent', label: 'Monthly Rent', type: 'number', required: true },
      { name: 'security_deposit', label: 'Security Deposit', type: 'number', required: true },
      { name: 'rent_due_day', label: 'Rent Due Day', type: 'text', required: true },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'end_date', label: 'End Date', type: 'date', required: true },
      { name: 'signature_date', label: 'Signature Date', type: 'date', required: true }
    ]
  },
  {
    name: "affidavit",
    category: "affidavit",
    description: "General purpose affidavit",
    template: `AFFIDAVIT

I, {{affiant_name}}, son/daughter of {{father_name}}, residing at {{affiant_address}}, do hereby solemnly affirm and declare as under:

1. That the contents of this affidavit are true and correct to the best of my knowledge and belief.
2. That {{statement_of_facts}}
3. That this affidavit is made for {{purpose}}.

I solemnly affirm that this declaration is true and that no part of it is false.

Date: {{date}}
Place: {{place}}

Deponent Signature: _________________
Name: {{affiant_name}}
Address: {{affiant_address}}`,

    variables: [
      { name: 'affiant_name', label: 'Your Full Name', type: 'text', required: true },
      { name: 'father_name', label: "Father's Name", type: 'text', required: true },
      { name: 'affiant_address', label: 'Your Address', type: 'address', required: true },
      { name: 'statement_of_facts', label: 'Statement of Facts', type: 'text', required: true },
      { name: 'purpose', label: 'Purpose of Affidavit', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'place', label: 'Place', type: 'text', required: true }
    ]
  }
];

async function seedTemplates() {
  try {
    await LegalTemplate.deleteMany({});
    await LegalTemplate.insertMany(sampleTemplates);
    console.log('✅ Legal templates seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => seedTemplates())
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedTemplates;