package com.gastos.gastos_compartidos.service;

import com.gastos.gastos_compartidos.entity.Gasto;
import com.gastos.gastos_compartidos.repository.GastoRepository;
import com.gastos.gastos_compartidos.entity.Pareja;
import com.gastos.gastos_compartidos.entity.Usuario;
import com.gastos.gastos_compartidos.repository.ParejaRepository;
import com.gastos.gastos_compartidos.exception.ResourceNotFoundException;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExportService {

    private final GastoRepository gastoRepository;
    private final ParejaRepository parejaRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] generarPdfGastos(Long parejaId, LocalDate desde, LocalDate hasta) {
        Pareja pareja = parejaRepository.findById(parejaId)
                .orElseThrow(() -> new ResourceNotFoundException("Pareja no encontrada"));

        LocalDateTime inicio = desde.atStartOfDay();
        LocalDateTime fin = hasta.atTime(23, 59, 59);
        List<Gasto> gastos = gastoRepository.findByParejaidAndFechaRango(parejaId, inicio, fin);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);
        document.open();

        // Fuentes
        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(25, 118, 210));
        Font subtitleFont = new Font(Font.HELVETICA, 11, Font.NORMAL, new Color(100, 100, 100));
        Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
        Font cellFont = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(51, 51, 51));
        Font totalFont = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(25, 118, 210));

        // Título
        Paragraph title = new Paragraph("Gastos Compartidos", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph subtitle = new Paragraph(
                pareja.getNombrePareja() + " | " + desde.format(DATE_FMT) + " - " + hasta.format(DATE_FMT),
                subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(20);
        document.add(subtitle);

        // Tabla de gastos
        PdfPTable table = new PdfPTable(new float[]{3f, 1.5f, 2f, 2f, 2f});
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);

        // Headers
        String[] headers = {"Descripción", "Monto", "Categoría", "Registrado por", "Fecha"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(new Color(25, 118, 210));
            cell.setPadding(8);
            cell.setBorderWidth(0);
            table.addCell(cell);
        }

        // Filas
        BigDecimal total = BigDecimal.ZERO;
        boolean alternate = false;
        for (Gasto gasto : gastos) {
            Color bg = alternate ? new Color(245, 245, 245) : Color.WHITE;
            alternate = !alternate;

            addCell(table, gasto.getDescripcion(), cellFont, bg);
            addCell(table, "$" + gasto.getMonto().toPlainString(), cellFont, bg);
            addCell(table, gasto.getCategoria() != null ? gasto.getCategoria().getNombre() : "-", cellFont, bg);
            addCell(table, gasto.getUsuario().getNombre(), cellFont, bg);
            addCell(table, gasto.getFechaGasto().format(DATETIME_FMT), cellFont, bg);

            total = total.add(gasto.getMonto());
        }

        document.add(table);

        // Total
        Paragraph totalPara = new Paragraph(
                "\nTotal: $" + total.toPlainString() + "  (" + gastos.size() + " gastos)",
                totalFont);
        totalPara.setAlignment(Element.ALIGN_RIGHT);
        totalPara.setSpacingBefore(15);
        document.add(totalPara);

        // Footer
        Paragraph footer = new Paragraph(
                "\nGenerado el " + LocalDateTime.now().format(DATETIME_FMT),
                new Font(Font.HELVETICA, 8, Font.ITALIC, new Color(150, 150, 150)));
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(30);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    public byte[] generarExcelGastos(Long parejaId, LocalDate desde, LocalDate hasta) throws IOException {
        Pareja pareja = parejaRepository.findById(parejaId)
                .orElseThrow(() -> new ResourceNotFoundException("Pareja no encontrada"));

        LocalDateTime inicio = desde.atStartOfDay();
        LocalDateTime fin = hasta.atTime(23, 59, 59);
        List<Gasto> gastos = gastoRepository.findByParejaidAndFechaRango(parejaId, inicio, fin);

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Gastos");

            // Estilos
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFontPoi = workbook.createFont();
            headerFontPoi.setBold(true);
            headerFontPoi.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFontPoi);
            headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle moneyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            moneyStyle.setDataFormat(format.getFormat("#,##0"));

            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(format.getFormat("dd/mm/yyyy hh:mm"));

            CellStyle titleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFontPoi = workbook.createFont();
            titleFontPoi.setBold(true);
            titleFontPoi.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFontPoi);

            // Título
            org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(0);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Gastos Compartidos - " + pareja.getNombrePareja());
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

            org.apache.poi.ss.usermodel.Row periodRow = sheet.createRow(1);
            periodRow.createCell(0).setCellValue(
                    "Período: " + desde.format(DATE_FMT) + " - " + hasta.format(DATE_FMT));
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 5));

            // Headers
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(3);
            String[] headers = {"Descripción", "Monto", "Categoría", "Registrado por", "Fecha", "Notas"};
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Datos
            int rowNum = 4;
            BigDecimal total = BigDecimal.ZERO;
            for (Gasto gasto : gastos) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(gasto.getDescripcion());

                org.apache.poi.ss.usermodel.Cell montoCell = row.createCell(1);
                montoCell.setCellValue(gasto.getMonto().doubleValue());
                montoCell.setCellStyle(moneyStyle);

                row.createCell(2).setCellValue(
                        gasto.getCategoria() != null ? gasto.getCategoria().getNombre() : "-");
                row.createCell(3).setCellValue(gasto.getUsuario().getNombre());

                org.apache.poi.ss.usermodel.Cell dateCell = row.createCell(4);
                dateCell.setCellValue(gasto.getFechaGasto().format(DATETIME_FMT));

                row.createCell(5).setCellValue(gasto.getNotas() != null ? gasto.getNotas() : "");

                total = total.add(gasto.getMonto());
            }

            // Fila total
            org.apache.poi.ss.usermodel.Row totalRow = sheet.createRow(rowNum + 1);
            CellStyle totalStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font totalFontPoi = workbook.createFont();
            totalFontPoi.setBold(true);
            totalStyle.setFont(totalFontPoi);

            org.apache.poi.ss.usermodel.Cell totalLabelCell = totalRow.createCell(0);
            totalLabelCell.setCellValue("TOTAL (" + gastos.size() + " gastos)");
            totalLabelCell.setCellStyle(totalStyle);

            org.apache.poi.ss.usermodel.Cell totalMontoCell = totalRow.createCell(1);
            totalMontoCell.setCellValue(total.doubleValue());
            CellStyle totalMoneyStyle = workbook.createCellStyle();
            totalMoneyStyle.cloneStyleFrom(moneyStyle);
            totalMoneyStyle.setFont(totalFontPoi);
            totalMontoCell.setCellStyle(totalMoneyStyle);

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    private void addCell(PdfPTable table, String text, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        cell.setBorderWidth(0.5f);
        cell.setBorderColor(new Color(224, 224, 224));
        table.addCell(cell);
    }
}
