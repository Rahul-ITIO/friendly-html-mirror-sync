//This Java class, BankStatementDownloader, is designed to generate and export a PDF bank statement for a list of bank transactions. It uses the iText library (specifically, the old version of iText, com.lowagie.text package) to create the PDF document

package com.webapp.utility;

import java.awt.Color;
import java.io.IOException;
import java.util.List;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.VerticalPositionMark;
import com.webapp.entity.BankAccountTransaction;

import jakarta.servlet.http.HttpServletResponse;

public class BankStatementDownloader {
	
	private List<BankAccountTransaction> transactions;
	
	private String startDate;
	
	private String endDate;
	
	// Default constructor
	public BankStatementDownloader() {
		
	}
        // Parameterized constructor to initialize transactions and date range
	public BankStatementDownloader(List<BankAccountTransaction> transactions, String startDate, String enddate) {
		super();
		this.transactions = transactions;
		this.startDate = startDate;
		this.endDate = enddate;
	}
	
        // Method to write the table header in the PDF
	private void writeTableHeader(PdfPTable table) {
		PdfPCell cell = new PdfPCell();
		cell.setBackgroundColor(new Color(253, 240, 213));
		cell.setPadding(5);
		
                // Define font style for header cells
		Font font = FontFactory.getFont(FontFactory.HELVETICA);
		font.setColor(new Color(31, 53, 65));
		
                // Add header cells to the table
		cell.setPhrase(new Phrase("Transaction Id", font));
		table.addCell(cell);

		cell.setPhrase(new Phrase("Transaction Type", font));
		table.addCell(cell);
		
		cell.setPhrase(new Phrase("Amount", font));
		table.addCell(cell);
		
		cell.setPhrase(new Phrase("Beneficiary Account", font));
		table.addCell(cell);
		
		cell.setPhrase(new Phrase("Narration", font));
		table.addCell(cell);
		
		cell.setPhrase(new Phrase("Transaction Time", font));
		table.addCell(cell);

	}
	
        // Method to write transaction data into the PDF table
	private void writeTableData(PdfPTable table) {
		for (BankAccountTransaction transaction : transactions) {
			// Add transaction details to the table
			table.addCell(transaction.getTransactionId());
			table.addCell(transaction.getType());
			table.addCell(String.valueOf(transaction.getAmount()));
			table.addCell(transaction.getDestinationBankAccount() != null ? transaction.getDestinationBankAccount().getNumber() : "--" );
			table.addCell(transaction.getNarration());
			table.addCell(DateTimeUtils.getProperDateTimeFormatFromEpochTime(transaction.getTransactionTime()));
		}
	}
         // Method to generate and export the PDF document
	public void export(HttpServletResponse response) throws DocumentException, IOException {
		Document document = new Document(PageSize.A4); // Create a new document with A4 page size
		
                 // Initialize PdfWriter to write the document to the HTTP response output stream
		PdfWriter.getInstance(document, response.getOutputStream());
		document.open();
		// Add company logo to the document
		Image image = Image.getInstance("classpath:images/logo.png");
		image.scalePercent(8.0f, 8.0f);
		document.add(image);
		
                 // Add a centered header for the bank statement
		Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
		headerFont.setSize(25);
		headerFont.setColor(new Color(120, 0, 0));
		Paragraph pHeader = new Paragraph("Customer Bank Statement\n", headerFont);
		pHeader.setAlignment(Paragraph.ALIGN_CENTER);
		document.add(pHeader);
		
                 // Add a section for bank details with a left-aligned header
		Font fontP = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
		fontP.setSize(18);
		fontP.setColor(new Color(120, 0, 0));
		Chunk glue = new Chunk(new VerticalPositionMark());
		Paragraph pp = new Paragraph("\nBank Details", fontP);
		pp.add(new Chunk(glue));
		pp.add("Bank Account Details:");
		document.add(pp);
		
                // Add bank details
		Font fontN = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
		fontN.setSize(12);
		fontN.setColor(Color.BLACK);
		Chunk glueN = new Chunk(new VerticalPositionMark());
		Paragraph pN = new Paragraph(
				"Bank Name: " + transactions.get(0).getBank().getName(), fontN);
		pN.add(new Chunk(glueN));
		pN.add("Account No.: " + transactions.get(0).getBankAccount().getNumber());
		document.add(pN);
		
                // Add additional bank details
		Font fontA = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
		fontA.setSize(12);
		fontA.setColor(Color.BLACK);
		Chunk glueA = new Chunk(new VerticalPositionMark());
		Paragraph pA = new Paragraph("Bank Code: " + transactions.get(0).getBank().getCode(),
				fontA);
		pA.add(new Chunk(glueA));
		pA.add("Ifsc Code: " + transactions.get(0).getBankAccount().getIfscCode());
		document.add(pA);
		
		// Add more bank details
		Font fontC = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
		fontC.setSize(12);
		fontC.setColor(Color.BLACK);
		Chunk glueC = new Chunk(new VerticalPositionMark());
		Paragraph pC = new Paragraph("Bank Email: " + transactions.get(0).getBank().getEmail(),
				fontC);
		pC.add(new Chunk(glueC));
		pC.add("Mobile No: " + transactions.get(0).getUser().getContact());
		document.add(pC);

		
                 // Add a section for bank transactions with a centered header
		Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
		font.setSize(22);
		font.setColor(new Color(120, 0, 0));
		Paragraph p = new Paragraph("\nBank Transactions\n", font);
		p.setAlignment(Paragraph.ALIGN_CENTER);
		document.add(p);
		
		// Add statement date range
		Font fontStatementRange = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
		fontStatementRange.setSize(14);
		fontStatementRange.setColor(new Color(120, 0, 0));
		Paragraph pStatementRange = new Paragraph("\nBank Statement from "+startDate+" to "+endDate+" \n", fontStatementRange);
		pStatementRange.setAlignment(Paragraph.ALIGN_LEFT);
		document.add(pStatementRange);
		
                // Close the document to complete the PDF generation
		PdfPTable table = new PdfPTable(6);
		table.setWidthPercentage(100f);
		table.setWidths(new float[] { 2.0f, 2.0f, 1.5f, 2.0f, 3.1f, 3.2f });
		table.setSpacingBefore(10);
		
                // Write the table header and data
		writeTableHeader(table);
		writeTableData(table);

		document.add(table); // Add the table to the document
		
		document.close();// Close the document to complete the PDF generation

	}

}
