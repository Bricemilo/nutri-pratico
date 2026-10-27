# Leitor de texto (OCR) usado em "Escanear tabela nutricional"

Arquivos hospedados junto com o app para que a leitura aconteça no próprio aparelho, sem enviar fotos a servidores.

| Arquivo | Origem | Licença |
|---|---|---|
| `tesseract.min.js`, `worker.min.js` | tesseract.js 6.0.1 (npm) | Apache 2.0 |
| `core/tesseract-core-*.wasm.js` | tesseract.js-core 6.1.2 (npm), Tesseract OCR compilado em WebAssembly | Apache 2.0 |
| `lang/por.traineddata.gz` | @tesseract.js-data/por 4.0.0_best_int (modelo de português do projeto tesseract-ocr/tessdata_best) | Apache 2.0 |

O app só carrega estes arquivos quando a pessoa escolhe escanear uma tabela. O navegador baixa apenas um dos dois arquivos de `core/` (com ou sem SIMD).
