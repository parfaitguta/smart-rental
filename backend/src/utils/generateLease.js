import PDFDocument from 'pdfkit'

export const generateLeasePDF = (res, data) => {
  const {
    lease_number, tenant_name, tenant_phone, tenant_email,
    landlord_name, landlord_phone, landlord_email,
    property_title, property_location,
    start_date, end_date, monthly_rent,
    payment_method, payment_due_day
  } = data

  const doc = new PDFDocument({ margin: 60, size: 'A4' })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename=lease-${lease_number}.pdf`)
  doc.pipe(res)

  // ─── HEADER ───────────────────────────────────────────
  doc.rect(0, 0, 595, 110).fill('#1d4ed8')

  doc.fill('white')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('Smart Rental RW', 60, 30)

  doc.fontSize(10)
    .font('Helvetica')
    .text('Rental Management System — Rwanda', 60, 58)
    .text('www.smartrental.rw', 60, 73)

  doc.fontSize(16)
    .font('Helvetica-Bold')
    .text('LEASE AGREEMENT', 350, 38, { align: 'right' })

  doc.fontSize(9)
    .font('Helvetica')
    .text(`Lease #: ${lease_number}`, 350, 62, { align: 'right' })
    .text(`Generated: ${new Date().toLocaleDateString('en-RW')}`, 350, 76, { align: 'right' })

  // ─── TITLE ────────────────────────────────────────────
  doc.fill('#111827')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('RESIDENTIAL TENANCY AGREEMENT', 60, 130, { align: 'center' })

  doc.moveTo(60, 152).lineTo(535, 152).stroke('#e5e7eb')

  // ─── INTRO ────────────────────────────────────────────
  doc.fill('#374151')
    .fontSize(10)
    .font('Helvetica')
    .text(
      `This Residential Tenancy Agreement ("Agreement") is entered into on ${new Date().toLocaleDateString('en-RW', { day: 'numeric', month: 'long', year: 'numeric' })} between the Landlord and Tenant named below, for the rental of the property described herein, subject to the terms and conditions set forth in this Agreement.`,
      60, 165, { width: 475, lineGap: 3 }
    )

  // ─── PARTIES ──────────────────────────────────────────
  const sectionY = 220

  // Landlord box
  doc.rect(60, sectionY, 220, 110).fill('#f8fafc').stroke('#e2e8f0')
  doc.fill('#1d4ed8')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('LANDLORD (LESSOR)', 70, sectionY + 10)

  doc.fill('#111827')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(landlord_name, 70, sectionY + 26)

  doc.fill('#374151')
    .fontSize(9)
    .font('Helvetica')
    .text(`Phone: ${landlord_phone}`, 70, sectionY + 43)
    .text(`Email: ${landlord_email || 'N/A'}`, 70, sectionY + 57)

  // Tenant box
  doc.rect(315, sectionY, 220, 110).fill('#f8fafc').stroke('#e2e8f0')
  doc.fill('#1d4ed8')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('TENANT (LESSEE)', 325, sectionY + 10)

  doc.fill('#111827')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(tenant_name, 325, sectionY + 26)

  doc.fill('#374151')
    .fontSize(9)
    .font('Helvetica')
    .text(`Phone: ${tenant_phone}`, 325, sectionY + 43)
    .text(`Email: ${tenant_email || 'N/A'}`, 325, sectionY + 57)

  // ─── PROPERTY DETAILS ─────────────────────────────────
  const propY = sectionY + 125

  doc.fill('#111827')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('1. PROPERTY DETAILS', 60, propY)

  doc.moveTo(60, propY + 16).lineTo(535, propY + 16).stroke('#e5e7eb')

  doc.fill('#374151')
    .fontSize(10)
    .font('Helvetica')
    .text(`Property Name: ${property_title}`, 60, propY + 26)
    .text(`Location: ${property_location}`, 60, propY + 42)

  // ─── TERM ─────────────────────────────────────────────
  const termY = propY + 75

  doc.fill('#111827')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('2. TERM OF TENANCY', 60, termY)

  doc.moveTo(60, termY + 16).lineTo(535, termY + 16).stroke('#e5e7eb')

  doc.fill('#374151')
    .fontSize(10)
    .font('Helvetica')
    .text(`Start Date: ${start_date}`, 60, termY + 26)
    .text(`End Date: ${end_date || 'Month-to-Month (No Fixed End Date)'}`, 60, termY + 42)
    .text(
      `This Agreement shall commence on the Start Date and continue until the End Date, unless terminated earlier in accordance with the terms herein.`,
      60, termY + 58, { width: 475, lineGap: 2 }
    )

  // ─── RENT ─────────────────────────────────────────────
  const rentY = termY + 105

  doc.fill('#111827')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('3. RENT & PAYMENT', 60, rentY)

  doc.moveTo(60, rentY + 16).lineTo(535, rentY + 16).stroke('#e5e7eb')

  // Rent box
  doc.rect(60, rentY + 26, 475, 50).fill('#eff6ff').stroke('#bfdbfe')
  doc.fill('#1d4ed8')
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(`RWF ${parseInt(monthly_rent).toLocaleString()} / month`, 60, rentY + 38, { align: 'center', width: 475 })

  doc.fill('#374151')
    .fontSize(10)
    .font('Helvetica')
    .text(`Payment Method: ${payment_method || 'Cash / Mobile Money (MTN MoMo / Airtel Money)'}`, 60, rentY + 88)
    .text(`Payment Due: On or before the ${payment_due_day || '5th'} day of each month`, 60, rentY + 104)

  // ─── OBLIGATIONS ──────────────────────────────────────
  const obligY = rentY + 130

  doc.fill('#111827')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('4. OBLIGATIONS OF TENANT', 60, obligY)

  doc.moveTo(60, obligY + 16).lineTo(535, obligY + 16).stroke('#e5e7eb')

  const tenantObligations = [
    'Pay rent on time as specified in this Agreement.',
    'Keep the property clean and in good condition.',
    'Not sublease the property without written consent from the Landlord.',
    'Report any damages or maintenance issues to the Landlord promptly.',
    'Not engage in illegal activities on the premises.',
    'Allow Landlord access for inspections with reasonable notice.',
    'Return the property in the same condition as received upon vacating.'
  ]

  tenantObligations.forEach((item, i) => {
    doc.fill('#374151')
      .fontSize(9)
      .font('Helvetica')
      .text(`${i + 1}. ${item}`, 65, obligY + 26 + (i * 14), { width: 465 })
  })

  // ─── NEW PAGE ─────────────────────────────────────────
  doc.addPage()

  // ─── LANDLORD OBLIGATIONS ─────────────────────────────
  doc.fill('#111827')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('5. OBLIGATIONS OF LANDLORD', 60, 60)

  doc.moveTo(60, 76).lineTo(535, 76).stroke('#e5e7eb')

  const landlordObligations = [
    'Provide the Tenant with a habitable and safe property.',
    'Maintain the structural integrity of the property.',
    'Ensure water, electricity and other utilities are functional.',
    'Give at least 24 hours notice before entering the property.',
    'Handle maintenance requests within a reasonable timeframe.',
    'Provide receipts for all rent payments upon request.'
  ]

  landlordObligations.forEach((item, i) => {
    doc.fill('#374151')
      .fontSize(9)
      .font('Helvetica')
      .text(`${i + 1}. ${item}`, 65, 86 + (i * 14), { width: 465 })
  })

  // ─── TERMINATION ──────────────────────────────────────
  doc.fill('#111827')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('6. TERMINATION', 60, 190)

  doc.moveTo(60, 206).lineTo(535, 206).stroke('#e5e7eb')

  doc.fill('#374151')
    .fontSize(9)
    .font('Helvetica')
    .text(
      'Either party may terminate this Agreement by providing at least 30 days written notice to the other party. In cases of breach of agreement, the Landlord may terminate with immediate effect after proper notice. The Tenant shall vacate the property and return all keys upon termination.',
      60, 216, { width: 475, lineGap: 3 }
    )

  // ─── DISPUTE RESOLUTION ───────────────────────────────
  doc.fill('#111827')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('7. DISPUTE RESOLUTION', 60, 280)

  doc.moveTo(60, 296).lineTo(535, 296).stroke('#e5e7eb')

  doc.fill('#374151')
    .fontSize(9)
    .font('Helvetica')
    .text(
      'Any disputes arising from this Agreement shall first be resolved through mutual discussion. If unresolved, disputes shall be submitted to the relevant local authority or court of law in Rwanda having jurisdiction over such matters.',
      60, 306, { width: 475, lineGap: 3 }
    )

  // ─── GOVERNING LAW ────────────────────────────────────
  doc.fill('#111827')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('8. GOVERNING LAW', 60, 360)

  doc.moveTo(60, 376).lineTo(535, 376).stroke('#e5e7eb')

  doc.fill('#374151')
    .fontSize(9)
    .font('Helvetica')
    .text(
      'This Agreement shall be governed by and construed in accordance with the laws of the Republic of Rwanda, including relevant provisions of the law governing lease agreements and tenancy.',
      60, 386, { width: 475, lineGap: 3 }
    )

  // ─── SIGNATURES ───────────────────────────────────────
  doc.fill('#111827')
    .fontSize(11)
    .font('Helvetica-Bold')
    .text('9. SIGNATURES', 60, 440)

  doc.moveTo(60, 456).lineTo(535, 456).stroke('#e5e7eb')

  doc.fill('#374151')
    .fontSize(9)
    .font('Helvetica')
    .text(
      'By signing below, both parties agree to the terms and conditions of this Lease Agreement.',
      60, 466, { width: 475 }
    )

  // Landlord signature block
  doc.rect(60, 490, 210, 80).stroke('#e5e7eb')
  doc.fill('#374151')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('LANDLORD SIGNATURE', 65, 498)
  doc.font('Helvetica')
    .text(`Name: ${landlord_name}`, 65, 515)
    .text('Signature: ___________________', 65, 530)
    .text(`Date: ___________________`, 65, 548)

  // Tenant signature block
  doc.rect(325, 490, 210, 80).stroke('#e5e7eb')
  doc.fill('#374151')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('TENANT SIGNATURE', 330, 498)
  doc.font('Helvetica')
    .text(`Name: ${tenant_name}`, 330, 515)
    .text('Signature: ___________________', 330, 530)
    .text(`Date: ___________________`, 330, 548)

  // ─── WITNESS ──────────────────────────────────────────
  doc.fill('#374151')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('WITNESS (Optional)', 60, 590)

  doc.font('Helvetica')
    .text('Name: ___________________________', 60, 606)
    .text('Signature: ___________________________', 60, 622)
    .text('Date: ___________________________', 60, 638)

  // ─── FOOTER ───────────────────────────────────────────
  doc.rect(0, 770, 595, 72).fill('#f8fafc')
  doc.moveTo(0, 770).lineTo(595, 770).stroke('#e5e7eb')

  doc.fill('#6b7280')
    .fontSize(8)
    .font('Helvetica')
    .text(
      `Lease Agreement #${lease_number} | Generated by Smart Rental RW | www.smartrental.rw`,
      60, 782, { align: 'center', width: 475 }
    )
    .text(
      'This document is legally binding once signed by both parties.',
      60, 796, { align: 'center', width: 475 }
    )

  doc.end()
}